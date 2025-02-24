import { RouterProvider } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { API_TRPC_BASE_URL, isProduction } from "@owlprotocol/envvars/browser";
import { OwlProvider } from "@owlprotocol/ui-components";
import { ThemeProvider } from "./components/theme-provider.js";
import { Analytics } from "./components/analytics.js";
import { router } from "./router.js";
import { Toaster } from "@/components/ui/toaster.jsx";

function InnerApp() {
    return <RouterProvider router={router} />;
}

const useAuthIFrame = false;

function App() {
    return (
        <>
            {/* Keep CSS out of the App as intended */}
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <OwlProvider
                    useAuthIFrame={useAuthIFrame}
                    apiTrpcBaseUrl={API_TRPC_BASE_URL}
                >
                    <InnerApp />
                    {!isProduction() && (
                        <ReactQueryDevtools initialIsOpen={false} />
                    )}
                </OwlProvider>

                <Analytics />
                <Toaster />
            </ThemeProvider>
        </>
    );
}

export default App;
