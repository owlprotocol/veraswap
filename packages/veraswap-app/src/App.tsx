import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./components/theme-provider.js";
import { Analytics } from "./components/analytics.js";
import { router } from "./router.js";
import { Toaster } from "@/components/ui/toaster.jsx";
import { http, WagmiProvider, createStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { createClient } from "viem";
import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// export const config = createConfig({
//   chains: [mainnet, sepolia],
//   client({ chain }) {
//     return createClient({ chain, transport: http() });
//   },
//   storage: createStorage({ storage: window.localStorage }),
// });

const config = getDefaultConfig({
  appName: "Veraswap",
  projectId: "veraswap",
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({ storage: window.localStorage }),
});

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
            <RainbowKitProvider theme={customTheme} coolMode>
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
