import { createClient } from "@/app/api/supabase/server";
import { ClassificationRecord } from "@/interfaces/hts";
import SharedClassificationClient from "@/components/SharedClassificationClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: { shareToken: string };
}

export default async function SharedClassificationPage({ params }: Props) {
  const supabase = createClient();

  const { data: classification, error } = await supabase
    .from("classifications")
    .select("*")
    .eq("share_token", params.shareToken)
    .eq("is_shared", true)
    .single<ClassificationRecord>();

  if (error || !classification) {
    notFound();
  }

  return <SharedClassificationClient classificationRecord={classification} />;
}
