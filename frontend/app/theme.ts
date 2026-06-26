"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1b4d3e",
      light: "#f0f7f4",
      dark: "#12352b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#78716c",
      light: "#e7e5e4",
      dark: "#44403c",
    },
    error: {
      main: "#7a1f2b",
      light: "#f5dce0",
      dark: "#65081f",
    },
    success: {
      main: "#1b4d3e",
      light: "#f0f7f4",
      dark: "#12352b",
    },
    background: {
      default: "#fafaf9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1c1917",
      secondary: "#57534e",
    },
  },
  typography: {
    fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
    h2: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
    h3: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
    h4: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
    h5: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
    h6: {
      fontFamily: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontWeight: 800,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          boxShadow: "none",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateY(0)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(27, 77, 62, 0.15)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease-in-out",
          "&:active": {
            transform: "scale(0.92)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e7e5e4",
          boxShadow: "0 4px 12px rgba(28, 25, 23, 0.02)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: "1px solid #e7e5e4",
          boxShadow: "0 24px 64px rgba(28, 25, 23, 0.08)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: "1px solid #e7e5e4",
          boxShadow: "0 12px 32px rgba(28, 25, 23, 0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "background-color 0.15s ease, color 0.15s ease",
          margin: "4px 8px",
          padding: "8px 12px",
          "&:hover": {
            backgroundColor: "#f0f7f4",
            color: "#1b4d3e",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&.Mui-focused": {
              boxShadow: "0 0 0 4px rgba(27, 77, 62, 0.1)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1px",
                borderColor: "#1b4d3e",
              },
            },
          },
        },
      },
    },
  },
});
