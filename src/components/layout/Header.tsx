import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

type HeaderProps = {
  drawerWidth: number;
};

export function Header({ drawerWidth }: HeaderProps) {
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
            Agentaux Admin
          </Typography>
        </Box>
        <Button variant="outlined" color="primary">
          Get started
        </Button>
      </Toolbar>
    </AppBar>
  );
}
