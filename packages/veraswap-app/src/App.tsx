import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { router } from "./router.js";
import { Analytics } from "./components/analytics.js";
import { ThemeProvider } from "./components/theme-provider.js";
import { config } from "./config.js";
import { Toaster } from "@/components/ui/toaster.jsx";

const customTheme = {
    ...lightTheme({
        accentColor: "#6366f1",
        borderRadius: "medium",
    }),
};

function InnerApp() {
    return <RouterProvider router={router} />;
}

const queryClient = new QueryClient();

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider theme={customTheme}>
                            <InnerApp />
                            <ReactQueryDevtools initialIsOpen={false} />
                            <Analytics />
                            <Toaster />
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </ThemeProvider>
        </>
    );
}

export default App;
