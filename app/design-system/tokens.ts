import css from "@/assets/css/global/tokens.css?raw";
import { designTokensJson, readDesignTokens, readOklch } from "@utils/design-tokens";

export const tokenCss = css;
export const tokenJson = designTokensJson(css);
export const { tokens, media } = readDesignTokens(css);

const uses: Record<string, string> = {
  "clr-primary-100": "Date tags, selected tint, light focus halo, text selection",
  "clr-primary-300": "Light teal highlights and decoration",
  "clr-primary-400": "Mid-teal scale step reserved for highlights",
  "clr-primary-500": "Primary actions, links, icons, solid selections and the Apply band",
  "clr-primary-600": "Hovered links and pressed primary buttons",
  "clr-primary-700": "Selected text on the light teal selection background",
  "clr-accent-300": "Amber buttons in the application",
  "clr-accent-400": "Brand-area amber buttons, link underlines and warning tint",
  "clr-accent-500": "Pressed amber buttons, step numerals, receipt rule and limited seat fill",
  "clr-accent-600": "Eyebrows, warning text and limited seat labels",
  "clr-accent-900": "Ink on amber buttons",
  "clr-neutral-100": "White surfaces, inverse actions and text on teal",
  "clr-neutral-200": "Page and muted surfaces",
  "clr-neutral-300": "Meter tracks and disabled button fills and borders",
  "clr-neutral-400": "Shared borders, rules and the full-session meter fill",
  "clr-neutral-500": "Full seat-meter fill",
  "clr-neutral-600": "Subtle text, disabled button ink and default session meter fill",
  "clr-neutral-700": "Muted text",
  "clr-neutral-900": "Main ink",
  "clr-danger-500": "Invalid field borders, error messages and full-status color mixes",
  "clr-success-500": "Confirmed statuses, success messages and copied indicators",
  "clr-text": "Headings, data values and field text",
  "clr-text-muted": "Body text, secondary labels and metadata",
  "clr-text-subtle": "Placeholders, hints and unavailable data",
  "clr-surface": "Cards, panels, inputs and white hover-ring gaps",
  "clr-surface-page": "Page background",
  "clr-surface-muted": "Nested cards, secondary panels and disabled fields",
  "clr-border": "Dividers, fields and outline controls",
  "clr-interactive": "Default link text",
  "clr-status-full": "Full-status background and inverse form error ink",
  "clr-status-full-strong": "Full-status tag ink",
  "ff-base": "Application UI, headings and body",
  "ff-mono": "Eyebrows, date tags, receipt identifiers, step numerals and code",
  "ff-brand": "Protected homepage hero, site header and footer",
  "text-meta": "Metadata, compact chips and small brand controls",
  "text-caption": "Status pills, metadata, hints and compact controls",
  "text-eyebrow": "Base type size in protected brand sections",
  "text-compact-heading": "Compact titles, course-card prices and quotes",
  "text-brand-display": "Protected hero display type",
  "text-display-xl": "Largest Typography headline",
  "text-display-lg": "Page titles and Apply band",
  "text-display-md": "Receipt status title",
  "text-heading-1": "Section title and default h2",
  "text-heading-2": "Subsection title and default h3",
  "text-heading-3": "Card-scale heading and default h4",
  "text-heading-4": "Small headings, step titles and default h5",
  "text-lede": "Introductory lede",
  "text-body-lg": "Large body, accordion questions and section introductions",
  "text-body": "Body default, labels and default button text",
  "text-small": "Field labels, helper copy and small buttons",
  "text-numeral": "Large step numerals",
  "fw-light": "Protected brand heading weight",
  "fw-regular": "Body, standard headings and protected brand button weight",
  "fw-medium": "Application buttons, field labels and small titles",
  "fw-semibold": "Bold Typography modifier and selected emphasis",
  "fw-bold": "Strong text and protected navigation emphasis",
  "lh-tight": "Protected brand headings",
  "lh-snug": "Compact labels, tags, card titles and accordion questions",
  "lh-base": "Protected brand-area body leading",
  "lh-display": "Display titles and step numerals",
  "lh-heading": "Default application heading leading",
  "lh-body": "Application body, field labels and summary values",
  "tracking-display": "Large headlines and large numerals",
  "tracking-heading": "Default application heading tracking",
  "tracking-eyebrow": "Uppercase labels",
  "space-100": "Tight label and icon gaps",
  "space-200": "Icon gaps, labels and compact control padding",
  "space-300": "Field block padding, tile gaps and detail-row inset",
  "space-400": "Default field inline padding, dividers and content stacks",
  "space-450": "Contact form stack and accordion block padding",
  "space-500": "Default button inline padding, cards and content stacks",
  "space-600": "Large button inset, course card padding and larger gaps",
  "space-700": "Compact responsive panel or content spacing",
  "space-800": "Protected footer and large responsive regions",
  "space-panel": "Responsive panel and receipt padding",
  "space-layout": "Responsive split-layout gap",
  "space-section": "Section spacing",
  "radius-300": "Course cards and session tiles",
  "radius-400": "Protected media and the inner-radius base",
  "radius-pill": "Pill buttons, tags and circular icon discs",
  "radius-input": "Text inputs, selects and textareas",
  "radius-nested": "Nested media and compact banners",
  "radius-inner": "Inner surfaces and status banners",
  "radius-card": "Step cards and receipt shells",
  "radius-panel": "Large panels and dialogs",
  "border-width": "Shared control borders, rows and rules",
  "shadow-100": "Light elevation on cards and session tiles",
  "shadow-200": "Elevated dialog and summary surfaces",
  "wrapper-max": "Application content wrapper maximum width",
  "wrapper-brand-max": "Protected hero, header and footer wrapper maximum",
  "wrapper-gutter": "Application wrapper inset on each side",
  "wrapper-brand-gutter": "Responsive protected brand wrapper inset on each side",
  measure: "Compact reading width",
  "measure-readable": "Long-form body and messages",
  "measure-narrow": "Receipt and narrow content columns",
  "ratio-photo": "Reserved 4:3 photo aspect ratio",
  "duration-fast": "Control transitions",
  "duration-base": "Base motion timing",
  "ease-standard": "Shared control transition easing",
  "focus-ring-width": "Keyboard outline and field halo width",
  "focus-ring-offset": "Gap between a keyboard outline and the control",
  "focus-ring-color": "Default keyboard outline color",
  "touch-target": "Compact action and link minimum target",
  "control-size": "Base input and large button minimum height",
  "control-size-small": "Accordion toggle diameter",
  "control-size-icon": "Square icon button and icon disc size",
};

function bounds(value: string) {
  const clamp = /^clamp\(([^,]+), [^,]+, ([^)]+)\)$/.exec(value);
  if (clamp) return `${length(clamp[1]!)} – ${length(clamp[2]!)}`;
  return length(value) === value ? "" : length(value);
}

function length(value: string) {
  const match = /^([\d.]+)rem$/.exec(value);
  return match ? `${Number(match[1]) * 16}px` : value;
}

export function tokenValue(value: string) {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    const token = tokens[name];
    if (!token) throw new Error(`Missing design token ${name}`);
    return token.resolved;
  });
}

const entries = Object.entries(tokens).map(([name, token]) => {
  const use = uses[name.slice(2)];
  if (!use) throw new Error(`Missing design token documentation for ${name}`);
  return { name, ...token, use, bounds: bounds(token.resolved) };
});

export const tokenGroups = [
  ["Primary teal", /^--clr-primary-/],
  ["Amber accent", /^--clr-accent-/],
  ["Neutral", /^--clr-neutral-/],
  ["Text, surface, border and interactive roles", /^--clr-(text|surface|border|interactive)/],
  ["Feedback", /^--clr-(danger|success|status)/],
  ["Font stacks, size, weight, line height and tracking", /^--(ff|text|fw|lh|tracking)-/],
  ["Spacing", /^--space-/],
  ["Radius, borders and elevation", /^--(radius|border|shadow)-/],
  ["Layout and proportions", /^--(wrapper|measure|ratio)/],
  ["Controls, focus and motion", /^--(control|focus|touch|duration|ease)-/],
].map(([label, pattern]) => ({
  label: label as string,
  tokens: entries.filter(({ name }) => (pattern as RegExp).test(name)),
}));

export const quickStart = [
  ["Primary", "--clr-primary-500"],
  ["Accent", "--clr-accent-300"],
  ["Text", "--clr-text"],
  ["Surface", "--clr-surface"],
  ["Border", "--clr-border"],
  ["Font family", "--ff-base"],
  ["Base font size", "--text-body"],
  ["Input minimum height", "--control-size"],
  ["Input radius", "--radius-input"],
  ["Button radius", "--radius-pill"],
].map(([label, name]) => ({ label, ...entries.find((token) => token.name === name)! }));

const surface = "var(--clr-surface)";
const page = "var(--clr-surface-page)";
const white = "var(--clr-neutral-100)";
const teal = "var(--clr-primary-500)";
const paleTeal = "var(--clr-primary-100)";
const amberInk = "var(--clr-accent-900)";

export const contrastPairs = [
  ["Headings and data on panels", "var(--clr-text)", surface],
  ["Headings and data on the page", "var(--clr-text)", page],
  ["Application body", "var(--clr-text-muted)", page],
  ["Secondary labels", "var(--clr-text-muted)", surface],
  ["Hints and placeholders on white", "var(--clr-text-subtle)", surface],
  ["Subtle ink on muted surfaces", "var(--clr-text-subtle)", page],
  ["Links and inverse actions on white", teal, surface],
  ["Links on the page", teal, page],
  ["Hovered links on white", "var(--clr-primary-600)", surface],
  ["Primary buttons, solid filters and teal panels", white, teal],
  ["Pressed primary buttons", white, "var(--clr-primary-600)"],
  ["Date tags, tinted filters and pending statuses", teal, paleTeal],
  ["Text selection", "var(--clr-primary-700)", paleTeal],
  ["Amber buttons", amberInk, "var(--clr-accent-300)"],
  ["Amber buttons in protected brand sections", amberInk, "var(--clr-accent-400)"],
  ["Pressed amber buttons", amberInk, "var(--clr-accent-500)"],
  ["Eyebrows and limited-seat labels on white", "var(--clr-accent-600)", surface],
  ["Decorative numerals on muted cards", "var(--clr-accent-500)", page],
  ["Form error on white", "var(--clr-danger-500)", surface],
  ["Form error on teal", "var(--clr-status-full)", teal],
  ["Full-status tags", "var(--clr-status-full-strong)", "var(--clr-status-full)"],
  ["Success text on white", "var(--clr-success-500)", surface],
  [
    "Success pill",
    "var(--clr-success-500)",
    `color-mix(in srgb, var(--clr-success-500) 12%, ${surface})`,
  ],
  [
    "Warning pill",
    "var(--clr-accent-600)",
    `color-mix(in srgb, var(--clr-accent-400) 12%, ${surface})`,
  ],
  ["Disabled button text (inactive)", "var(--clr-neutral-600)", "var(--clr-neutral-300)"],
].map(([use, foreground, background]) => ({
  use: use!,
  foreground: foreground!,
  background: background!,
  foregroundValue: tokenValue(foreground!),
  backgroundValue: tokenValue(background!),
}));

function linearSrgb(value: string): number[] {
  const mix = /^color-mix\(in srgb, (oklch\([^)]+\)) ([\d.]+)%, (oklch\([^)]+\))\)$/.exec(value);
  const fromGamma = (c: number) =>
    Math.abs(c) <= 0.04045 ? c / 12.92 : Math.sign(c) * ((Math.abs(c) + 0.055) / 1.055) ** 2.4;
  if (mix) {
    const toGamma = (c: number) =>
      Math.abs(c) <= 0.0031308
        ? c * 12.92
        : Math.sign(c) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055);
    const left = linearSrgb(mix[1]!).map(toGamma);
    const right = linearSrgb(mix[3]!).map(toGamma);
    const weight = Number(mix[2]) / 100;
    return left.map((channel, i) => fromGamma(channel * weight + right[i]! * (1 - weight)));
  }
  const { lightness, chroma, hue } = readOklch(value);
  const l = lightness / 100;
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const x = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const y = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const z = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z,
    -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z,
    -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z,
  ];
}

export function contrastRatio(foreground: string, background: string) {
  const weights = [0.2126, 0.7152, 0.0722];
  const luminance = (value: string) =>
    linearSrgb(value).reduce(
      (sum, channel, i) => sum + Math.min(1, Math.max(0, channel)) * weights[i]!,
      0,
    );
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const outline = "var(--clr-border)";
const text = "var(--clr-text)";
const neutralFill = "var(--clr-neutral-300)";
const neutralInk = "var(--clr-neutral-600)";
const linkHover = "var(--clr-primary-600)";
const amber = "var(--clr-accent-300)";
const amberBrand = "var(--clr-accent-400)";
const disabledButton = `${neutralInk} on ${neutralFill}; border ${neutralFill}; no hover ring`;

export const interactiveColors = [
  [
    "Primary button",
    `${white} on ${teal}`,
    `Same fill and ink; outer ring ${teal}`,
    `${white} on ${linkHover}`,
    disabledButton,
  ],
  [
    "Amber button",
    `${amberInk} on ${amber}`,
    `Same fill and ink; outer ring ${amber}`,
    `${amberInk} on var(--clr-accent-500)`,
    disabledButton,
  ],
  [
    "Amber button in hero, header and footer",
    `${amberInk} on ${amberBrand}`,
    `Same fill and ink; outer ring ${amberBrand}`,
    "Same fill and ink as default",
    disabledButton,
  ],
  [
    "Secondary button",
    `${teal} on transparent; border ${teal}`,
    `Same fill and ink; outer ring ${teal}`,
    `${teal} on ${paleTeal}`,
    disabledButton,
  ],
  [
    "Inverse button",
    `${teal} on ${white}`,
    `Same fill and ink; outer ring ${white}`,
    `${teal} on ${paleTeal}`,
    disabledButton,
  ],
  [
    "Ghost and icon buttons",
    `${text} on transparent; border ${outline}`,
    `Same fill and ink; outer ring ${teal}`,
    `${text} on ${paleTeal}`,
    disabledButton,
  ],
  [
    "Text link",
    teal,
    `${linkHover}; underline ${amberBrand}`,
    "Inherits the current ink",
    "Use the disabled action-link pattern when applicable",
  ],
  [
    "Text field",
    `${text} on ${surface}; border ${outline}`,
    "Same colors as default",
    "Same colors as default; keyboard focus changes the border and adds a halo",
    `var(--clr-text-subtle) on var(--clr-surface-muted); default border`,
  ],
  [
    "Solid filter",
    `${text} on transparent; border ${outline}`,
    `Border ${teal}; same fill and ink`,
    `Selected: ${white} on ${teal}; border ${teal}`,
    "Unavailable in this component API",
  ],
  [
    "Tint filter",
    `${text} on transparent; border ${outline}`,
    `Border ${teal}; same fill and ink`,
    `Selected: ${teal} on ${paleTeal}; border ${teal}`,
    "Unavailable in this component API",
  ],
  [
    "Accordion toggle",
    `Inherited ink on transparent; border ${outline}`,
    "Same colors as default",
    `Open: ${white} on ${teal}; transparent border`,
    "Unavailable in this component API",
  ],
  [
    "Session tile",
    `${text} on ${surface}; transparent border`,
    `Border ${teal} when enabled`,
    `Selected solid: ${white} on ${teal}; selected tint: ${text} on ${paleTeal}; both have ${teal} borders`,
    `Full: var(--clr-text-subtle) on color-mix(in oklch, ${surface} 65%, ${page}); transparent border`,
  ],
  [
    "Session scroll control",
    `${text} on ${surface}; border ${outline}`,
    `Ink and border ${teal} when enabled`,
    "Inherits the current colors",
    "var(--clr-text-subtle) at 0.6 opacity on the whole control",
  ],
].map(([control, idle, hover, pressed, disabled]) => ({
  control: control!,
  states: [idle!, hover!, pressed!, disabled!].map((state) => ({
    source: state,
    value: tokenValue(state),
  })),
}));
