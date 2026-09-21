"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/search", label: "Search" },
  { href: "/session-detail", label: "Session detail" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1 sm:gap-2">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
