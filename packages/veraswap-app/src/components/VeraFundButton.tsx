import { useAccount } from "wagmi";
import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
const projectId = import.meta.env.VITE_CDP_PROJECT_ID;

export const VeraFundButton = () => {
    const { address } = useAccount();

    const onrampBuyUrl = getOnrampBuyUrl({
        projectId,
        addresses: { [address!]: ["base"] },
        assets: ["USDC"],
        presetFiatAmount: 20,
        fiatCurrency: "EUR",
    });

    return (
        <div className="hidden md:block">
            {address && (
                <FundButton
                    fundingUrl={onrampBuyUrl}
                    className="bg-purple-400 border-1 hover:bg-purple-900 h-[40px] 
                           transform transition-all duration-200 hover:scale-105"
                />
            )}
        </div>
    );
};
