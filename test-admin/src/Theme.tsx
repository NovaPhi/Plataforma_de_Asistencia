import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";

/* ---------- Tokens ---------- */
// los colores para todas las posibles cosas tanto para modo claro y obscuro
const light = {
  accion: "#005480", accionHover: "#00446a", onAccion: "#ffffff", accionSuave: "#e6eef2",
  superficie: "#f2f3f4", superficieElevada: "#ffffff", superficieHundida: "#e6e7e8",
  linea: "#bcbec0", lineaFuerte: "#848688",
  tinta: "#231f20", tintaSuave: "#58595b",
  presente: "#1e7b3c", justificado: "#4f46a5", falta: "#b3261e",
  comision: "#0b6e7f", filtro: "#a3326e", atencion: "#7a5f00",
  foco: "0 0 0 2px #ffffff, 0 0 0 5px #005480",
};

const dark: typeof light = {
  accion: "#7db3d6", accionHover: "#a3cbe5", onAccion: "#0a1a24", accionSuave: "#16364a",
  superficie: "#10181d", superficieElevada: "#18232a", superficieHundida: "#0b1115",
  linea: "#33414a", lineaFuerte: "#6b7a84",
  tinta: "#eef1f3", tintaSuave: "#b4bec5",
  presente: "#7ed99a", justificado: "#b8b2f0", falta: "#ff9a8f",
  comision: "#74d4e4", filtro: "#f4a3cf", atencion: "#f2d06b",
  foco: "0 0 0 2px #10181d, 0 0 0 5px #7db3d6",
};

const colors = { light, dark };
export type ThemeMode = "light" | "dark";

// los fonts usados 
const FONT_TITULOS = '"Encode Sans", Arial, sans-serif';
const FONT_TEXTO = '"Noto Sans", Arial, sans-serif';

/* ---------- MUI theme built from the tokens ---------- */

export function buildTheme(mode: ThemeMode) {
  const c = colors[mode];
  // es la funcion que crea el tema tiene todas los colores dependiendo lo que esta pasando y es lo que usa el front
  return createTheme({
    palette: {
      mode,
      primary: { main: c.accion, dark: c.accionHover, contrastText: c.onAccion },
      success: { main: c.presente, contrastText: c.onAccion },   // PRESENTE
      error: { main: c.falta, contrastText: c.onAccion },        // FALTA
      warning: { main: c.atencion, contrastText: c.onAccion },
      info: { main: c.comision, contrastText: c.onAccion },
      background: { default: c.superficie, paper: c.superficieElevada },
      text: { primary: c.tinta, secondary: c.tintaSuave },
      divider: c.linea,
    },
    shape: { borderRadius: 4 },
    // esto es para los textos los headers de aria para que tengan color y todo lo necesario
    typography: {
      fontFamily: FONT_TEXTO,
      h1: { fontFamily: FONT_TITULOS, fontWeight: 700, fontSize: 32, lineHeight: "40px" },
      h2: { fontFamily: FONT_TITULOS, fontWeight: 700, fontSize: 24, lineHeight: "32px" },
      h3: { fontFamily: FONT_TITULOS, fontWeight: 600, fontSize: 20, lineHeight: "28px" },
      h4: { fontFamily: FONT_TITULOS, fontWeight: 600, fontSize: 17, lineHeight: "24px" },
      h5: { fontFamily: FONT_TITULOS, fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    // los componentes de que hace cada cosa y que color va a llevar con los elementos de front como botones cards y todo eso 
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "input.MuiSelect-NativeInput": {
            backgroundColor: c.superficieElevada,
            color: c.tinta,
          },
        },
      },
      // la barrita de arriba
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: "#005480", color: "#ffffff" },
        },
      },
      // las cards
      MuiCard: {
        defaultProps: { variant: "outlined" },
        styleOverrides: { root: { borderRadius: 8 } },
      },
      // 48px touch targets on normal and large buttons
      // todos los botones
      MuiButton: {
        styleOverrides: {
          sizeMedium: { minHeight: 48 },
          sizeLarge: { minHeight: 56 },
        },
      },
      // visible keyboard focus ring on every MUI control
      // los aros de enfoque
      MuiButtonBase: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": { boxShadow: c.foco } },
        },
      },
      // los textos
      MuiTextField: {
        styleOverrides: {
          root: { "& .MuiOutlinedInput-notchedOutline": { borderColor: c.lineaFuerte } },
        },
      },
      // el background 
      MuiPaper: {
        styleOverrides: {root: {backgroundImage: "none"}},
      },
      // menus
      MuiMenu: {
        styleOverrides: {
          paper: {backgroundColor: c.superficieElevada, color: c.tinta},
        },
      },
      // y lo que esta seleccionado
      MuiSelect: {
        styleOverrides: {
          select: {color: c.tinta, backgroundClip: c.superficieElevada},
          icon: {color: c.tinta},

        },
      },
      // los items de menus
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: c.tinta,
            "&.Mui-selected": {backgroundColor: c.accionSuave, color:c.tinta},
            "&.Mui-selected:hover, &:hover": {backgroundColor: c.accionSuave},
          },
        },
      },
    },
  });
}

/* ---------- Provider: MUI theme + light/dark toggle ---------- */

type ColorModeValue = { mode: ThemeMode; toggle: () => void };
const ColorModeContext = createContext<ColorModeValue | null>(null);

function initialMode(): ThemeMode {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  useEffect(() => {
    try { localStorage.setItem("theme", mode); } catch { /* ignore */ }
  }, [mode]);

  const value = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
          {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}

/** Use this for the toggle. For colors and spacing, use MUI's own useTheme(). */
export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used inside <ThemeProvider>");
  return ctx;
}

/* ---------- Fonts (call once) ---------- */

export function loadFonts(basePath = "/fonts") {
  [
    new FontFace("Encode Sans", `url(${basePath}/EncodeSans-latin-var.woff2)`, { weight: "100 900" }),
    new FontFace("Noto Sans", `url(${basePath}/NotoSans-latin-var.woff2)`, { weight: "100 900" }),
    new FontFace("Noto Sans", `url(${basePath}/NotoSans-latin-var-italic.woff2)`, { weight: "100 900", style: "italic" }),
  ].forEach((f) => f.load().then((l) => document.fonts.add(l)).catch(() => {}));
}