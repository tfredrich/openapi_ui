import { useMemo, useState } from "react";
import {
  AppBar,
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
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import { alpha } from "@mui/material/styles";
import { useConfigStore } from "../../state/useConfigStore";
import { isDevAuthBypassEnabled } from "../../services/devAuthBypass";
import { ThemePreference, useColorMode } from "../../providers/AppProviders";

type HeaderProps = {
  drawerWidth: number;
};

export function Header({ drawerWidth }: HeaderProps) {
  const { config } = useConfigStore();
  const { preference, resolvedMode, setPreference } = useColorMode();
  const title = config?.name ?? "OpenAPI Admin Console";
  const nowDate = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
    []
  );
  const isBypassEnabled = isDevAuthBypassEnabled();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);

  const themeIcon = resolvedMode === "dark" ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />;

  const getThemeMenuIcon = (value: ThemePreference) => {
    if (value === "dark") return <DarkModeOutlinedIcon fontSize="small" color="action" />;
    if (value === "light") return <LightModeOutlinedIcon fontSize="small" color="action" />;
    return <SettingsBrightnessOutlinedIcon fontSize="small" color="action" />;
  };

  const renderThemeItem = (value: ThemePreference, label: string) => (
    <MenuItem
      key={value}
      onClick={() => {
        setPreference(value);
        setThemeMenuAnchor(null);
      }}
      sx={{
        borderRadius: 2,
        mx: 0.5,
        my: 0.25,
        ...(preference === value
          ? {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
              color: "primary.main",
            }
          : {}),
      }}
    >
      {label}
      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", pl: 1 }}>{getThemeMenuIcon(value)}</Box>
    </MenuItem>
  );

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
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
            sx={{
              width: 220,
              bgcolor: "action.hover",
            }}
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
          <IconButton color="inherit" onClick={(event) => setThemeMenuAnchor(event.currentTarget)}>
            {themeIcon}
          </IconButton>
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={() => setThemeMenuAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                p: 0.75,
                width: 180,
                borderRadius: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            {renderThemeItem("system", "System")}
            {renderThemeItem("light", "Light")}
            {renderThemeItem("dark", "Dark")}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
