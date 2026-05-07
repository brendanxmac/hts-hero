import Image from "next/image";
import Link from "next/link";
import { authors } from "@/app/blog/_assets/types";

interface Props {
  presenterName: string;
  presenterTitle?: string | null;
}

export default function WebinarPresenter({
  presenterName,
  presenterTitle,
}: Props) {
  const matchedAuthor = authors.find(
    (a) => a.name.toLowerCase() === presenterName.toLowerCase(),
  );

  return (
    <div className="p-4 bg-base-200 rounded-xl">
      <p className="text-xs font-medium text-base-content/50 uppercase tracking-wider mb-3">
        Presented by
      </p>
      <div className="flex items-center gap-4">
      {matchedAuthor ? (
        <Link
          href={`/blog/author/${matchedAuthor.slug}`}
          className="flex items-center gap-4 group"
        >
          <Image
            src={matchedAuthor.avatar}
            alt=""
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover object-center"
          />
          <div>
            <p className="font-semibold group-hover:underline">
              {matchedAuthor.name}
            </p>
            <p className="text-sm text-base-content/60">
              {presenterTitle || matchedAuthor.job}
            </p>
          </div>
        </Link>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {presenterName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{presenterName}</p>
            {presenterTitle && (
              <p className="text-sm text-base-content/60">{presenterTitle}</p>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
