"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/libs/supabase/client";
import {
  identifyUser,
  MixpanelEvent,
  registerMixpanelSuperProperties,
  resetUser,
  setUserPropertiesOnce,
  trackEvent,
} from "@/libs/mixpanel";
import { readFirstTouch } from "@/libs/signup-onboarding";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createSupabaseClient();

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // "Auth session missing" just means no one is logged in — not a real error. Keep Mixpanel's
        // anonymous id (no reset): resetting here gave every logged-out page load a new "user",
        // and broke the merge of a visitor's history into their account when they sign up
        if (error.message?.includes("Auth session missing")) {
          setUser(null);
          setError(null);
          registerMixpanelSuperProperties({ is_anonymous: true });
          return;
        }
        throw error;
      }

      setUser(user);
      setError(null);

      if (user) {
        // Links this browser's anonymous events (before sign-up or sign-in) to the account
        identifyUser(user.id, {
          email: user.email,
          $email: user.email, // Mixpanel's own field: shows the person by email in reports
          created_at: user.created_at,
        });
        registerMixpanelSuperProperties({ is_anonymous: false });
        // Where this person first came from, on their profile: so the server's Sign Up and
        // Purchase Completed can be broken down by source (only the first value is kept)
        const touch = readFirstTouch();
        if (touch)
          setUserPropertiesOnce({
            first_landing_path: touch.landing_path,
            first_referring_domain: touch.referring_domain,
            first_utm_source: touch.utm_source,
            first_utm_medium: touch.utm_medium,
            first_utm_campaign: touch.utm_campaign,
            first_utm_term: touch.utm_term,
            first_utm_content: touch.utm_content,
            first_seen_at: touch.at,
          });
      } else {
        registerMixpanelSuperProperties({ is_anonymous: true });
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      trackEvent(MixpanelEvent.SIGNED_OUT);
      setUser(null);
      setError(null);

      resetUser();
      registerMixpanelSuperProperties({ is_anonymous: true });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, isLoading, error, refreshUser, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
