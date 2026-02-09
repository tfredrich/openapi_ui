import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useConfigStore } from "../../state/useConfigStore";
import { useAuthStore } from "../../state/useAuthStore";
import { isDevAuthBypassEnabled } from "../../services/devAuthBypass";

type HeaderProps = {
  drawerWidth: number;
};

export function Header({ drawerWidth }: HeaderProps) {
  const { config } = useConfigStore();
  const title = config?.name ?? "OpenAPI Admin Console";
  const nowDate = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
    []
  );
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
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 72 }}>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <OutlinedInput
            size="small"
            placeholder="Search..."
            sx={{ width: 220, bgcolor: "#f8fafc" }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
          />
          <Button variant="outlined" color="inherit" startIcon={<CalendarMonthOutlinedIcon />} sx={{ textTransform: "none" }}>
            {nowDate}
          </Button>
          <IconButton color="inherit">
            <NotificationsNoneOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit">
            <LightModeOutlinedIcon fontSize="small" />
          </IconButton>
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
            sx={{ textTransform: "none", borderRadius: 2 }}
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
