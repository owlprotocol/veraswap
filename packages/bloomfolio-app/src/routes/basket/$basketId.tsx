import { createFileRoute, useParams } from "@tanstack/react-router";
import { z } from "zod";
import { BasketPage } from "@/pages/BasketPage.js";
import { BASKETS } from "@/constants/baskets.js";

export const Route = createFileRoute("/basket/$basketId")({
    validateSearch: z.object({
        referrer: z.string().optional(),
    }),
    component: BasketDetailsPage,
});

function BasketDetailsPage() {
    const { referrer } = Route.useSearch();
    const { basketId } = useParams({ from: "/basket/$basketId" });
    const basket = BASKETS.find((b) => b.id === basketId);

    if (!basket) {
        return <div>Basket not found</div>;
    }

    const details = {
        title: basket?.title,
        description: basket?.description,
        icon: basket?.icon,
    };

    const chainId = basket?.allocations[0].chainId;
    const address = basket?.address;
    console.log({ chainId, address });

    return <BasketPage chainId={chainId} address={address} details={details} referrer={referrer} />;
}
