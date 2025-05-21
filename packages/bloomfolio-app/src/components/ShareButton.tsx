import { useAccount } from "wagmi";
import { Wallet, Share } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Button } from "./ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.js";
import { shareLink } from "@/utils/shareLink.js";

interface ShareButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function ShareButton({ variant = "default", size = "default", className }: ShareButtonProps) {
    const { isConnected, address: walletAddress } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [isOpen, setIsOpen] = useState(false);

    const handleShare = () => {
        shareLink({
            address: walletAddress,
        });
    };

    const handleConnect = () => {
        setIsOpen(false);
        openConnectModal?.();
    };

    if (isConnected) {
        return (
            <Button variant={variant} size={size} className={`gap-2 ${className || ""}`} onClick={handleShare}>
                <Share className="h-4 w-4" />
                Share
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className={`gap-2 ${className || ""}`}>
                    <Share className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-4 pb-4">
                    <DialogTitle className="text-xl font-semibold">Connect Wallet to Earn Rewards</DialogTitle>
                    <DialogDescription className="text-base">
                        Connect your wallet to earn rewards when your friends use your referral link.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Button variant="outline" onClick={handleShare} className="w-full gap-2 py-6 text-base">
                        <Share className="h-5 w-5" />
                        Share Without Rewards
                    </Button>
                    <Button onClick={handleConnect} className="w-full gap-2 py-6 text-base">
                        <Wallet className="h-5 w-5" />
                        Connect Wallet
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
