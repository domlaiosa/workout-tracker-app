/* ----------------------------- design tokens ----------------------------- */
export const T = {
  bg: "#121519",
  surface: "#1A1F25",
  surface2: "#232A31",
  line: "#2B333B",
  text: "#ECE9E1",
  muted: "#8B949E",
  faint: "#5C656E",
  accent: "#FFB323",
  accentDim: "rgba(255,179,35,0.12)",
  good: "#5BD583",
  danger: "#F2545B",
  display: "'Oswald', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
@keyframes pop { 0%{transform:scale(.85);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes slideup { 0%{transform:translateY(14px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
input::placeholder, textarea::placeholder { color:${T.faint} }
input:focus, textarea:focus { outline:none }
::-webkit-scrollbar{ width:0; height:0 }
`;
