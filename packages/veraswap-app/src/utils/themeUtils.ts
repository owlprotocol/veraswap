import { mapValues } from "lodash-es";
import chroma from "chroma-js";

export const hexThemeToHSL = (hexTheme: Record<string, string>) =>
    mapValues(hexTheme, (value) => {
        if (!value || !chroma.valid(value)) {
            return value;
        }
        const hsl = chroma(value).hsl();
        return `${Math.round(hsl[0])} ${Math.round(hsl[1] * 100)}% ${Math.round(hsl[2] * 100)}%`;
    });
