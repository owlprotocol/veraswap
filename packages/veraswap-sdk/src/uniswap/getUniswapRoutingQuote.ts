import { isExactInput, transformQuoteToTrade } from "./routing/utils.js";
import { UNISWAP_API_KEY } from "../swap/uniswap.test.js";
import {
    Protocol,
    GetQuoteArgs,
    URAQuoteType,
    RouterPreference,
    INTERNAL_ROUTER_PREFERENCE_PRICE,
    QuoteIntent,
    QuoteState,
    URAQuoteResponse,
    QuoteMethod,
} from "../types/uniswapRouting.js";

const UNISWAP_GATEWAY_DNS_URL = "https://trading-api-labs.interface.gateway.uniswap.org/v1";

const protocols: Protocol[] = [Protocol.V2, Protocol.V3, Protocol.MIXED];

// routing API quote query params: https://github.com/Uniswap/routing-api/blob/main/lib/handlers/quote/schema/quote-schema.ts
const DEFAULT_QUERY_PARAMS = {
    // this should be removed once BE fixes issue where enableUniversalRouter is required for fees to work
    enableUniversalRouter: true,
};
// Make sure to fix return type usage
function getRoutingAPIConfig(args: GetQuoteArgs) {
    const { account, routerPreference, protocolPreferences, routingType } = args;

    if (
        routingType !== URAQuoteType.CLASSIC ||
        (routerPreference !== RouterPreference.API && routerPreference !== INTERNAL_ROUTER_PREFERENCE_PRICE)
    ) {
        throw new Error("Only Classic quotes are supported for API routing");
    }

    return {
        ...DEFAULT_QUERY_PARAMS,
        protocols: protocolPreferences && protocolPreferences.length > 0 ? protocolPreferences : protocols,
        routingType: URAQuoteType.CLASSIC,
        recipient: account,
        enableFeeOnTransferFeeFetching: true,
    };
}

export async function getUniswapRoutingQuote(args: GetQuoteArgs) {
    const {
        tokenInAddress: tokenIn,
        tokenInChainId,
        tokenOutAddress: tokenOut,
        tokenOutChainId,
        amount,
        tradeType,
    } = args;

    const requestBody = {
        tokenInChainId,
        tokenIn,
        tokenOutChainId,
        tokenOut,
        amount,
        type: isExactInput(tradeType) ? "EXACT_INPUT" : "EXACT_OUTPUT",
        intent: args.routerPreference === INTERNAL_ROUTER_PREFERENCE_PRICE ? QuoteIntent.Pricing : QuoteIntent.Quote,
        configs: getRoutingAPIConfig(args),
        useUniswapX: args.routerPreference === RouterPreference.X,
        swapper: args.account,
    };

    try {
        const url = `${UNISWAP_GATEWAY_DNS_URL}/quote`;
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "x-request-source": "uniswap-web",
                "x-api-key": UNISWAP_API_KEY!,
            },
        });

        if (!response.ok) {
            // cast as any here because we do a runtime check on it being an object before indexing into .errorCode
            const errorData = (await response.json()) as { errorCode?: string; detail?: string };
            // NO_ROUTE should be treated as a valid response to prevent retries.
            if (
                typeof errorData === "object" &&
                (errorData?.errorCode === "NO_ROUTE" || errorData?.detail === "No quotes available")
            ) {
                return {
                    data: { state: QuoteState.NOT_FOUND },
                };
            }

            throw new Error(
                `Failed to get quote from Uniswap Gateway: ${response.status} ${response.statusText} ${JSON.stringify(
                    errorData,
                )}`,
            );
        }

        const uraQuoteResponse = (await response.json()) as URAQuoteResponse;
        const tradeResult = await transformQuoteToTrade(args, uraQuoteResponse, QuoteMethod.ROUTING_API);
        return { data: tradeResult };
    } catch (error: any) {
        console.error(
            "routing/slice",
            "queryFn",
            `GetQuote failed on Unified Routing API, falling back to client: ${
                error?.message ?? error?.detail ?? error
            }`,
        );
    }

    return {
        data: { state: QuoteState.NOT_FOUND },
    };
}
