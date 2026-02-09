import { AppBar, Avatar, Box, Button, Chip, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import { useConfigStore } from "../../state/useConfigStore";
import { useAuthStore } from "../../state/useAuthStore";
import { isDevAuthBypassEnabled } from "../../services/devAuthBypass";

type HeaderProps = {
  drawerWidth: number;
};

export function Header({ drawerWidth }: HeaderProps) {
  const { config } = useConfigStore();
  const title = config?.name ?? "OpenAPI Admin Console";
  const { user } = useAuthStore();
  const userName = user?.name ?? "Admin User";
  const avatarUrl =
    user?.avatarUrl ??
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%25' height='100%25' fill='%23d7e4df'/><circle cx='32' cy='24' r='12' fill='%2385a59a'/><rect x='14' y='40' width='36' height='16' rx='8' fill='%2385a59a'/></svg>";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isBypassEnabled = isDevAuthBypassEnabled();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        borderBottom: "1px solid #e6e2d9",
        backgroundColor: "#fdfcf7",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              border: "2px solid #1a7f5a",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isBypassEnabled ? (
            <Chip
              label="Auth bypass active"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
          <Button
            variant="outlined"
            color="primary"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            startIcon={<Avatar alt={userName} src={avatarUrl} sx={{ width: 28, height: 28 }} />}
            sx={{ textTransform: "none" }}
          >
            {userName}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
