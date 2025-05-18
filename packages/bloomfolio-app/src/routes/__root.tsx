import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher.js";

import { Button } from "@/components/ui/button.js";

export const Route = createRootRoute({
    component: RootComponent,
});
function RootComponent() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="min-h-screen page-gradient">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b header-background">
                <nav className="mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="hidden md:flex flex-1" />
                    <h1 className="text-2xl font-bold logo-gradient bg-clip-text text-transparent">Bloomfolio</h1>

                    <div className="hidden md:flex flex-1 justify-end items-center gap-2">
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
                            <ConnectButton showBalance={false} accountStatus="address" chainStatus="full" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-10 pb-8">
                <Outlet />
            </main>
        </div>
    );
}
