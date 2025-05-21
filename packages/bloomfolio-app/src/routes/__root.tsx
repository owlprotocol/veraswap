import { createRootRoute, Outlet, retainSearchParams, Link } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { ThemeSwitcher } from "@/components/theme-switcher.js";
import { Button } from "@/components/ui/button.js";
import { WelcomeModal } from "@/components/WelcomeModal.js";

const rootSearchSchema = z.object({
    referrer: z.string().optional(),
});

export const Route = createRootRoute({
    validateSearch: zodValidator(rootSearchSchema),
    search: {
        middlewares: [retainSearchParams(["referrer"])],
    },
    component: RootComponent,
});

function RootComponent() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="min-h-screen page-gradient">
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b header-background">
                <nav className="mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="hidden md:flex flex-1" />
                    <Link to="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
                        <img src="/logo_rounded.png" alt="Verabloom Logo" className="w-8 h-8" />
                        <h1 className="text-2xl font-bold logo-gradient bg-clip-text text-transparent">VeraBloom</h1>
                    </Link>

                    <div className="hidden md:flex flex-1 justify-end items-center gap-2">
                        <ThemeSwitcher />
                        <ConnectButton showBalance={true} accountStatus="full" chainStatus="icon" />
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
                            <ConnectButton showBalance={true} accountStatus="full" chainStatus="full" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-10 pb-8">
                <Outlet />
            </main>
            <WelcomeModal />
        </div>
    );
}
