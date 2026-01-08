import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a7f5a",
    },
    background: {
      default: "#f7f6f2",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  },
});
