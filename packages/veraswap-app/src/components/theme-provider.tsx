import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeOverrides = {
    primary?: string;
    "primary-foreground"?: string;
    secondary?: string;
    "secondary-foreground"?: string;
    card?: string;
    "card-foreground"?: string;
    background?: string;
    foreground?: string;
    accent?: string;
    "accent-foreground"?: string;
    muted?: string;
    "muted-foreground"?: string;
    border?: string;
    input?: string;
    destructive?: string;
    "destructive-foreground"?: string;
    success?: string;
    "success-foreground"?: string;
    warning?: string;
    "warning-foreground"?: string;
    ring?: string;
    radius?: string;
    modal?: string;
    "modal-foreground"?: string;
};

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    themeOverrides?: ThemeOverrides;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themeOverrides: ThemeOverrides;
    setThemeOverrides: (overrides: ThemeOverrides) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    themeOverrides: {},
    setThemeOverrides: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    themeOverrides = {},
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
    const [overrides, setOverrides] = useState<ThemeOverrides>(themeOverrides);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        Object.keys(overrides).forEach((key) => {
            root.style.removeProperty(`--${key}`);
        });

        Object.entries(overrides).forEach(([key, value]) => {
            if (value) {
                root.style.setProperty(`--${key}`, value);
            }
        });
    }, [overrides]);

    useEffect(() => {
        setOverrides(themeOverrides);
    }, [themeOverrides]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
        themeOverrides: overrides,
        setThemeOverrides: (newOverrides: ThemeOverrides) => {
            setOverrides(newOverrides);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
