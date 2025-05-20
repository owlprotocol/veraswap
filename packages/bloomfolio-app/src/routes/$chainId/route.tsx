import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$chainId")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Outlet />;
}
