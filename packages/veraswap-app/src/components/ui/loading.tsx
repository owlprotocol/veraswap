import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function Loading({ isOpen, loadingMsg = "Please Wait" }: { isOpen: boolean; loadingMsg?: string }) {
    return (
        <Dialog open={isOpen}>
            <DialogContent showCloseIcon={false} className="max-w-48 flex justify-between">
                <div>{loadingMsg}</div> <Loader2 className="animate-spin" />
            </DialogContent>
        </Dialog>
    );
}
