import { queryOptions } from "@tanstack/react-query";
import { Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";

export const disabledQueryOptions = queryOptions({
    queryKey: ["null"],
    queryFn: () => null,
    enabled: false,
});

export const disabledQueryAtom = atomWithQuery(() => disabledQueryOptions) as Atom<AtomWithQueryResult<null>>;
