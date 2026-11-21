<script setup lang="ts">
import fontCss from "@/assets/css/global/fonts.css?raw";
import wordmark from "@/assets/icons/icon-wordmark.svg?raw";
import {
  contrastPairs,
  contrastRatio,
  interactiveColors,
  media,
  quickStart,
  tokenCss,
  tokenGroups,
  tokenJson,
  tokens,
} from "@/design-system/tokens";

const brandColors = [
  ...new Set(Array.from(wordmark.matchAll(/fill="(#[A-Fa-f0-9]{6})"/g), ([, value]) => value)),
];
const assets = [
  {
    name: "Wordmark for light backgrounds",
    file: "wordmark-light",
    mode: "light",
    width: 132,
    height: 40,
  },
  {
    name: "Wordmark for dark backgrounds",
    file: "wordmark-dark",
    mode: "dark",
    width: 132,
    height: 40,
  },
  {
    name: "Rooster mark for light backgrounds",
    file: "rooster-light",
    mode: "light",
    width: 140,
    height: 140,
  },
  {
    name: "Rooster mark for dark backgrounds",
    file: "rooster-dark",
    mode: "dark",
    width: 140,
    height: 140,
  },
];
const contrast = contrastPairs.map((pair) => {
  const ratio = contrastRatio(pair.foregroundValue, pair.backgroundValue);
  return {
    ...pair,
    ratio: ratio.toFixed(2),
    result:
      ratio >= 4.5
        ? "Regular and large text"
        : ratio >= 3
          ? "Large text only"
          : "Below AA text threshold",
  };
});
</script>

<template>
  <div class="reference-content flow">
    <section id="ds-quick-start" class="flow" aria-labelledby="ds-quick-start-title">
      <h2 id="ds-quick-start-title" class="ds-heading">Quick start</h2>
      <dl class="reference-list auto-grid">
        <div v-for="token in quickStart" :key="token.name">
          <dt>{{ token.label }}</dt>
          <dd>
            <code>{{ token.resolved }}</code
            ><span v-if="token.bounds"> · {{ token.bounds }}</span>
          </dd>
          <dd>
            <code>{{ token.name }}</code>
          </dd>
        </div>
      </dl>
      <nav class="reference-nav cluster" aria-label="Design system sections">
        <a href="#ds-rules">Rules for agents</a>
        <a href="#ds-tokens">Token reference</a>
        <a href="#ds-copy">Copy tokens</a>
        <a href="#ds-contrast">Contrast and states</a>
        <a href="#ds-type">Fonts and type</a>
        <a href="#ds-brand">Brand assets</a>
        <a href="#ds-components">Components</a>
        <a href="#ds-new-patterns">Table, form and print</a>
      </nav>
    </section>

    <section id="ds-rules" class="reference-group flow" aria-labelledby="ds-rules-title">
      <h2 id="ds-rules-title" class="ds-heading">Rules for agents</h2>
      <ul class="flow">
        <li>
          Use teal 500 for primary actions, links, selected controls and keyboard focus. Reserve
          amber for phone and support calls to action, small highlights and warnings. Use a single
          warm accent per screen, with success and danger reserved for status.
        </li>
        <li>
          Use weight 400 and tracking <code>{{ tokens["--tracking-heading"]?.resolved }}</code> for
          application headings, and <code>{{ tokens["--tracking-display"]?.resolved }}</code> for
          display type. Use 500 for compact headings and
          <code>{{ tokens["--tracking-eyebrow"]?.resolved }}</code> for uppercase labels. The
          protected hero, header and footer use the brand stack and their own type settings.
        </li>
        <li>
          Use the responsive panel radius for large containers, 28px for step and receipt cards,
          20px for course and session cards, 16px for nested media, 14px for fields and 999px for
          pills. Use 24px for the inner surfaces that specify <code>--radius-inner</code>. Choose
          inner corners that fit their container and visibly preserve its inset.
        </li>
        <li>
          Avoid extra accent hues, improvised radii and using decorative amber as small text. Convey
          status with copy or an icon as well as color. Keep focus visible and use the contrast
          table to choose text pairs.
        </li>
      </ul>
      <p class="reference-subtle">
        The single warm accent and nested-corner rules are guidance for new work. The component
        specimens show the existing application values.
      </p>
    </section>

    <section id="ds-tokens" class="flow" aria-labelledby="ds-tokens-title">
      <h2 id="ds-tokens-title" class="ds-heading">Token reference</h2>
      <p>
        Values are read from the application stylesheet. Pixel equivalents and clamp bounds assume a
        16px root. Declared aliases and mixes are shown alongside their resolved values.
      </p>
      <div v-for="group in tokenGroups" :key="group.label" class="reference-group flow">
        <h3>{{ group.label }}</h3>
        <div class="reference-table-scroll" role="region" :aria-label="group.label" tabindex="0">
          <table class="reference-table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Resolved value</th>
                <th scope="col">Used for</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in group.tokens" :key="token.name" :data-token="token.name">
                <th scope="row">
                  <code>{{ token.name }}</code>
                </th>
                <td>
                  <span
                    v-if="token.name.startsWith('--clr-')"
                    class="reference-swatch"
                    :style="{ background: `var(${token.name})` }"
                    aria-hidden="true"
                  />
                  <code data-resolved>{{ token.resolved }}</code>
                  <div v-if="token.bounds" class="reference-subtle">{{ token.bounds }}</div>
                  <div v-if="token.value !== token.resolved" class="reference-subtle">
                    CSS <code>{{ token.value }}</code>
                  </div>
                </td>
                <td>{{ token.use }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-for="(overrides, query) in media" :key="query" class="reference-group flow">
        <h3>Reduced motion</h3>
        <p>
          <code>{{ query }}</code>
        </p>
        <dl class="reference-list auto-grid">
          <div v-for="(value, name) in overrides" :key="name">
            <dt>
              <code>{{ name }}</code>
            </dt>
            <dd>
              <code>{{ value }}</code> · Removes shared motion timing.
            </dd>
          </div>
        </dl>
        <p class="reference-subtle">
          The shared reduced-motion CSS also sets transitions and animations to <code>0.01ms</code>,
          runs animations once, and disables smooth scrolling.
        </p>
      </div>
    </section>

    <section id="ds-copy" class="reference-copy flow" aria-labelledby="ds-copy-title">
      <h2 id="ds-copy-title" class="ds-heading">Copy tokens</h2>
      <p>
        The JSON <code>value</code> field is the CSS declaration. <code>resolved</code> expands
        aliases and token color mixes while preserving fluid expressions.
        <code>media</code> contains conditional overrides.
      </p>
      <div class="cluster">
        <a href="/design-tokens.css" download>Download CSS</a>
        <a href="/design-tokens.json" download>Download JSON</a>
        <a href="/design-foundation.css" download>Download shared component CSS</a>
      </div>
      <DesignSystemCode title="CSS" :code="tokenCss" open />
      <DesignSystemCode title="JSON" :code="tokenJson" open />
    </section>

    <section id="ds-contrast" class="flow" aria-labelledby="ds-contrast-title">
      <h2 id="ds-contrast-title" class="ds-heading">Contrast and interactive colors</h2>
      <p>
        Ratios use WCAG relative luminance in sRGB, with out-of-gamut channels clipped for the
        calculation. AA requires 4.5:1 for regular text and 3:1 for large text, at least 24px
        regular or approximately 18.67px bold. The table includes existing lower-contrast uses.
        Inactive controls and purely decorative content have separate treatment.
        <a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"
          >WCAG 2.2 contrast criteria</a
        >
      </p>
      <div
        class="reference-table-scroll"
        role="region"
        aria-label="Text and background contrast"
        tabindex="0"
      >
        <table class="reference-table reference-table--wide">
          <thead>
            <tr>
              <th scope="col">Use</th>
              <th scope="col">Text</th>
              <th scope="col">Background</th>
              <th scope="col">Ratio</th>
              <th scope="col">AA use</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pair in contrast" :key="pair.use">
              <th scope="row">{{ pair.use }}</th>
              <td>
                <code>{{ pair.foreground }}</code>
                <div class="reference-subtle">{{ pair.foregroundValue }}</div>
              </td>
              <td>
                <code>{{ pair.background }}</code>
                <div class="reference-subtle">{{ pair.backgroundValue }}</div>
              </td>
              <td class="reference-ratio">{{ pair.ratio }}:1</td>
              <td>{{ pair.result }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The outer button hover ring uses a 2px surface gap and a 6px spread, or 4px in the protected
        brand areas and on course cards. Keyboard focus uses a 3px outline with a 2px offset. Button
        outlines use the variant ring color, fields use a 3px teal 100 halo with a teal 500 border,
        and invalid fields retain the danger border.
      </p>
      <div
        class="reference-table-scroll"
        role="region"
        aria-label="Interactive color states"
        tabindex="0"
      >
        <table class="reference-table reference-table--wide">
          <thead>
            <tr>
              <th scope="col">Control</th>
              <th scope="col">Default</th>
              <th scope="col">Hover</th>
              <th scope="col">Pressed or selected</th>
              <th scope="col">Disabled</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="control in interactiveColors" :key="control.control">
              <th scope="row">{{ control.control }}</th>
              <td v-for="(state, i) in control.states" :key="i">
                <code>{{ state.value }}</code>
                <div v-if="state.source !== state.value" class="reference-subtle">
                  {{ state.source }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="ds-type" class="flow" aria-labelledby="ds-type-title">
      <h2 id="ds-type-title" class="ds-heading">Fonts and type</h2>
      <p>
        Geist and Geist Mono are self-hosted variable WOFF2 files from Vercel’s official Geist
        repository. Both load upright weights 100–900 with <code>font-display: swap</code>. Browser
        synthesis supplies italics where the UI requests them.
        <a href="https://github.com/vercel/geist-font">Vercel Geist</a> ·
        <a href="/fonts/LICENSE-Geist.txt">Font license</a>
      </p>
      <dl class="reference-list auto-grid">
        <div>
          <dt>Geist</dt>
          <dd>
            <code>{{ tokens["--ff-base"]?.resolved }}</code>
          </dd>
          <dd>Application headings, body, controls and layout.</dd>
        </div>
        <div>
          <dt>Geist Mono</dt>
          <dd>
            <code>{{ tokens["--ff-mono"]?.resolved }}</code>
          </dd>
          <dd>Eyebrows, date tags, step numerals, receipt IDs and code.</dd>
        </div>
        <div>
          <dt>Protected brand stack</dt>
          <dd>
            <code>{{ tokens["--ff-brand"]?.resolved }}</code>
          </dd>
          <dd>Homepage hero, site header and footer.</dd>
        </div>
      </dl>
      <p>
        Body defaults to <code>{{ tokens["--text-body"]?.resolved }}</code> at weight
        <code>{{ tokens["--fw-regular"]?.resolved }}</code
        >, leading <code>{{ tokens["--lh-body"]?.resolved }}</code> and normal tracking. Native
        headings use the same weight, <code>{{ tokens["--lh-heading"]?.resolved }}</code> leading
        and <code>{{ tokens["--tracking-heading"]?.resolved }}</code> tracking by default. Their
        sizes from h1 through h6 are display LG, heading 1, heading 2, heading 3, heading 4 and
        body. The Typography component has separate variants and overrides in its example.
      </p>
      <DesignSystemCode title="@font-face CSS" :code="fontCss" open />
    </section>

    <section id="ds-brand" class="flow" aria-labelledby="ds-brand-title">
      <h2 id="ds-brand-title" class="ds-heading">Logo and rooster mark</h2>
      <p>
        The wordmark SVG uses teal <code>{{ brandColors[0] }}</code> and amber
        <code>{{ brandColors[1] }}</code
        >. The light rooster export preserves its original <code>#4C4C4C</code> ink. In the site
        header the mark inherits primary teal. The new dark-background exports use white for the
        wordmark’s teal paths and for the mark, and preserve the wordmark’s amber at
        <code>{{ brandColors[1] }}</code
        >.
      </p>
      <div class="reference-brand-grid auto-grid">
        <article v-for="asset in assets" :key="asset.file" class="reference-brand-card">
          <div class="reference-brand-preview" :data-mode="asset.mode">
            <img
              :src="`/brand/${asset.file}.svg`"
              :width="asset.width"
              :height="asset.height"
              :alt="asset.name"
            />
          </div>
          <h3 class="ds-heading">{{ asset.name }}</h3>
          <div class="cluster">
            <a
              :href="`/brand/${asset.file}.svg`"
              :aria-label="`Download ${asset.name} SVG`"
              download
              >SVG</a
            >
            <a
              :href="`/brand/${asset.file}.png`"
              :aria-label="`Download ${asset.name} PNG`"
              download
              >PNG</a
            >
            <span class="reference-subtle">{{ asset.width * 4 }} × {{ asset.height * 4 }} PNG</span>
          </div>
        </article>
      </div>
      <p>
        The live header and footer wordmark is 2rem (32px) tall. For new placements, use a minimum
        32px wordmark height and a 32px square rooster mark. Leave at least 8px of clear space on
        every side of standalone artwork. These new-use measurements are guidance. The repository
        supplies no formal minimum size or clear-space specification.
      </p>
      <p>
        Keep the aspect ratio and path shapes intact. Use the background-appropriate artwork and
        avoid stretching, cropping, arbitrary recoloring, drop shadows or busy backgrounds.
      </p>
    </section>
  </div>
</template>

<style scoped src="../design-system/reference.css"></style>
