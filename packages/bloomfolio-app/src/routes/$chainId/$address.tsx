import { createFileRoute, useParams } from "@tanstack/react-router";
import { Address } from "viem";
import { BasketPage } from "@/pages/BasketPage.js";

export const Route = createFileRoute("/$chainId/$address")({
    component: RouteComponent,
});

function RouteComponent() {
    const { chainId, address } = useParams({ from: "/$chainId/$address" });
    return <BasketPage chainId={Number(chainId)} address={address as Address} />;
}
