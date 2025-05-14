import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useCallback } from "react";
import { Button } from "@/components/ui/button.js";

export const Route = createFileRoute("/smartaccount")({
    component: Component,
});

// const relay = privateKeyToAccount("0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"); //anvil 4

function Component() {
    const account = useAccount();
    // const [authorization, setAuthorization] = useState<null | SignAuthorizationReturnType>(null);

    const onEIP7702Click = useCallback(async () => {
        console.debug("Viem EIP7702 only works with local accounts for now");
        /*
        const walletClient = createWalletClient({
            account: relay,
            chain: account.chain,
            transport: http(),
        });

        const authorization = await walletClient.signAuthorization({
            account: account as any,
            contractAddress: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
        });
        setAuthorization(authorization);
        */
    }, []);

    return (
        <div className="max-w-md mx-auto px-2">
            EOA
            <br />
            {account.address}
            <br />
            <br />
            Kernel Account
            <br />
            {account.address}
            <br />
            <Button onClick={onEIP7702Click}>EIP7702</Button>
        </div>
    );
}
