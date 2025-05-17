import { Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Loading({ isOpen, loadingMsg = "Please Wait" }: { isOpen: boolean; loadingMsg?: string }) {
    return (
        <Dialog open={isOpen}>
            <DialogTitle>
                <VisuallyHidden>Loading</VisuallyHidden>
            </DialogTitle>

            <DialogContent showCloseIcon={false} className="max-w-48 flex justify-between" aria-describedby={undefined}>
                <div>{loadingMsg}</div> <Loader2 className="animate-spin" />
            </DialogContent>
        </Dialog>
    );
}
