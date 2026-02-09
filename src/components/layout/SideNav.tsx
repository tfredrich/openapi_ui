import {
  Avatar,
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";
import { alpha } from "@mui/material/styles";
import { useConfigStore } from "../../state/useConfigStore";
import { encodeCollectionPath } from "../../utils/routes";
import { getNavCollectionPath } from "../../utils/navigation";
import { NavItem } from "../../../schemas/config.schema";
import { useAuthStore } from "../../state/useAuthStore";
import { ElementType } from "react";

const NAV_ICON_MAP: Record<string, ElementType> = {
  HomeOutlined: HomeOutlinedIcon,
  FolderOutlined: FolderOutlinedIcon,
  DashboardOutlined: DashboardOutlinedIcon,
  TableRowsOutlined: TableRowsOutlinedIcon,
  DescriptionOutlined: DescriptionOutlinedIcon,
  SchemaOutlined: SchemaOutlinedIcon,
  StorageOutlined: StorageOutlinedIcon,
  PeopleOutlined: PeopleOutlinedIcon,
  KeyOutlined: KeyOutlinedIcon,
  PublicOutlined: PublicOutlinedIcon,
  BuildOutlined: BuildOutlinedIcon,
  ExtensionOutlined: ExtensionOutlinedIcon,
  SettingsOutlined: SettingsOutlinedIcon,
  HelpOutlineOutlined: HelpOutlineOutlinedIcon,
  FeedbackOutlined: FeedbackOutlinedIcon,
};

function VerticalEllipsisIcon() {
  return (
    <SvgIcon fontSize="small" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </SvgIcon>
  );
}

export function SideNav() {
  const { config } = useConfigStore();
  const location = useLocation();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthStore();

  const navItems = useMemo(() => config?.navigation ?? [], [config]);
  const appName = config?.title ?? config?.name ?? "OpenAPI Admin Console";
  const appSubTitle = config?.sub_title ?? "Admin Dashboard";
  const userName = user?.name ?? "Admin User";
  const userEmail = "admin@example.com";
  const userInitials = useMemo(
    () =>
      userName
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
        .join("") || "AU",
    [userName]
  );

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    const target = `/${encodeCollectionPath(path)}`;
    return location.pathname.startsWith(target);
  };

  const renderItems = (items: NavItem[], depth = 0) =>
    items.map((item) => {
      const path = getNavCollectionPath(item);
      const key = `${item.label}-${path ?? depth}`;
      const ItemIcon = resolveNavIcon(item, depth);
      if (item.children && item.children.length > 0) {
        const open = openMap[key] ?? true;
        return (
          <Box key={key}>
            <ListItemButton
              onClick={() => toggle(key)}
              sx={{
                pl: 2 + depth * 2,
                borderRadius: 1,
                minHeight: 36,
                py: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ItemIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2" }} />
              {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderItems(item.children, depth + 1)}
              </List>
            </Collapse>
          </Box>
        );
      }

      const resolvedPath = path ?? "";
      return (
        <ListItemButton
          key={key}
          component={RouterLink}
          to={`/${encodeCollectionPath(resolvedPath)}`}
          selected={isActive(resolvedPath)}
          sx={{
            pl: 2 + depth * 2,
            borderRadius: 1,
            minHeight: 36,
            py: 0.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <ItemIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2" }} />
        </ListItemButton>
      );
    });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 2, py: 2 }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: "background.paper",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1">
          {appName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {appSubTitle}
        </Typography>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ px: 1, mb: 1 }}>
        RESOURCES
      </Typography>
      <List component="nav" sx={{ pt: 0 }}>
        {navItems.length === 0 ? <ListItemButton disabled sx={{ borderRadius: 1, minHeight: 36, py: 0.5 }}><ListItemText primary="No navigation configured" primaryTypographyProps={{ variant: "body2" }} /></ListItemButton> : renderItems(navItems)}
      </List>

      <Box sx={{ mt: "auto", pt: 1 }}>
        <List component="nav" sx={{ pt: 0 }}>
          <ListItemButton sx={{ borderRadius: 1, minHeight: 36, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 1, minHeight: 36, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <HelpOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="About" primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 1, minHeight: 36, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FeedbackOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Feedback" primaryTypographyProps={{ variant: "body2" }} />
          </ListItemButton>
        </List>
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: 13,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                color: "primary.main",
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="body2" noWrap>
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {userEmail}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(event) => setUserMenuAnchor(event.currentTarget)}
              aria-label="Open user menu"
            >
              <VerticalEllipsisIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        MenuListProps={{ dense: true }}
        PaperProps={{
          sx: {
            width: 240,
            borderRadius: 3,
            p: 1,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => theme.shadows[8],
          },
        }}
      >
        <MenuItem
          onClick={() => setUserMenuAnchor(null)}
          sx={{
            borderRadius: 2,
            minHeight: 34,
            py: 0.5,
          }}
        >
          Profile
        </MenuItem>
        <MenuItem onClick={() => setUserMenuAnchor(null)} sx={{ minHeight: 34, py: 0.5 }}>My account</MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => setUserMenuAnchor(null)} sx={{ minHeight: 34, py: 0.5 }}>Add another account</MenuItem>
        <MenuItem onClick={() => setUserMenuAnchor(null)} sx={{ minHeight: 34, py: 0.5 }}>Settings</MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => setUserMenuAnchor(null)}
          sx={{
            borderRadius: 2,
            mt: 0.25,
            minHeight: 34,
            py: 0.5,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          Logout
          <LogoutOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
        </MenuItem>
      </Menu>
    </Box>
  );
}

function resolveNavIcon(item: NavItem, depth: number): ElementType {
  if (item.icon) {
    const configuredIcon = NAV_ICON_MAP[item.icon];
    if (configuredIcon) return configuredIcon;
  }
  return depth === 0 ? TableRowsOutlinedIcon : FolderOutlinedIcon;
}
