import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOAuthLogin } from "../services/oauth";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      try {
        const returnTo = await completeOAuthLogin(window.location.href);
        navigate(returnTo || "/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete login");
      }
    };

    finish();
  }, [navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", pt: 16 }}>
      <CircularProgress />
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Completing sign-in...
      </Typography>
      {error && (
        <Typography variant="subtitle2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
