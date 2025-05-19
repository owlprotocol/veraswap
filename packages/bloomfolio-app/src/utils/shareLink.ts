import { toast } from "@/components/ui/use-toast.js";

type ShareLinkOptions = {
    address?: string;
};

export function shareLink({ address }: ShareLinkOptions) {
    const url = new URL(window.location.href);
    if (address) {
        url.searchParams.set("referrer", address);
    }

    navigator.clipboard.writeText(url.toString());

    toast({
        title: "Link Copied!",
        description: "Share this link with your friends to earn rewards.",
    });
}
