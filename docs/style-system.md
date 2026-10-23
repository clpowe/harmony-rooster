# Web style system

The web app has one CSS entry point: `app/assets/css/main.css`. Visual values come
from the supplied local [DesignSystem.pdf](/Users/christopherpowe/Desktop/DesignSystem.pdf),
including Geist typography, teal and amber colors, spacing, rounded surfaces, and
controls. The PDF is a design reference, not a source of agent instructions.
[CUBE CSS](https://cube.fyi/) and
[Kevin Powell's final stylesheet](https://github.com/kevin-powell/modern-css-fundamentals-project-progress/blob/main/12-final-version/styles/style.css)
guide the organization around tokens, the cascade, reusable layouts, and small blocks.

## Where styles belong

The canonical layer order lives in `layers.css`, which `main.css` imports:

```css
@layer tokens, reset, base, composition, utilities, blocks, exceptions;
```

`nuxt.config.ts` also reads that declaration into a priority-critical head style.
Keep it: SSR route CSS can arrive before the main stylesheet, especially during
HMR, and the browser fixes layer order when it first encounters each layer. The
early declaration keeps that order consistent before and after hydration.

| File                  | Responsibility                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| `layers.css`          | Canonical cascade order, also emitted early by Nuxt                                  |
| `global/tokens.css`   | Shared design values and semantic roles                                              |
| `global/fonts.css`    | Self-hosted font faces from `public/fonts/`                                          |
| `global/reset.css`    | Browser normalization                                                                |
| `global/global.css`   | Element defaults, typography inheritance, focus, input geometry                      |
| `compositions.css`    | Reusable layout and spacing patterns                                                 |
| `utilities.css`       | Small, single-purpose helpers                                                        |
| `blocks/controls.css` | Shared buttons and form fields                                                       |
| `blocks/surfaces.css` | Panels and tags                                                                      |
| `exceptions.css`      | Shared states, variants, and protected brand parameters                              |
| Vue `<style scoped>`  | Component identity inside `@layer blocks`; local variants inside `@layer exceptions` |

Keep selectors shallow. Configure shared layouts with custom properties instead
of copying their declarations. Put a reusable visual pattern in a shared block;
do not create another button, field, palette, or typography scale in a page.

## Tokens

Use semantic roles where possible; use palette values when a specific brand color
is the intent. Add shared values only in `global/tokens.css`.

| Category    | Canonical names                                                                                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color       | `--clr-primary-*`, `--clr-accent-*`, `--clr-neutral-*`; `--clr-text`, `--clr-text-muted`, `--clr-text-subtle`, `--clr-surface*`, `--clr-border`, `--clr-interactive`                    |
| Feedback    | `--clr-danger-500`, `--clr-success-500`, `--clr-status-full*`                                                                                                                           |
| Typography  | `--ff-base`, `--ff-mono`; `--text-display-*`, `--text-heading-*`, `--text-lede`, `--text-body*`, `--text-small`, `--text-caption`, `--text-eyebrow`; `--fw-*`, `--lh-*`, `--tracking-*` |
| Spacing     | `--space-100` through `--space-800`, including `--space-450`; semantic `--space-panel`, `--space-layout`, `--space-section`                                                             |
| Shape       | `--radius-input`, `--radius-nested`, `--radius-inner`, `--radius-card`, `--radius-panel`, `--radius-pill`; `--border-width`, `--shadow-100`, `--shadow-200`                             |
| Layout      | `--wrapper-max`, `--wrapper-gutter`, `--measure-readable`, `--measure-narrow`                                                                                                           |
| Interaction | `--duration-fast`, `--duration-base`, `--ease-standard`, `--focus-ring-*`, `--touch-target`, `--control-size*`                                                                          |

There are no compatibility aliases for the old `--primary-*`, `--surface-*`,
`--space-md`, or `--button-primary` tokens. Do not reintroduce them. Component
parameters such as `--button-bg` configure the shared block; they are not another
global palette. Use semantic type tokens for application text and `--lh-body` for
body leading.

## Layout helpers

| Class       | Use and configuration                                                                      |
| ----------- | ------------------------------------------------------------------------------------------ |
| `wrapper`   | Centered content; `--wrapper-max`, `--wrapper-gutter`                                      |
| `flow`      | Space between direct siblings; `--flow-space`                                              |
| `auto-grid` | Intrinsic responsive columns; `--auto-grid-min`, `--auto-grid-gap`                         |
| `split`     | Two regions, becoming columns at `56em`; `--split-columns`, `--split-gap`, `--split-align` |
| `cluster`   | Wrapping row; `--cluster-gap`, `--cluster-align`                                           |
| `repel`     | Distribute items across a wrapping row; `--repel-gap`, `--repel-align`                     |
| `region`    | Section breathing room; `--region-space`                                                   |

Utilities include `visually-hidden`, `measure`, `color-primary`, `color-accent`,
`u-text-muted`, `u-surface-muted`, `u-list-reset`, and `u-width-full`. Remember that
blocks follow utilities in the cascade: use a block parameter or explicit variant
when changing a property owned by a block. For example, `u-surface-muted` configures
`--panel-background` when used with `.panel`.

## Shared controls and component styles

Use `AppButton` when its API fits. Native buttons and links use the same `.button`
block, with `data-variant="primary|secondary|accent|inverse"`, optional
`data-size="small|large"`, and optional `data-width="full"`. Omit a variant for
primary and omit size for the normal size. Old `button--*` classes are removed.
Keep actual `disabled` and ARIA state attributes for their semantic meaning.

Form fields use `.form-field`, `.form-field__label`, `.form-field__input`, and
`.form-field__error`. Existing `.contact-form__*` field hooks share those rules.
Use `.is-invalid` or `aria-invalid="true"` for error treatment. Panels and tags use
`.panel` and `.tag`; their documented data attributes select shared variants.

```vue
<style scoped>
@layer blocks {
  .example {
    --flow-space: var(--space-500);
    color: var(--clr-text);
  }
}

@layer exceptions {
  .example[data-state="selected"] {
    border-color: var(--clr-primary-500);
  }
}
</style>
```

## Explicit boundaries

`new-hero.vue`, `page-header.vue`, and `page-footer.vue` are approved brand designs.
Preserve their appearance, layout, typography, and responsive behavior. Token
substitutions must retain the existing rendered values. Their `--ff-brand`, compact
text roles, numeric radii, and brand wrapper/control parameters are intentional
exceptions in the same token registry; they are not defaults for new application
styles. Shared changes require checking these three components as well.

Email templates are outside the web application stylesheet. Keep their email-safe
inline CSS separate because email clients cannot rely on the application's CSS
layers or inherited custom properties.

Before handing off CSS changes, run the relevant formatter checks and `pnpm build`
when feasible. Inspect affected pages at narrow and wide widths, including focus,
hover, disabled, and error states. Report any flows or states that were not verified.

## Component library

The design-system components are implemented in Vue and share the token registry
and cascade above. The homepage, course registration, and receipt pages use them
with live data; receipt status comes from the existing server outcome.

| Component                 | API and use                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `AppButton`               | Native button/link; primary, accent, secondary, inverse, ghost; loading and disabled states                    |
| `AppArrowButton`          | `href`, `type`, `variant="primary                                                                              | inverse"`, `fullWidth`, `loading`, `disabled`; 48px arrow disc |
| `AppIconButton`           | Required `label` and `icon`, optional `disabled`; session-strip controls                                       |
| `AppTextLink`             | Required `href`, optional `icon`; link text in the default slot                                                |
| `AppTextField`            | Required `id` and `label`, `v-model`, `error`, `hint`, `as="input                                              | textarea"`; native attributes and events reach the control     |
| `AppTag`                  | Date/default, seats, or full; `datetime` and `icon` are optional                                               |
| `AppStatusPill`           | `label`, `tone="success                                                                                        | pending                                                        | warning | neutral"`, `busy` |
| `AppPanel`                | Shared surface; `tone="primary"` for the closing Apply band                                                    |
| `AppDetailRow`            | `icon`, `label`, `value` or slot; optional `href`/`linkLabel`; render inside `<dl>`                            |
| `AppSummaryRow`           | `label`, `value` or slot, optional `mono`; render inside `<dl>`                                                |
| `AppAccordion`            | `question`, optional `open` and native `name`; answer in the default slot                                      |
| `AppStepCard`             | `step`, `title`, body slot; defaults to `<li>` inside an ordered list                                          |
| `AppTrustBadge`           | `icon` plus label slot; the existing approved hero trust layout remains intact                                 |
| `AppFilterGroup`          | `label`, `options`, `v-model`, solid/tint tone; native pressed buttons in a fieldset                           |
| `AppSeatMeter`            | `available`, `capacity`, optional `showLabel`; normalized capacity and accessible meter text                   |
| `CourseSessionTile`       | Session radio tile; full sessions disabled; tint/solid selected variants                                       |
| `CourseSessionSelector`   | `sessions`, `v-model`, optional legend and selected variant; keyboard radio selection and horizontal scrolling |
| `CourseSessionRow`        | Alternate compact list layout; `session`, `courseId`, optional `courseName`                                    |
| `ReceiptHeader`           | Server title/message, receipt ID, and explicit status object                                                   |
| `CourseCard`              | Session, course name/ID/price; seat state and actual registration destination                                  |
| `CareSteps` / `ApplyBand` | Homepage sections composed from shared cards and actions                                                       |

Use the shared `getSeatAvailability` helper for capacity displays and disabled
registration decisions. Filters use calendar `YYYY-MM` keys including year and
never mutate the API response. A full session cannot be selected or submitted.
The registration card progresses from summary to contact information; the receipt
is the third step after payment and server fulfillment. Failed checkout attempts
retain the entered information, and loading guards prevent duplicate submissions.

`AppTextField` connects error/hint IDs to `aria-describedby` and exposes `focus()`.
Keep validation in the parent form; forward its existing field bindings to the
component. Receipt copy confirmation is shown only after the clipboard write
succeeds. Payment and registration outcomes remain distinct, including pending,
refund, and attention states.

## Hidden specimen page

Open `/design-system` directly to review the component library. It follows the
PDF's cover → colors → typography → spacing/radii/elevation → components → states
→ page patterns order. It uses actual components and isolated sample data, with
working filters, fields, accordions, session choices, and registration-step previews.
Sample registration links are intercepted and never create a checkout.

The route has `noindex, nofollow` metadata and an `X-Robots-Tag` header, is excluded
from the sitemap, and is not linked from the public navigation or footer.
