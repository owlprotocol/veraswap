import { atom } from "jotai";
import { getAccount, watchAccount } from "@wagmi/core";
import { config } from "@/config.js";

export const accountAtom = atom(getAccount(config));

accountAtom.onMount = (set) => {
    const unsubscribe = watchAccount(config, {
        onChange: (account) => set(account),
    });
    return unsubscribe;
};
