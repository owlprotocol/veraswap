import { ElementType, HTMLAttributes } from "react";

export interface ComponentProps extends HTMLAttributes<HTMLOrSVGElement> {
    as?: ElementType;
}
