import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const Route = createRootRoute({
  component: RootComponent,
});
function RootComponent() {
  return (
    <div className="min-h-screen page-gradient">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b header-background">
        <nav className="mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-2xl font-bold logo-gradient bg-clip-text text-transparent">
            VeraSwap
          </h1>
          <div className="flex-1 flex justify-end items-center gap-2">
            <ThemeSwitcher />
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-8">
        <Outlet />
      </main>
    </div>
  );
}
