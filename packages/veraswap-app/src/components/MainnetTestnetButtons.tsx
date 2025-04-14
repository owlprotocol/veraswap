import { useAtom } from "jotai";
import { useEffect } from "react";
import { Button } from "./ui/button.js";
import { ChainsType, chainsTypeWriteAtom } from "@/atoms/index.js";
import { Route } from "@/routes/index.js";

const buttonStyles: Record<string, string> = {
    local: `
    bg-red-500 text-white
    hover:bg-red-600
    dark:bg-red-600 dark:hover:bg-red-700
    shadow-md
  `,
    mainnet: `
    bg-blue-500 text-white
    hover:bg-blue-600
    dark:bg-blue-600 dark:hover:bg-blue-700
    shadow-md
  `,
    testnet: `
    bg-green-500 text-white
    hover:bg-green-600
    dark:bg-green-600 dark:hover:bg-green-700
    shadow-md
  `,
    default: `
    bg-white text-gray-700
    hover:bg-gray-100
    dark:bg-gray-700 dark:text-gray-300
    dark:hover:bg-gray-600
    shadow-md
  `,
};

const useDomainType = () => {
    const hostname = window.location.hostname;
    if (hostname === "veraswap.io" || hostname === "app.veraswap.io") return "mainnet";
    if (hostname === "testnet.veraswap.io") return "testnet";
    return null;
};

const networkTypes =
    import.meta.env.MODE === "development"
        ? (["mainnet", "testnet", "local"] as const)
        : (["mainnet", "testnet"] as const);

export const MainnetTestnetButtons = () => {
    const [networkType, setNetworkType] = useAtom(chainsTypeWriteAtom);
    const navigate = Route.useNavigate();
    const domainType = useDomainType();

    useEffect(() => {
        if (domainType) {
            setNetworkType(domainType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domainType]);

    const handleNetworkChange = (newType: ChainsType) => {
        setNetworkType(newType);

        navigate({
            search: {
                type: newType,
                tokenIn: undefined,
                chainIdIn: undefined,
                tokenOut: undefined,
                chainIdOut: undefined,
            },
            replace: true,
        });
    };

    if (domainType) return null;

    return (
        <div className="flex justify-center mb-4">
            <div className="bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 p-1 rounded-2xl shadow-md flex space-x-1 md:space-x-2 border">
                {networkTypes.map((type: ChainsType) => (
                    <Button
                        key={type}
                        type="button"
                        className={`w-24 md:w-32 px-6 md:py-2 rounded-xl transition-all ${
                            networkType === type ? buttonStyles[type] : buttonStyles.default
                        }`}
                        onClick={() => handleNetworkChange(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                ))}
            </div>
        </div>
    );
};
