"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/libs/supabase/client";
import { identifyUser, resetUser } from "@/libs/mixpanel";

// interface EnrichedUser extends User {
//   profile: UserProfile;
// }

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

      if (error) throw error;

      setUser(user);
      setError(null);

      // Identify user in Mixpanel
      if (user) {
        identifyUser(user.id, {
          email: user.email,
          created_at: user.created_at,
        });
      } else {
        resetUser();
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
      setUser(null);
      setError(null);

      // Reset user in Mixpanel
      resetUser();
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
