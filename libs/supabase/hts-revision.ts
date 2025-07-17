import { createClient } from "../../app/api/supabase/server";
import { SupabaseTables } from "../../constants/supabase";

export interface HtsRevision {
  id: string;
  name: string;
  created_at: string;
}

export const getHtsRevisionRecord = async (
  revision: string
): Promise<HtsRevision> => {
  const supabase = createClient();

  if (revision === "latest") {
    // get the first record descending by created_at in the hts_revisions table
    const { data: revisionInstance, error } = await supabase
      .from(SupabaseTables.HTS_REVISIONS)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single<HtsRevision>();

    if (error) {
      throw new Error(error.message);
    }

    return revisionInstance;
  }

  const { data: revisionInstance, error } = await supabase
    .from(SupabaseTables.HTS_REVISIONS)
    .select("*")
    .eq("name", revision)
    .single<HtsRevision>();

  if (error) {
    throw new Error(error.message);
  }

  return revisionInstance;
};
