import { ReactNode } from "react";
import * as mk from "./styles";

// The top of a landing-page section: eyebrow, <h2>, lead. Centered or left, on light or dark.
export const SectionIntro = ({
  eyebrow,
  title,
  children,
  id,
  center = false,
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
  center?: boolean;
  dark?: boolean;
}) => (
  <div className={`flex max-w-5xl flex-col gap-4 ${center ? "mx-auto items-center text-center" : ""}`}>
    {eyebrow && <p className={dark ? mk.eyebrowDark : mk.eyebrow}>{eyebrow}</p>}
    <h2 id={id} className={dark ? mk.h2Dark : mk.h2}>
      {title}
    </h2>
    {children && <p className={dark ? mk.leadDark : mk.lead}>{children}</p>}
  </div>
);
