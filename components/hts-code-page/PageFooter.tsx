import Link from "next/link";
import * as ui from "@/components/ui/styles";

export function PageFooter() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100">
      <div className={`${ui.container} py-8 ${ui.caption} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-base-content">About</Link>
          <Link href="/blog" className="hover:text-base-content">Blog</Link>
          <Link href="/privacy-policy" className="hover:text-base-content">Privacy</Link>
          <Link href="/tos" className="hover:text-base-content">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
