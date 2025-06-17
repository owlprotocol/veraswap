import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher.js";
import { VeraFundButton } from "@/components/VeraFundButton.js";
import { WelcomeDialog } from "@/components/welcome-dialog.js";
import { Button } from "@/components/ui/button.js";

export const Route = createRootRoute({
    component: RootComponent,
});
function RootComponent() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isEmbedRoute = location.pathname.startsWith("/embed");

    if (isEmbedRoute) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen page-gradient">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b header-background">
                <nav className="mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="hidden md:flex flex-1" />
                    <h1 className="text-2xl font-bold logo-gradient bg-clip-text text-transparent">VeraSwap</h1>

                    <div className="hidden md:flex flex-1 justify-end items-center gap-2">
                        {/* TODO: add back later? */}
                        {/* <VeraFundButton /> */}
                        <ThemeSwitcher />
                        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
                    </div>
                    <div className="md:hidden flex-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => setMenuOpen((prev) => !prev)}>
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>
                </nav>
                <div className="md:hidden">
                    <div
                        className={`transition-all overflow-hidden ${
                            menuOpen ? "max-h-30 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                        }`}
                    >
                        <div className="px-4 flex flex-col items-center space-y-3">
                            <VeraFundButton />
                            <ConnectButton showBalance={false} accountStatus="address" chainStatus="full" />
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    <div className="mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                            Veraswap is currently in beta. Use at your own risk. By using this application, you accept
                            all associated risks.
                        </span>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-8">
                <Outlet />
            </main>
            <WelcomeDialog />
        </div>
    );
}
