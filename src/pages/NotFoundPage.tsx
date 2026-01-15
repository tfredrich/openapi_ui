import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Box sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to home
      </Button>
    </Box>
  );
}
