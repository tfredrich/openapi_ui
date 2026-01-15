import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AppRoutes } from "./router";
import { loadConfig } from "./services/configLoader";
import { loadOas } from "./services/oasLoader";
import { buildOperationRegistry } from "./services/operationRegistry";
import { useConfigStore } from "./state/useConfigStore";
import { useOasStore } from "./state/useOasStore";
import { useRegistryStore } from "./state/useRegistryStore";
import { ensureAuthenticated, setOAuthConfig } from "./services/oauth";

export function App() {
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { config, setConfig } = useConfigStore();
  const { setOas } = useOasStore();
  const { setRegistry } = useRegistryStore();
  const location = useLocation();

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

  useEffect(() => {
    if (!config) return;
    setOAuthConfig(config.security_config);
  }, [config]);

  useEffect(() => {
    if (loading || error) return;
    const oauthEnabled = config?.security_config?.type === "oauth2";
    if (!oauthEnabled) {
      setAuthReady(true);
      setAuthError(null);
      return;
    }
    if (location.pathname.startsWith("/oauth/callback") || location.pathname.startsWith("/oauth/silent")) {
      setAuthReady(true);
      setAuthError(null);
      return;
    }
    let active = true;
    setAuthReady(false);
    setAuthError(null);
    ensureAuthenticated()
      .then((ready) => {
        if (active) {
          setAuthReady(ready);
        }
      })
      .catch((err) => {
        if (active) {
          const message = err instanceof Error ? err.message : "Failed to initialize OAuth";
          setAuthError(message);
          setAuthReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [loading, error, location.pathname, config]);

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

  if (authError) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">OAuth configuration error: {authError}</Typography>
      </Box>
    );
  }

  if (!authReady) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
