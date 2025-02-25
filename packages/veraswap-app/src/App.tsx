import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { http, WagmiProvider, createStorage, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { router } from "./router.js";
import { Analytics } from "./components/analytics.js";
import { ThemeProvider } from "./components/theme-provider.js";
import { Toaster } from "@/components/ui/toaster.jsx";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet],
    },
  ],
  { projectId: "veraswap", appName: "Owl Protocol" },
);

const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
  connectors,
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
