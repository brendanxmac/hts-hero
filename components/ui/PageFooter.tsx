import Link from "next/link";
import * as ui from "@/components/ui/styles";

// Every public page links to the tools and the guides from here, so crawlers can reach them
const LINKS = [
  { href: "/duty-calculator", label: "Duty Calculator" },
  { href: "/explore", label: "HTS Explorer" },
  { href: "/blog", label: "Blog" },
  { href: "/compare", label: "Compare" },
  { href: "/", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/tos", label: "Terms" },
];

export function PageFooter() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100">
      <div className={`${ui.container} py-8 ${ui.caption} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <span>&copy; {new Date().getFullYear()} HTS Hero. Data sourced from the USITC Harmonized Tariff Schedule.</span>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-base-content">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
