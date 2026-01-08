import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { AppShell } from "./components/layout/AppShell";
import { AppRoutes } from "./router";
import { loadConfig } from "./services/configLoader";
import { loadOas } from "./services/oasLoader";
import { buildOperationRegistry } from "./services/operationRegistry";
import { useConfigStore } from "./state/useConfigStore";
import { useOasStore } from "./state/useOasStore";
import { useRegistryStore } from "./state/useRegistryStore";

export function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setConfig } = useConfigStore();
  const { setOas } = useOasStore();
  const { setRegistry } = useRegistryStore();

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const config = await loadConfig("/config.json");
        if (!active) return;
        setConfig(config);

        const oas = await loadOas(config.oas_source);
        if (!active) return;
        setOas(oas);

        const registry = buildOperationRegistry(oas);
        if (!active) return;
        setRegistry(registry);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to initialize app");
      } finally {
        if (active) setLoading(false);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [setConfig, setOas]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
