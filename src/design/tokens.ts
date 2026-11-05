export const palette = {
  paper: "#F6F3EB",
  ink: "#293E36",
  muted: "#7F8C7E",
  line: "#DFE5D8",
  white: "#FFFEF9",
  mint: "#BCE6A6",
  green: "#43896B",
  dark: "#294E40",
  gold: "#E7B859",
};
export const motion = {
  camera: 650,
  hop: 420,
  press: { damping: 18, stiffness: 310 },
};
export const softShadow = {
  shadowColor: "#344A31",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 5,
};
export type Theme = {
  name: string;
  label: string;
  top: string;
  light: string;
  left: string;
  right: string;
  accent: string;
  mist: string;
};
export const themes: Record<string, Theme> = {
  base: {
    name: "base",
    label: "A little greener, every day",
    top: "#B9DEA0",
    light: "#D8EBC3",
    left: "#7BAA71",
    right: "#98C183",
    accent: "#527C4E",
    mist: "#DCE8CE",
  },
  solid: {
    name: "solid",
    label: "Solid Year",
    top: "#B4DAE9",
    light: "#E1F2F7",
    left: "#78A6C2",
    right: "#96BBD0",
    accent: "#477C9D",
    mist: "#DCECF0",
  },
  excellent: {
    name: "excellent",
    label: "Excellent Year",
    top: "#84C9AC",
    light: "#C9EBDD",
    left: "#388C73",
    right: "#56A88C",
    accent: "#247C65",
    mist: "#D8EDE2",
  },
  extraordinary: {
    name: "extraordinary",
    label: "Extraordinary Year",
    top: "#C5B5E8",
    light: "#E7DDF8",
    left: "#8D77BA",
    right: "#A18ACD",
    accent: "#8063AC",
    mist: "#E9E1F2",
  },
  champion: {
    name: "champion",
    label: "Champion Year",
    top: "#F0CB81",
    light: "#FBE9BA",
    left: "#C2944E",
    right: "#DFAF63",
    accent: "#AE793B",
    mist: "#F3E9CF",
  },
  legendary: {
    name: "legendary",
    label: "Legendary Year",
    top: "#F7D56C",
    light: "#FFF1B4",
    left: "#C38B35",
    right: "#E4B148",
    accent: "#A57224",
    mist: "#F8E9BD",
  },
};
