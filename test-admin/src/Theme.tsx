import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createTheme } from "@mui/material";

// tema hecho con Claude a partir del mockup y las fuentes, mejorado con más prompts para accesibilidad y diseño / Ayudado por Claude
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
const FONT_DISLEXIA = '"OpenDyslexic", "OpenDyslexic", OpenDyslexic, OpenDyslexic';

/* ---------- MUI theme built from the tokens ---------- */

// es la funcion que crea el tema, tiene todos los colores dependiendo del modo
// y cambia la fuente si dyslexia es true. react-admin elige entre lightTheme y darkTheme
export function buildTheme(mode: ThemeMode, dyslexia = false) {
  const c = colors[mode];
  const titulos = dyslexia ? FONT_DISLEXIA : FONT_TITULOS;
  const texto = dyslexia ? FONT_DISLEXIA : FONT_TEXTO;

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
    // los textos y headers
    typography: {
      fontFamily: texto,
      h1: { fontFamily: titulos, fontWeight: 700, fontSize: 32, lineHeight: "40px" },
      h2: { fontFamily: titulos, fontWeight: 700, fontSize: 24, lineHeight: "32px" },
      h3: { fontFamily: titulos, fontWeight: 600, fontSize: 20, lineHeight: "28px" },
      h4: { fontFamily: titulos, fontWeight: 600, fontSize: 17, lineHeight: "24px" },
      h5: { fontFamily: titulos, fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    // que color y estilo lleva cada componente
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "input.MuiSelect-nativeInput": {
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
      MuiButton: {
        styleOverrides: {
          sizeMedium: { minHeight: 48 },
          sizeLarge: { minHeight: 56 },
        },
      },
      // visible keyboard focus ring on every MUI control
      MuiButtonBase: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": { boxShadow: c.foco } },
        },
      },
      // los textfields
      MuiTextField: {
        styleOverrides: {
          root: { "& .MuiOutlinedInput-notchedOutline": { borderColor: c.lineaFuerte } },
        },
      },
      // quita el gradiente de elevacion en modo oscuro
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
      // menus
      MuiMenu: {
        styleOverrides: {
          paper: { backgroundColor: c.superficieElevada, color: c.tinta },
        },
      },
      // lo que esta seleccionado
      MuiSelect: {
        styleOverrides: {
          select: { color: c.tinta, backgroundColor: c.superficieElevada },
          icon: { color: c.tinta },
        },
      },
      // los items de menus
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: c.tinta,
            "&.Mui-selected": { backgroundColor: c.accionSuave, color: c.tinta },
            "&.Mui-selected:hover, &:hover": { backgroundColor: c.accionSuave },
          },
        },
      },
    },
  });
}

/* ---------- Provider: fuente para dislexia ---------- */
// el claro/obscuro lo maneja react-admin con ToggleThemeButton,
// aqui solo se guarda si la fuente para dislexia esta activa

type DyslexiaValue = { dyslexia: boolean; toggleDyslexia: () => void };
const DyslexiaContext = createContext<DyslexiaValue | null>(null);

function initialDyslexia(): boolean {
  try { return localStorage.getItem("dyslexia") === "true"; } catch { return false; }
}

export function DyslexiaProvider({ children }: { children: ReactNode }) {
  const [dyslexia, setDyslexia] = useState<boolean>(initialDyslexia);

  // guarda la preferencia para que se conserve al recargar
  useEffect(() => {
    try { localStorage.setItem("dyslexia", String(dyslexia)); } catch { /* ignore */ }
  }, [dyslexia]);

  const value = useMemo(
    () => ({ dyslexia, toggleDyslexia: () => setDyslexia((d) => !d) }),
    [dyslexia]
  );

  return <DyslexiaContext.Provider value={value}>{children}</DyslexiaContext.Provider>;
}

/** Use this in the AppBar button and in App to rebuild the themes. */
export function useDyslexia() {
  const ctx = useContext(DyslexiaContext);
  if (!ctx) throw new Error("useDyslexia must be used inside <DyslexiaProvider>");
  return ctx;
}

/* ---------- Fonts (call once) ---------- */

