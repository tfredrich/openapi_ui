import { PropsWithChildren } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "../theme";

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
