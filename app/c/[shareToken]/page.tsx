import { createClient } from "@/app/api/supabase/server";
import { ClassificationRecord } from "@/interfaces/hts";
import { SharedClassificationView } from "@/components/SharedClassificationView";
import { notFound } from "next/navigation";
import UnauthenticatedHeader from "@/components/UnauthenticatedHeader";
import Footer from "@/components/Footer";

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

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <UnauthenticatedHeader />
      <main className="flex-1">
        <SharedClassificationView classification={classification} />
      </main>
      <Footer />
    </div>
  );
}
