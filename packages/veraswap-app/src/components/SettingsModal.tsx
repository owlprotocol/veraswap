import { Settings } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button.js";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.js";
import { Switch } from "@/components/ui/switch.js";
import { Label } from "@/components/ui/label.js";
import { funModeAtom } from "@/atoms/atoms.js";

export function SettingsModal() {
    const [funMode, setFunMode] = useAtom(funModeAtom);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>Configure your preferences.</DialogDescription>
                </DialogHeader>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="fun-mode">Fun Mode</Label>
                        <Switch id="fun-mode" checked={funMode} onCheckedChange={setFunMode} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
