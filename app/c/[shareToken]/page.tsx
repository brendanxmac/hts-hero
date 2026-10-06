import { createClient } from "@/app/api/supabase/server";
import { ClassificationRecord } from "@/interfaces/hts";
import SharedClassificationClient from "@/components/SharedClassificationClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import config from "@/config";
import { classificationExampleByToken } from "@/constants/classification-examples";

export const dynamic = "force-dynamic";

interface Props {
  params: { shareToken: string };
}

// The homepage's example classifications rank for searches like "brake pad hs code", so they
// get a title and description that say what's on them. Other shared pages keep the default.
export function generateMetadata({ params }: Props): Metadata {
  const example = classificationExampleByToken(params.shareToken);
  if (!example) return {};
  return {
    title: `${example.seoTitle} | HTS Hero`,
    description: example.seoDescription,
    alternates: { canonical: `/c/${example.shareToken}` },
    openGraph: {
      title: example.seoTitle,
      description: example.seoDescription,
      url: `https://${config.domainName}/c/${example.shareToken}`,
      siteName: "HTS Hero",
      type: "article",
    },
  };
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
