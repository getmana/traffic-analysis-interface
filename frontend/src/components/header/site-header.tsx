import { SiteHeaderNav } from "@/components/header/site-header-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <span className="font-medium text-foreground">Test Task</span>
        <SiteHeaderNav />
      </nav>
    </header>
  );
}
