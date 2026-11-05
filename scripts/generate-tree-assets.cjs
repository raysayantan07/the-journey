// Development-only rasterization of the existing Tree artwork; no native dependency.
// Requires TypeScript, React DOM, and sharp in the generation environment.
const fs = require("node:fs");
const { Buffer } = require("node:buffer");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const root = path.dirname(require.resolve("../package.json"));
function load(relative, resolve) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const output = { exports: {} };
  new Function("require", "module", "exports", code)(
    resolve,
    output,
    output.exports,
  );
  return output.exports;
}
const { themes } = load("src/design/tokens.ts", require);
const names = {
  Circle: "circle",
  Defs: "defs",
  Ellipse: "ellipse",
  G: "g",
  LinearGradient: "linearGradient",
  Path: "path",
  Polygon: "polygon",
  RadialGradient: "radialGradient",
  Rect: "rect",
  Stop: "stop",
  Text: "text",
};
const { Tree, WorldDefs } = load("src/journey/WorldArt.tsx", (name) => {
  if (name === "react-native") return { Platform: { OS: "web" } };
  if (name === "react-native-svg") return names;
  if (name === "react-native-reanimated")
    return { __esModule: true, default: { createAnimatedComponent: (x) => x } };
  if (name === "../components/useAmbientPhase") return {};
  if (name === "../design/tokens") return { themes };
  return require(name);
});
async function main() {
  const output = path.join(root, "assets/trees");
  fs.mkdirSync(output, { recursive: true });
  for (const [tier, theme] of Object.entries(themes))
    for (const variant of [0, 1]) {
      const svg = renderToStaticMarkup(
        React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: 128,
            height: 128,
            viewBox: "-64 -96 128 128",
          },
          React.createElement(WorldDefs),
          React.createElement(Tree, { x: 0, y: 0, variant, theme }),
        ),
      );
      for (const scale of [1, 2, 3])
        await sharp(Buffer.from(svg), { density: 72 * scale })
          .png()
          .toFile(
            path.join(
              output,
              `${tier}-${variant}${scale === 1 ? "" : "@" + scale + "x"}.png`,
            ),
          );
    }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
