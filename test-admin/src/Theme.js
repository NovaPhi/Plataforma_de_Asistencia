import { defaultTheme } from "react-admin";
 
export const theme = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: { main: "#0b5a8a" },
    background: { default: "#ffffff", paper: "#ffffff" },
  },
  typography: {
    ...defaultTheme.typography,
    fontFamily: '"Noto Sans", "Segoe UI", Arial, sans-serif',
  },
  shape: { borderRadius: 6 },
  components: {
    ...defaultTheme.components,
    RaSidebar: {
      styleOverrides: {
        root: { "& .RaSidebar-fixed": { backgroundColor: "#fff" } },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          "&.RaMenuItemLink-active": {
            backgroundColor: "#e6eef4",
            color: "#0b5a8a",
            fontWeight: 600,
            "& .RaMenuItemLink-icon": { color: "#0b5a8a" },
          },
        },
      },
    },
  },
};
