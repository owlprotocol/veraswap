import { useAtom } from "jotai";
import { Button } from "./ui/button";
import { networkTypeAtom } from "@/atoms";

export const MainnetTestnetButtons = () => {
    const [networkType, setNetworkType] = useAtom(networkTypeAtom);

    return (
        <div className="flex justify-center mb-4">
            <div className="bg-gray-800 p-1 rounded-2xl shadow-md flex space-x-2 border border-gray-700">
                <Button
                    className={`px-6 py-2 rounded-xl transition-all ${
                        networkType === "mainnet"
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setNetworkType("mainnet")}
                >
                    Mainnet
                </Button>
                <Button
                    className={`px-6 py-2 rounded-xl transition-all ${
                        networkType === "testnet"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setNetworkType("testnet")}
                >
                    Testnet
                </Button>
            </div>
        </div>
    );
};
