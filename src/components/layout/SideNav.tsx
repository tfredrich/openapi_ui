import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import { useConfigStore } from "../../state/useConfigStore";
import { encodeCollectionPath } from "../../utils/routes";
import { NavItem } from "../../../schemas/config.schema";
import { useAuthStore } from "../../state/useAuthStore";

export function SideNav() {
  const { config } = useConfigStore();
  const location = useLocation();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();

  const navItems = useMemo(() => config?.navigation ?? [], [config]);
  const appName = config?.name ?? "OpenAPI Admin Console";
  const userName = user?.name ?? "Admin User";
  const userEmail = "admin@example.com";

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
      const key = `${item.label}-${item.path ?? depth}`;
      if (item.children && item.children.length > 0) {
        const open = openMap[key] ?? true;
        return (
          <Box key={key}>
            <ListItemButton
              onClick={() => toggle(key)}
              sx={{
                pl: 2 + depth * 2,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <FolderOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
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

      const path = item.path ?? "";
      return (
        <ListItemButton
          key={key}
          component={RouterLink}
          to={`/${encodeCollectionPath(path)}`}
          selected={isActive(path)}
          sx={{
            pl: 2 + depth * 2,
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "#e9edf7",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {depth === 0 ? <HomeOutlinedIcon fontSize="small" /> : <FolderOutlinedIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      );
    });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 1.5, py: 2 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          border: "1px solid #dbe2f0",
          borderRadius: 2.5,
          bgcolor: "#ffffff",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {appName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Web app
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 1, fontWeight: 700 }}>
        RESOURCES
      </Typography>
      <List component="nav" sx={{ pt: 0 }}>
        {navItems.length === 0 ? <ListItemButton disabled sx={{ borderRadius: 2 }}><ListItemText primary="No navigation configured" /></ListItemButton> : renderItems(navItems)}
      </List>

      <Box sx={{ mt: "auto", pt: 1 }}>
        <List component="nav" sx={{ pt: 0 }}>
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <HelpOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItemButton>
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FeedbackOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItemButton>
        </List>
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: "#ffffff", border: "1px solid #dbe2f0" }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userEmail}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
