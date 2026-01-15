import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { completeSilentLogin } from "../services/oauth";

export function OAuthSilentCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      try {
        await completeSilentLogin(window.location.href);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to refresh session");
      }
    };

    finish();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", pt: 16 }}>
      <CircularProgress />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Refreshing session...
      </Typography>
      {error && (
        <Typography variant="subtitle2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
