import { Box, Collapse, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useConfigStore } from "../../state/useConfigStore";
import { encodeCollectionPath } from "../../utils/routes";
import { NavItem } from "../../../schemas/config.schema";

export function SideNav() {
  const { config } = useConfigStore();
  const location = useLocation();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const navItems = useMemo(() => config?.navigation ?? [], [config]);

  const toggle = (key: string) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    const target = `/collections/${encodeCollectionPath(path)}`;
    return location.pathname.startsWith(target);
  };

  const renderItems = (items: NavItem[], depth = 0) =>
    items.map((item) => {
      const key = `${item.label}-${item.path ?? depth}`;
      if (item.children && item.children.length > 0) {
        const open = openMap[key] ?? true;
        return (
          <Box key={key}>
            <ListItemButton onClick={() => toggle(key)} sx={{ pl: 2 + depth * 2 }}>
              <ListItemText primary={item.label} />
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
          to={`/collections/${encodeCollectionPath(path)}`}
          selected={isActive(path)}
          sx={{ pl: 2 + depth * 2 }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      );
    });

  return (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Resources
      </Typography>
      <List component="nav">
        {navItems.length === 0 ? (
          <ListItemButton disabled>
            <ListItemText primary="No navigation configured" />
          </ListItemButton>
        ) : (
          renderItems(navItems)
        )}
      </List>
    </Box>
  );
}
