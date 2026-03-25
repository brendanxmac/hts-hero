"use client"

import { useEffect, useState } from "react"
import { fetchUser, UserProfile } from "../libs/supabase/user"
import { Importer } from "../interfaces/hts"
import {
  fetchImportersForUser,
  fetchImportersForTeam,
} from "../libs/supabase/importers"

/**
 * Hook to fetch user profile and importers
 */
export function useUserProfileAndImporters(userId: string | undefined) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [importers, setImporters] = useState<Importer[]>([])
  const [isLoadingImporters, setIsLoadingImporters] = useState(false)

  useEffect(() => {
    if (!userId) {
      setUserProfile(null)
      setImporters([])
      setIsLoadingImporters(false)
      return
    }

    const fetchData = async () => {
      setIsLoadingImporters(true)
      try {
        const profile = await fetchUser(userId)
        setUserProfile(profile || null)

        const fetchedImporters = profile?.team_id
          ? await fetchImportersForTeam(profile.team_id)
          : await fetchImportersForUser()
        setImporters(fetchedImporters)
      } catch (error) {
        console.error("Error fetching importers:", error)
      } finally {
        setIsLoadingImporters(false)
      }
    }

    fetchData()
  }, [userId])

  return { userProfile, importers, isLoadingImporters }
}
