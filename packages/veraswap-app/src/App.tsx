import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./components/theme-provider.js";
import { Analytics } from "./components/analytics.js";
import { router } from "./router.js";
import { Toaster } from "@/components/ui/toaster.jsx";
import { http, createConfig, WagmiProvider, createStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "viem";

export const config = createConfig({
  chains: [mainnet, sepolia],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
  storage: createStorage({ storage: window.localStorage }),
});

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
            <InnerApp />
            <ReactQueryDevtools initialIsOpen={false} />
            <Analytics />
            <Toaster />
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
