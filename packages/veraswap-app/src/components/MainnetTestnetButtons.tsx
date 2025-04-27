import { useAtom } from "jotai";
import { Button } from "./ui/button.js";
import { ChainsType, chainsTypeWriteAtom } from "@/atoms/index.js";
import { Route } from "@/routes/index.js";
import { useDomainType } from "@/hooks/useDomainType.js";

const networkTypes =
    import.meta.env.MODE === "development"
        ? (["mainnet", "testnet", "local"] as const)
        : (["mainnet", "testnet"] as const);

export const MainnetTestnetButtons = () => {
    const [networkType, setNetworkType] = useAtom(chainsTypeWriteAtom);
    const navigate = Route.useNavigate();
    const domainType = useDomainType();

    const handleNetworkChange = (newType: ChainsType) => {
        setNetworkType(newType);

        navigate({
            search: {
                type: newType,
                currencyIn: undefined,
                chainIdIn: undefined,
                currencyOut: undefined,
                chainIdOut: undefined,
            },
            replace: true,
        });
    };

    if (domainType) return null;

    return (
        <div className="flex justify-center mb-4">
            <div className="p-1 rounded-2xl shadow-md flex space-x-1 md:space-x-2 border">
                {networkTypes.map((type: ChainsType) => (
                    <Button
                        key={type}
                        type="button"
                        variant={networkType === type ? "default" : "ghost"}
                        className="w-24 md:w-32 px-6 md:py-2 rounded-xl"
                        onClick={() => handleNetworkChange(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                ))}
            </div>
        </div>
    );
};
