"use client";

import { UserProfile } from "../libs/supabase/user";
import { TertiaryText } from "./TertiaryText";
import { useEffect, useState } from "react";
import { Tab } from "../interfaces/tab";
import { classNames } from "../utilities/style";
import { UserSettings } from "./UserSettings";
import { TeamSettings } from "./TeamSettings";
import { fetchTeam, Team } from "../libs/supabase/teams";

enum ProfileTab {
  PERSONAL = "personal",
  TEAM = "team",
}

const ProfileTabs: Tab[] = [
  {
    label: "Personal",
    value: ProfileTab.PERSONAL,
  },
  {
    label: "Team",
    value: ProfileTab.TEAM,
  },
];

interface Props {
  user: UserProfile;
}

export default function SettingsPage({ user }: Props) {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeamForUser = async () => {
      if (user.team_id) {
        const team = await fetchTeam(user.team_id);
        setTeam(team);
      }
    };
    fetchTeamForUser();
  }, [user]);
  const [activeTab, setActiveTab] = useState(ProfileTabs[0].value);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-2">
      <div className="w-full bg-base-100 rounded-lg border border-base-content/20 p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-4xl font-bold">Settings</h1>
              {/* <TertiaryText value="View & manage account information and preferences" /> */}
            </div>
          </div>
          {user.team_id && (
            <div
              role="tablist"
              className="tabs tabs-boxed tabs-sm md:tabs-md rounded-xl gap-1"
            >
              {ProfileTabs.map((tab) => (
                <a
                  key={tab.value}
                  role="tab"
                  onClick={() => setActiveTab(tab.value)}
                  className={classNames(
                    "tab transition-all duration-200 ease-in font-semibold",
                    tab.value === activeTab && "tab-active"
                  )}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={activeTab === ProfileTab.PERSONAL ? "" : "hidden"}>
          <UserSettings user={user} team={team} />
        </div>
        {team && (
          <div className={activeTab === ProfileTab.TEAM ? "" : "hidden"}>
            <TeamSettings user={user} team={team} />
          </div>
        )}
      </div>
    </div>
  );
}
