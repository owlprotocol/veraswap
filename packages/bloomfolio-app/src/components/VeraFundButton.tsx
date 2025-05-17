import { useAccount } from "wagmi";
import { FundButton, getOnrampBuyUrl } from "@coinbase/onchainkit/fund";
import { useAtomValue } from "jotai";
import { parseUnits } from "viem";

const projectId = import.meta.env.VITE_CDP_PROJECT_ID;

const defaultUSDCAmount = parseUnits("10", 6);

export const VeraFundButton = () => {
    const { address } = useAccount();

    const onrampBuyUrl = getOnrampBuyUrl({
        projectId,
        defaultAsset: "USDC",
        addresses: { [address!]: ["base"] },
        assets: ["USDC"],
        presetCryptoAmount: Number(defaultUSDCAmount),
        fiatCurrency: "USD",
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
