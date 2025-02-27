import { useAtom } from "jotai";
import { Button } from "./ui/button";
import { networkTypeWithResetAtom } from "@/atoms";

export const MainnetTestnetButtons = () => {
    const [networkType, setNetworkType] = useAtom(networkTypeWithResetAtom);

    // TODO: improve button styles
    const buttonStyles: Record<string, string> = {
        mainnet: "bg-blue-500 text-white shadow-md",
        testnet: "bg-green-500 text-white shadow-md",
        superchain: "bg-red-500 text-white shadow-md",
        default: "bg-gray-700 text-gray-300 hover:bg-gray-600",
    };

    return (
        <div className="flex justify-center mb-4">
            <div className="bg-gray-800 p-1 rounded-2xl shadow-md flex space-x-1 md:space-x-2 border border-gray-700">
                {["mainnet", "testnet", "superchain"].map((type) => (
                    <Button
                        key={type}
                        className={`w-24 md:w-32 px-6 md:py-2 rounded-xl transition-all ${
                            networkType === type ? buttonStyles[type] : buttonStyles.default
                        }`}
                        onClick={() => setNetworkType(type as "mainnet" | "testnet" | "superchain")}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                ))}
            </div>
        </div>
    );
};
