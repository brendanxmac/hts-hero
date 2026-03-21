"use client";

import Link from "next/link";
import { Squares2X2Icon } from "@heroicons/react/20/solid";
import { NotFoundStylePage } from "../NotFoundStylePage";

type Props = { httpStatus: number };

export function ClassificationLoadFailure({ httpStatus }: Props) {
  const isForbidden = httpStatus === 403 || httpStatus === 401;
  const isNotFound = httpStatus === 404;

  const title = isForbidden
    ? "You don't have access to this classification"
    : isNotFound
      ? "This classification wasn't found"
      : "We couldn't load this classification";

  const description = isForbidden
    ? "Sign in with the right account, or ask the owner to share it with your team."
    : isNotFound
      ? "The link may be wrong, or it may have been deleted."
      : "Something went wrong. Try again in a moment.";

  return (
    <NotFoundStylePage
      title={title}
      description={description}
      actions={
        <Link href="/classifications" className="btn btn-sm gap-2">
          <Squares2X2Icon className="w-5 h-5" aria-hidden />
          Back to classifications
        </Link>
      }
    />
  );
}
