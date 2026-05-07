"use client";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export default function WebinarVideoEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-base-300">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Webinar promo video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
