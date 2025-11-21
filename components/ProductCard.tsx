import Link from "next/link";

export interface ProductCardI {
  emoji: string;
  title: string;
  description: string;
  aboutUrl: string;
  appUrl: string;
  cta: string;
}

export default function ProductCard({
  emoji,
  title,
  description,
  aboutUrl,
  appUrl,
  cta,
}: ProductCardI) {
  return (
    <div className="group h-auto py-6 px-4 bg-base-200 border-2 border-neutral-600 rounded-lg transition-all duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col gap-4 mt-2 w-full items-center">
          <Link
            href={appUrl}
            className="btn btn-sm btn-wide bg-yellow-400 hover:bg-yellow-500 text-black border-none"
          >
            {cta}
          </Link>
          <Link
            href={aboutUrl}
            className="text-yellow-400 hover:text-yellow-300 underline text-sm"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
