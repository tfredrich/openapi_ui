import { PropsWithChildren } from "react";
import { Box, Drawer } from "@mui/material";
import { Header } from "./Header";
import { SideNav } from "./SideNav";

const drawerWidth = 260;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header drawerWidth={drawerWidth} />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e6e2d9",
          },
        }}
      >
        <SideNav />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
