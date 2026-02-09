import { useMemo } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useConfigStore } from "../../state/useConfigStore";
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
          {isBypassEnabled ? (
            <Chip
              label="Auth bypass active"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          ) : null}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
