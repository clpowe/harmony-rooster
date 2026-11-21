const declaration = /(--[\w-]+):\s*([^;{}]+);/g;

function declarations(block: string) {
  return Object.fromEntries(
    Array.from(block.matchAll(declaration), ([, name, value]) => [name!, value!.trim()]),
  );
}

export function readOklch(value: string) {
  const match = /^oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)$/.exec(value);
  if (!match) throw new Error(`Expected an opaque OKLCH color, got ${value}`);
  return { lightness: Number(match[1]), chroma: Number(match[2]), hue: Number(match[3]) };
}

export function readDesignTokens(css: string) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const root = /^\s*:root\s*\{([^{}]+)\}/.exec(source);
  if (!root) throw new Error("Design tokens must start with a :root block.");

  const base = declarations(root[1]!);
  const remainder = source.slice(root[0].length).trim();
  const motion =
    /^@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*:root\s*\{([^{}]+)\}\s*\}$/.exec(
      remainder,
    );
  if (remainder && !motion)
    throw new Error("Update the design token export for the new CSS rules.");

  function resolve(value: string, visited: string[]): string {
    const substituted = value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
      if (visited.includes(name) || !base[name]) throw new Error(`Unresolved design token ${name}`);
      return resolve(base[name], [...visited, name]);
    });

    const mix = /^color-mix\(in oklch, (oklch\([^)]+\)) ([\d.]+)%, (oklch\([^)]+\))\)$/.exec(
      substituted,
    );
    if (!mix) {
      if (substituted.startsWith("color-mix(")) {
        throw new Error(`Unsupported design token color mix ${substituted}`);
      }
      return substituted;
    }

    const left = readOklch(mix[1]!);
    const right = readOklch(mix[3]!);
    const weight = Number(mix[2]) / 100;
    const interpolate = (a: number, b: number) =>
      Number((a * weight + b * (1 - weight)).toFixed(9));
    const lightness = interpolate(left.lightness, right.lightness);
    const chroma = interpolate(left.chroma, right.chroma);
    // Both source colors declare a numerical hue. Follow the CSS shorter-hue arc.
    let leftHue = left.hue;
    let rightHue = right.hue;
    if (rightHue - leftHue > 180) leftHue += 360;
    if (leftHue - rightHue > 180) rightHue += 360;
    const hue = Number((interpolate(leftHue, rightHue) % 360).toFixed(9));
    return `oklch(${lightness}% ${chroma} ${hue})`;
  }

  return {
    tokens: Object.fromEntries(
      Object.entries(base).map(([name, value]) => [
        name,
        { value, resolved: resolve(value, [name]) },
      ]),
    ),
    media: motion ? { "(prefers-reduced-motion: reduce)": declarations(motion[1]!) } : {},
  };
}

export function designTokensJson(css: string) {
  return JSON.stringify(readDesignTokens(css), null, 2) + "\n";
}
