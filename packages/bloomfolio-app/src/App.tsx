import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/react/utils";
import { router } from "./router.js";
import { Analytics } from "./components/analytics.js";
import { ThemeProvider } from "./components/theme-provider.js";
import { Toaster } from "./components/ui/toaster.jsx";
import { config } from "./config.js";
import "@coinbase/onchainkit/styles.css";
import { queryClient } from "./queryClient.js";

const customTheme = {
    ...lightTheme({
        accentColor: "#6366f1",
        borderRadius: "medium",
    }),
};

function InnerApp() {
    return <RouterProvider router={router} />;
}

const HydrateAtoms = ({ children }) => {
    useHydrateAtoms([[queryClientAtom, queryClient]]);
    return children;
};

function App() {
    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <WagmiProvider config={config}>
                    {/* TODO: use config active chain */}
                    <OnchainKitProvider
                        apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
                        projectId={import.meta.env.NEXT_PUBLIC_CDP_PROJECT_ID}
                        chain={base}
                    >
                        <QueryClientProvider client={queryClient}>
                            <RainbowKitProvider theme={customTheme}>
                                <HydrateAtoms>
                                    <InnerApp />
                                    <ReactQueryDevtools initialIsOpen={false} />
                                    <Analytics />
                                    <Toaster />
                                </HydrateAtoms>
                            </RainbowKitProvider>
                        </QueryClientProvider>
                    </OnchainKitProvider>
                </WagmiProvider>
            </ThemeProvider>
        </>
    );
}

export default App;
