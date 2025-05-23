import { ErrorComponent, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.js";
import { Loading } from "./components/ui/loading.js";

// Create a new router instance
//https://tanstack.com/router/v1/docs/framework/react/api/router/RouterOptionsType
export const router = createRouter({
    routeTree,
    //https://tanstack.com/router/v1/docs/framework/react/guide/not-found-errors#migrating-from-notfoundroute
    //This is causing issues for now
    /*
    notFoundMode: "fuzzy",
    defaultNotFoundComponent: () => {
        return (
            <div>
                <p>Not found!</p>
                <Link to="/">Go home</Link>
            </div>
        );
    },
    */
    defaultPendingComponent: () => <Loading isOpen={true} loadingMsg="Loading..." />,
    defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
    defaultNotFoundComponent: ({ data }) => <p>Not Found! ({`${data}`})</p>,
    //https://tanstack.com/router/v1/docs/framework/react/guide/preloading
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
