import { toast } from "@/components/ui/use-toast.js";

type ShareLinkOptions = {
    address?: string;
    title?: string;
    description?: string;
};

export function shareLink({
    address,
    title = "Link Copied!",
    description = "Share this link with your friends to earn rewards.",
}: ShareLinkOptions) {
    const url = new URL(window.location.href);
    if (address) {
        url.searchParams.set("referrer", address);
    }

    navigator.clipboard.writeText(url.toString());

    toast({
        title,
        description,
    });
}
