import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
for (const w of ["500", "700", "800"]) loadFont({ family: "Inter Tight", url: staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`), weight: w, format: "woff2" });
export const FONT = "'Inter Tight', 'Helvetica Neue', Arial, sans-serif";
