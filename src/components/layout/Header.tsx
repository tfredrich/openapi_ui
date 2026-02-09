import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Popover,
  Toolbar,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useLocation } from "react-router-dom";
import { NavItem } from "../../../schemas/config.schema";
import { encodeCollectionPath } from "../../utils/routes";

type HeaderProps = {
  drawerWidth: number;
};

export function Header({ drawerWidth }: HeaderProps) {
  const { config } = useConfigStore();
  const { preference, resolvedMode, setPreference } = useColorMode();
  const location = useLocation();
  const selectedNavLabel = useMemo(
    () => findSelectedNavLabel(config?.navigation ?? [], location.pathname) ?? "Home",
    [config?.navigation, location.pathname]
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const nowDate = useMemo(
    () => selectedDate.format("MMM D, YYYY"),
    [selectedDate]
  );
  const isBypassEnabled = isDevAuthBypassEnabled();
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
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
        mx: 0.25,
        my: 0.125,
        minHeight: 34,
        py: 0.5,
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
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Typography variant="body2" color="text.secondary">
            Home
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedNavLabel}
          </Typography>
        </Breadcrumbs>
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
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CalendarMonthOutlinedIcon />}
            sx={{ textTransform: "none" }}
            onClick={(event) => setDateAnchorEl(event.currentTarget)}
          >
            {nowDate}
          </Button>
          <Popover
            open={Boolean(dateAnchorEl)}
            anchorEl={dateAnchorEl}
            onClose={() => setDateAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(value) => {
                  if (!value) return;
                  setSelectedDate(value);
                  setDateAnchorEl(null);
                }}
              />
            </LocalizationProvider>
          </Popover>
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
            MenuListProps={{ dense: true }}
            PaperProps={{
              sx: {
                mt: 1,
                p: 0.5,
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

function findSelectedNavLabel(items: NavItem[], pathname: string): string | undefined {
  for (const item of items) {
    if (item.path) {
      const target = `/${encodeCollectionPath(item.path)}`;
      if (pathname.startsWith(target)) {
        return item.label;
      }
    }
    if (item.children?.length) {
      const nested = findSelectedNavLabel(item.children, pathname);
      if (nested) return nested;
    }
  }
  return undefined;
}
