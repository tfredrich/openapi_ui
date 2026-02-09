import { createTheme } from "@mui/material/styles";

type PaletteMode = "light" | "dark";

export function createAppTheme(mode: PaletteMode) {
  const light = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: light ? "#1a7f5a" : "#5cc8a1",
      },
      background: {
        default: light ? "#f5f6fa" : "#0f172a",
        paper: light ? "#ffffff" : "#111827",
      },
    },
    typography: {
      fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
    },
  });
}
