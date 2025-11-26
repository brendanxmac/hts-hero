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
    <div className="group h-auto py-6 px-4 bg-primary/5 border-2 border-primary/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col gap-4 mt-2 w-full items-center">
          <Link href={appUrl} className="btn btn-wide btn-primary">
            {cta}
          </Link>
          <Link href={aboutUrl} className="link link-primary text-sm font-bold">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
