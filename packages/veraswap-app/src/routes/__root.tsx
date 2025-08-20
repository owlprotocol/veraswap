import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, AlertTriangle, HelpCircle, ExternalLink } from "lucide-react";
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
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
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
                    <a
                        href="https://veraswap.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <img src="/logo.svg" alt="Veraswap Logo" className="h-10 w-10 invert dark:invert-0" />
                        <img src="/Veraswap.svg" alt="Veraswap" className="h-6 mt-1 invert dark:invert-0" />
                    </a>

                    <div className="hidden md:flex flex-1 justify-end items-center gap-2">
                        {/* TODO: add back later? */}
                        {/* <VeraFundButton /> */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowWelcomeDialog(true)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </Button>
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWelcomeDialog(true)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <HelpCircle className="w-4 h-4" />
                            </Button>
                            <VeraFundButton />
                            <ConnectButton showBalance={false} accountStatus="address" chainStatus="full" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-8">
                <Outlet />
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm border-t header-background">
                <div className="mx-auto px-4 py-3 flex items-center justify-center">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                        <a
                            href="https://veraswap.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <span>Visit veraswap.io</span>
                        </a>
                    </Button>
                </div>
            </footer>

            <WelcomeDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog} />
        </div>
    );
}
