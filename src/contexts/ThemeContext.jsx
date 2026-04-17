import { createContext, useContext, useEffect, useMemo, useState } from "react";
const ThemeContext = createContext(undefined);
const THEME_STORAGE_KEY = "ims-theme";
function getInitialTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);
    const value = useMemo(() => ({
        theme,
        isDark: theme === "dark",
        toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    }), [theme]);
    return (<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
