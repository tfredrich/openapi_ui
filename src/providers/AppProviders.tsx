import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppTheme } from "../theme";

const queryClient = new QueryClient();
const THEME_STORAGE_KEY = "openapi-ui-theme";

export type ThemePreference = "system" | "light" | "dark";
type PaletteMode = "light" | "dark";

type ColorModeContextValue = {
  preference: ThemePreference;
  resolvedMode: PaletteMode;
  setPreference: (preference: ThemePreference) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export function AppProviders({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const resolvedMode: PaletteMode = preference === "system" ? (prefersDarkMode ? "dark" : "light") : preference;
  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  }, [preference]);

  const colorModeValue = useMemo(
    () => ({
      preference,
      resolvedMode,
      setPreference,
    }),
    [preference, resolvedMode]
  );

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within AppProviders");
  }
  return context;
}
