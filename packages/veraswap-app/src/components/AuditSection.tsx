import { Shield } from "lucide-react";

export function AuditSection() {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Audited by</span>
            <a
                href="https://github.com/owlprotocol/veraswap/blob/develop/packages/veraswap-sdk/audits/NM_0622_Veraswap_FINAL.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity flex items-center gap-1"
            >
                <img
                    src="/nethermind.png"
                    alt="Nethermind"
                    className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
                <span>Nethermind</span>
            </a>
        </div>
    );
}
