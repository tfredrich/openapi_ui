import { PropsWithChildren } from "react";
import { Box, Drawer } from "@mui/material";
import { Header } from "./Header";
import { SideNav } from "./SideNav";

const drawerWidth = 260;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f5f6fa",
      }}
    >
      <Header drawerWidth={drawerWidth} />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
            bgcolor: "#f8f9fd",
          },
        }}
      >
        <SideNav />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
          pt: { xs: 10, md: 11 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
