import rooster from "@/assets/icons/icon-rooster.svg?raw";
import controlsCss from "@/assets/css/blocks/controls.css?raw";
import surfacesCss from "@/assets/css/blocks/surfaces.css?raw";
import registrationSource from "@/pages/course/register.vue?raw";
import icons from "./icons.json";

const sources = import.meta.glob<string>(
  [
    "../components/App-{Icon,ArrowButton,IconButton,TextLink,TextField,StatusPill,FilterGroup,Accordion,StepCard,TrustBadge,SeatMeter,SummaryRow,DetailRow,NavDialog}.vue",
    "../components/{CourseCard,CourseGroup,Typography,ContactForm,SiteBrand,App-Trust,CareSteps,ApplyBand,section-header}.vue",
    "../components/course/{SessionTile,SessionSelector,SessionRow,RegistrationDetail}.vue",
    "../components/receipt/ReceiptHeader.vue",
  ],
  { query: "?raw", import: "default", eager: true },
);

function styles(path: string, source = sources[`../components/${path}.vue`]) {
  const style = source?.match(/<style\b[^>]*>([\s\S]*?)<\/style>/)?.[1];
  if (!style) throw new Error(`Missing design example styles for ${path}`);
  return style.trim().replace(/:deep\(([^)]+)\)/g, "$1");
}

// Lucide paths from the application's installed @iconify-json/lucide collection.
function icon(name: keyof typeof icons, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
}

function example(html: string, components: string[] = [], script = "", sharedCss = "") {
  const css = [sharedCss.trim(), ...components.map((path) => styles(path))]
    .filter(Boolean)
    .join("\n\n");
  return `<link rel="stylesheet" href="/design-foundation.css">\n${css ? `<style>\n${css}\n</style>\n` : ""}\n${html}${script ? `\n<script>\n${script}\n</script>` : ""}`;
}

const buttonVariants = ["primary", "accent", "secondary", "inverse", "ghost"] as const;
const buttonExamples = buttonVariants
  .map((variant) => {
    const label = variant[0]!.toUpperCase() + variant.slice(1);
    const attr = `class="button" type="button" data-variant="${variant}"`;
    return `<button ${attr}>${label}</button>
<button ${attr} disabled aria-disabled="true">Disabled ${label.toLowerCase()}</button>
<button ${attr} disabled aria-disabled="true" aria-busy="true" data-loading="true">
  <span class="button-spinner" aria-hidden="true">${icon("loader-circle")}</span>
  Working…
</button>`;
  })
  .join("\n\n");

function arrowButton(label: string, variant: "primary" | "inverse" = "primary", state = "") {
  return `<button class="button arrow-button" type="button" data-variant="${variant}" data-width="full"${state ? ` disabled aria-disabled="true"${state === "loading" ? ' aria-busy="true" data-loading="true"' : ""}` : ""}>
  ${state === "loading" ? `<span class="button-spinner" aria-hidden="true">${icon("loader-circle")}</span>\n  ` : ""}<span class="arrow-button__label">${label}</span>
  <span class="icon" aria-hidden="true"><span class="arrow-button__disc">${icon("arrow-right")}</span></span>
</button>`;
}

const contactForm = `<form class="contact-form" novalidate>
  <div class="contact-form__fields">
    <div class="form-field">
      <label class="form-field__label" for="contact-name">Name</label>
      <input class="form-field__input" id="contact-name" name="name" autocomplete="name" placeholder="Name">
    </div>
    <div class="form-field">
      <label class="form-field__label" for="contact-email">Email</label>
      <input class="form-field__input" id="contact-email" name="email" type="email" autocomplete="email" placeholder="name@example.com">
    </div>
    <div class="form-field">
      <label class="form-field__label" for="contact-message">Message</label>
      <textarea class="form-field__input text-field__textarea" id="contact-message" name="message" rows="6"
                maxlength="250" placeholder="How can we help?" aria-describedby="contact-message-hint"></textarea>
      <p class="text-field__hint" id="contact-message-hint">Maximum 250 characters.</p>
    </div>
  </div>
  <div class="contact-form__actions">
    <button class="button" data-variant="inverse" type="submit">Send message</button>
    <p class="contact-form__status" role="status" aria-live="polite"></p>
  </div>
</form>`;

function metadataRow(
  block: "course-group" | "registration-card",
  image: keyof typeof icons,
  label: string,
  value: string,
) {
  return `<div class="${block}__meta-row">
  <span class="${block}__meta-icon">${icon(image)}</span>
  <div class="${block}__meta-copy"><dt>${label}</dt><dd>${value}</dd></div>
</div>`;
}

function groupSession(
  state: "open" | "limited" | "full",
  date: string,
  day: number,
  amount: number,
) {
  const availability = amount ? `${amount} seats left` : "No seats left";
  const percent = (20 - amount) * 5;
  return `<li class="course-session-row" data-state="${state}">
  <div class="course-session-row__calendar" aria-hidden="true">
    <span class="course-session-row__month-day">Nov</span><span class="course-session-row__day-num">${day}</span>
  </div>
  <div class="course-session-row__body">
    <p class="course-session-row__date"><time datetime="2026-11-${day}">${date}</time></p>
    <div class="course-session-row__meter">
      <div class="course-session-row__track" role="meter" aria-label="Session capacity" aria-valuenow="${percent}"
           aria-valuemin="0" aria-valuemax="100" aria-valuetext="${amount} of 20 seats available">
        <span class="course-session-row__fill" style="inline-size: ${percent}%"></span>
      </div>
      <span class="course-session-row__seats-label">${availability}</span>
    </div>
  </div>
  <div class="course-session-row__action">
    ${amount ? '<a class="button" data-size="small" href="#register">Register</a>' : '<span class="course-session-row__full">FULL</span>'}
  </div>
</li>`;
}

const trustBadge = `<span class="trust-badge">
  <span class="trust-badge__disc">${icon("shield-check")}</span><span>State-licensed provider</span>
</span>`;

const steps = [
  ["Apply", "Start an application or contact us about waiver services."],
  ["Talk with us", "Share your loved one’s needs and the support you’re looking for."],
  ["Explore the next steps", "Discuss availability with our team."],
]
  .map(
    ([title, description], i) => `<li class="step-card flow">
  <p class="step-card__number" aria-hidden="true">${i + 1}</p>
  <h3 class="step-card__title">${title}</h3><p>${description}</p>
</li>`,
  )
  .join("\n");

const statusTones = [
  ["success", "badge-check", "Payment confirmed"],
  ["pending", "info", "Awaiting confirmation"],
  ["pending", "loader-circle", "Confirming payment"],
  ["warning", "circle-alert", "Registration needs attention"],
  ["neutral", "info", "Status unavailable"],
] as const;
const statusExamples = statusTones
  .map(
    ([tone, iconName, label]) =>
      `<span class="status-pill" data-tone="${tone}"${iconName === "loader-circle" ? " data-busy" : ""}>
  ${icon(iconName, "icon status-pill__icon")}
  <span>${label}</span>
</span>`,
  )
  .join("\n");

const fields = `<div class="form-field">
  <label for="example-name" class="form-field__label">Full name</label>
  <input id="example-name" name="name" class="form-field__input" autocomplete="name" placeholder="Jordan Ellis">
</div>
<div class="form-field">
  <label for="example-email" class="form-field__label">Email</label>
  <input id="example-email" name="email" type="email" class="form-field__input"
         value="jordan@" aria-invalid="true" aria-describedby="example-email-hint example-email-error">
  <p id="example-email-hint" class="text-field__hint">Your receipt goes here.</p>
  <p id="example-email-error" class="form-field__error">Enter a valid email address.</p>
</div>
<div class="form-field">
  <label for="example-reference" class="form-field__label">Reference</label>
  <input id="example-reference" class="form-field__input" value="HR-012" disabled>
</div>
<div class="form-field">
  <label for="example-message" class="form-field__label">Message</label>
  <textarea id="example-message" class="form-field__input text-field__textarea"></textarea>
</div>`;

function meter(state: "open" | "limited" | "full", showLabel = true, extraClass = "") {
  const [percent, available] = { open: [40, 12], limited: [85, 3], full: [100, 0] }[state];
  const label = available ? `${available} seats left` : "No seats left";
  return `<div class="seat-meter${extraClass}" data-state="${state}">
  <div class="seat-meter__track" role="meter" aria-label="Session capacity"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"
       aria-valuetext="${available} of 20 seats available; ${20 - available!} filled">
    <span class="seat-meter__fill" style="inline-size: ${percent}%"></span>
  </div>${showLabel ? `\n  <span class="seat-meter__label">${label}</span>` : ""}
</div>`;
}

function tile(
  selection: "solid" | "tint",
  group: string,
  seats: "open" | "limited" | "full",
  selected = false,
) {
  const state = seats === "full" ? "full" : selected ? "selected" : "available";
  const [day, month, availability] = {
    open: ["13", "Nov · Fri", "12 seats left"],
    limited: ["24", "Nov · Tue", "3 seats left"],
    full: ["5", "Dec · Sat", "Session full"],
  }[seats];
  return `<label class="session-tile" data-state="${state}" data-selected-variant="${selection}">
  <input class="visually-hidden" type="radio" name="${group}" value="${seats}"
         aria-label="${month} ${day}, ${availability}"${selected ? " checked" : ""}${seats === "full" ? " disabled" : ""}>
  <span class="session-tile__content" aria-hidden="true">
    <span class="session-tile__month">${month}</span>
    <span class="session-tile__day">${day}</span>
    ${meter(seats, false)}
    <span class="session-tile__availability">${seats === "full" ? '<span class="session-tile__full-pill">FULL</span>' : availability}</span>
  </span>
</label>`;
}

function selector(tone: "tint" | "solid") {
  return `<fieldset class="session-selector" aria-describedby="${tone}-session-hint">
  <div class="session-selector__header repel">
    <legend class="session-selector__legend">Upcoming sessions</legend>
    <p class="visually-hidden" id="${tone}-session-hint">Full sessions are unavailable.</p>
    <div class="session-selector__controls cluster" aria-label="Session scrolling controls">
      <button class="session-selector__nav-btn" type="button" aria-label="Previous sessions" disabled>${icon("arrow-left")}</button>
      <button class="session-selector__nav-btn" type="button" aria-label="Next sessions">${icon("arrow-right")}</button>
    </div>
  </div>
  <div class="session-selector__strip">
  ${tile(tone, tone + "-date", "open", true)}
  ${tile(tone, tone + "-date", "limited")}
  ${tile(tone, tone + "-date", "full")}
  </div>
</fieldset>`;
}

function courseCard(state: "open" | "limited" | "full") {
  return `<article class="course-card" data-state="${state}">
  <header class="course-card__header repel">
    <span class="tag">${icon("calendar")}<time datetime="2026-11-13">Fri, Nov 13</time></span>
    <p class="course-card__price"><span class="visually-hidden">Session cost: </span>$95</p>
  </header>
  <h3 class="course-card__title">Provider training</h3>
  <dl class="course-card__details cluster">
    <div class="course-card__detail">
      <dt class="visually-hidden">Time</dt>
      <dd class="course-card__detail-value">${icon("clock", "icon course-card__icon")} <span>8:30 AM – 2:30 PM</span></dd>
    </div>
    <div class="course-card__detail">
      <dt class="visually-hidden">Location</dt>
      <dd class="course-card__detail-value">${icon("map-pin", "icon course-card__icon")} <span>Training center</span></dd>
    </div>
  </dl>
  <footer class="course-card__footer cluster">
    ${
      state === "full"
        ? '<button class="button" type="button" data-size="small" disabled aria-disabled="true">Full</button>'
        : '<a class="button" data-size="small" href="#register">Register</a>'
    }
    <a class="course-card__details-link" href="#details">Details ${icon("arrow-right", "icon course-card__details-icon")}</a>
  </footer>
</article>`;
}

function filter(tone: "solid" | "tint") {
  return `<fieldset class="filter-group" data-tone="${tone}">
  <legend class="filter-group__label">${tone === "solid" ? "Course" : "Month"}</legend>
  <div class="filter-group__options">
    <button class="filter-group__chip" type="button" aria-pressed="true">All</button>
    <button class="filter-group__chip" type="button" aria-pressed="false">${tone === "solid" ? "Provider training" : "November"}</button>
  </div>
</fieldset>`;
}

export const examples = {
  typography: example(
    `<h1 class="type heading-2xl">Display XL <span>highlight</span></h1>
<h2 class="type heading-xl">Display L</h2>
<h2 class="type heading-large">Section heading</h2>
<h3 class="type heading-medium">Subsection heading</h3>
<h4 class="type heading-small">Compact heading</h4>
<p class="type body-large">Large body</p>
<p class="type body-medium">Standard body</p>
<p class="type body-small">Small body</p>
<p class="type body-small uppercase bold">Uppercase and bold modifiers</p>`,
    ["Typography"],
  ),
  buttons: example(
    `<!-- Hover and press the active buttons. Use Tab to see keyboard focus. -->
${buttonExamples}

<button class="button" type="button" data-size="small">Small</button>
<button class="button" type="button">Default</button>
<button class="button" type="button" data-size="large">Large</button>
<a class="button" data-width="full" href="#destination">Full-width navigation</a>
<a class="button" role="link" tabindex="-1" aria-disabled="true">Disabled navigation</a>
<button class="button" type="button" data-variant="ghost" data-state="copied">
  <span class="icon" aria-hidden="true">${icon("check")}</span> Copied
</button>`,
    ["App-Icon"],
    "",
    `@layer blocks {\n${controlsCss.trim()}\n}`,
  ),
  arrows: example(
    `${arrowButton("Register for Fri, Nov 13")}
<section class="panel" data-tone="primary">
  ${arrowButton("Apply now", "inverse")}
</section>
${arrowButton("No seats available", "primary", "disabled")}
${arrowButton("Checking…", "primary", "loading")}`,
    ["App-Icon", "App-ArrowButton"],
  ),
  links: example(
    `<a class="text-link" href="#learn">Learn more ${icon("arrow-right")}</a>
<a class="text-link" href="#details">Details without an icon</a>
<a class="text-link" href="#external">View details ${icon("arrow-up-right")}</a>
<button class="button icon-button" data-variant="ghost" type="button" aria-label="Previous">${icon("arrow-left")}</button>
<button class="button icon-button" data-variant="ghost" type="button" aria-label="Next" disabled aria-disabled="true">${icon("arrow-right")}</button>`,
    ["App-Icon", "App-TextLink", "App-IconButton"],
  ),
  tags: example(
    `<span class="tag">${icon("calendar-days")} <time datetime="2026-11-13">Fri, Nov 13</time></span>
<span class="tag" data-variant="seats">6 seats left</span>
<span class="tag" data-variant="full">FULL</span>

${statusExamples}`,
    ["App-Icon", "App-StatusPill"],
  ),
  fields: example(fields, ["App-TextField"]),
  details: example(
    `<dl>
  <div class="detail-row">
    <dt class="detail-row__label"><span class="detail-row__icon">${icon("map-pin")}</span> Location</dt>
    <dd class="detail-row__value">Training center</dd>
    <dd class="detail-row__link"><a class="text-link" href="#directions">Directions ${icon("arrow-right")}</a></dd>
  </div>
  <div class="summary-row">
    <dt class="summary-row__label">Registrant</dt><dd class="summary-row__value">Jordan Ellis</dd>
  </div>
  <div class="summary-row" data-mono>
    <dt class="summary-row__label">Order number</dt><dd class="summary-row__value">HR-012</dd>
  </div>
  ${["success", "pending", "warning"]
    .map(
      (tone) => `<div class="summary-row" data-status="${tone}">
    <dt class="summary-row__label">Status</dt><dd class="summary-row__value">${tone}</dd>
  </div>`,
    )
    .join("\n  ")}
</dl>
<div class="registration-detail">
  ${icon("calendar", "icon registration-detail__icon")}
  <div class="registration-detail__content flow">
    <p class="type heading-small registration-detail__label">Date</p>
    <p class="type body-medium">November 13</p>
  </div>
</div>`,
    [
      "App-Icon",
      "App-TextLink",
      "App-DetailRow",
      "App-SummaryRow",
      "Typography",
      "course/RegistrationDetail",
    ],
  ),
  selection: example(
    `${selector("solid")}
${selector("tint")}
<fieldset class="session-selector" disabled><legend class="session-selector__legend">Selection unavailable</legend></fieldset>
<fieldset class="session-selector">
  <legend class="session-selector__legend">Upcoming sessions</legend>
  <p class="u-text-muted">There are no sessions scheduled for this course yet.</p>
</fieldset>`,
    ["App-Icon", "App-SeatMeter", "course/SessionTile", "course/SessionSelector"],
    `for (const group of document.querySelectorAll(".session-selector")) {
  const strip = group.querySelector(".session-selector__strip");
  if (!strip) continue;
  const [back, next] = group.querySelectorAll(".session-selector__nav-btn");
  const update = () => {
    back.disabled = group.disabled || strip.scrollLeft <= 1;
    next.disabled = group.disabled || strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1;
  };
  const scroll = (direction) => strip.scrollBy({
    left: direction * Math.max(180, strip.clientWidth * 0.6),
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
  back.addEventListener("click", () => scroll(-1));
  next.addEventListener("click", () => scroll(1));
  strip.addEventListener("scroll", update, { passive: true });
  new ResizeObserver(update).observe(strip);
  group.addEventListener("focusin", (event) => {
    event.target.closest(".session-tile")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
  group.addEventListener("change", () => {
    for (const radio of strip.querySelectorAll("input[type=radio]")) {
      const tile = radio.closest(".session-tile");
      if (tile.dataset.state !== "full") tile.dataset.state = radio.checked ? "selected" : "available";
    }
  });
  update();
}`,
  ),
  rows: example(
    `<div class="session-row" data-state="open">
  <time class="session-row__date" datetime="2026-11-13">Nov 13</time>
  ${meter("open", true, " session-row__meter")}
  <a class="button" href="#register" data-size="small">Register</a>
</div>
<div class="session-row" data-state="full">
  <time class="session-row__date" datetime="2026-12-05">Dec 5</time>
  ${meter("full", true, " session-row__meter")}
  <span class="tag" data-variant="full">FULL</span>
</div>
${meter("limited")}`,
    ["App-SeatMeter", "course/SessionRow"],
  ),
  cards: example(`${courseCard("open")}\n${courseCard("limited")}\n${courseCard("full")}`, [
    "App-Icon",
    "CourseCard",
  ]),
  steps: example(
    `<ol role="list">
  <li class="step-card flow">
    <p class="step-card__number" aria-hidden="true">1</p>
    <h3 class="step-card__title">Apply</h3><p>Send us your details.</p>
  </li>
</ol>
<span class="trust-badge">
  <span class="trust-badge__disc">${icon("shield-check")}</span><span>State-licensed provider</span>
</span>`,
    ["App-Icon", "App-StepCard", "App-TrustBadge"],
  ),
  accordion: example(
    `<details class="accordion" name="example-faq" open>
  <summary class="accordion__summary">
    <h3 class="accordion__question">How much does care cost?</h3>
    <span class="accordion__toggle">${icon("plus")}</span>
  </summary>
  <div class="accordion__answer flow"><p>Get in touch for a personalized quote.</p></div>
</details>
<details class="accordion" name="example-faq">
  <summary class="accordion__summary">
    <h3 class="accordion__question">Who can benefit?</h3>
    <span class="accordion__toggle">${icon("plus")}</span>
  </summary>
  <div class="accordion__answer flow"><p>Talk with us about the care you need.</p></div>
</details>`,
    ["App-Icon", "App-Accordion"],
  ),
  receipt: example(
    `<header class="receipt-header">
  <div class="receipt-header__rule" aria-hidden="true"></div>
  <div class="receipt-header__content flow">
    <div class="receipt-header__meta repel">
      <span class="status-pill" data-tone="success">${icon("badge-check", "icon status-pill__icon")} <span>Payment confirmed</span></span>
      <p class="receipt-header__id">Receipt HR-012</p>
    </div>
    <h1 class="receipt-header__title">You’re registered</h1>
    <p class="receipt-header__message">Your registration is confirmed.</p>
  </div>
</header>`,
    ["App-Icon", "App-StatusPill", "receipt/ReceiptHeader"],
  ),
  dialog: example(
    `<button class="button" id="menu-trigger" type="button">Open navigation</button>
<dialog class="nav-dialog" id="example-menu" aria-label="Navigation">
  <div class="nav-dialog-body flow">
    <div class="nav-dialog-close">
      <form method="dialog">
        <button class="button icon-button" data-variant="ghost" aria-label="Close menu">${icon("x")}</button>
      </form>
    </div>
    <nav aria-label="Main menu"><a class="text-link" href="#services">Our Services</a></nav>
  </div>
</dialog>`,
    ["App-Icon", "App-IconButton", "App-TextLink", "App-NavDialog"],
    `const trigger = document.querySelector("#menu-trigger");
const dialog = document.querySelector("#example-menu");
trigger.addEventListener("click", () => dialog.showModal());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});`,
  ),
  filters: example(
    `${filter("solid")}\n${filter("tint")}`,
    ["App-FilterGroup"],
    `for (const group of document.querySelectorAll(".filter-group")) {
  const filters = group.querySelectorAll(".filter-group__chip");
  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
  }));
}`,
  ),
  panel: example(
    `<section class="panel">
  <header class="section-header flow">
    <h2>Default panel</h2><p>A white surface for the section.</p>
  </header>
</section>
<section class="panel u-surface-muted"><h2>Muted panel</h2></section>
<section class="panel" data-tone="primary">
  <h2>Primary panel</h2><p>Use white ink and inverse actions on teal.</p>
  <button class="button" data-variant="inverse" type="button">Apply now</button>
</section>`,
    ["section-header"],
    "",
    `@layer blocks {\n${surfacesCss.trim()}\n}`,
  ),
  wordmark: example(
    `<a class="site-brand" href="/" aria-label="Harmony Roosters home">
  <img class="site-brand__wordmark" src="/brand/wordmark-light.svg" width="132" height="40" alt="">
</a>`,
    ["SiteBrand"],
  ),
  contact: example(
    `<section class="panel" data-tone="primary">
  ${contactForm}
</section>`,
    ["App-TextField", "ContactForm"],
  ),
  registration: example(
    `<aside class="registration-card panel flow" aria-label="Session summary">
  <div class="registration-card__top repel">
    <p class="registration-card__price">
      <span class="registration-card__amount">$95</span><span class="registration-card__unit">per person</span>
    </p>
    <span class="tag" data-variant="seats">3 seats left</span>
  </div>
  <dl class="registration-card__meta">
    ${metadataRow("registration-card", "calendar", "Date", "Friday, November 13")}
    ${metadataRow("registration-card", "clock", "Time", "8:30 AM – 2:30 PM")}
    ${metadataRow("registration-card", "map-pin", "Location", "Training center")}
  </dl>
  ${arrowButton("Register for Fri, Nov 13")}
  <div class="registration-card__footer flow">
    <p class="registration-card__hint">Secure payment by Stripe. You'll get a receipt by email.</p>
  </div>
</aside>
<aside class="registration-card panel flow" aria-labelledby="example-registration-title">
  <form class="registration-card__form flow" novalidate>
    <div class="registration-card__heading repel">
      <h2 id="example-registration-title" class="registration-card__form-title">Contact information</h2>
      <p class="registration-card__step">Step 2 of 3</p>
    </div>
    <div class="registration-card__session-banner repel">
      <div class="registration-card__session-banner-copy">
        <p class="registration-card__session-primary">Fri, Nov 13 · 8:30 AM – 2:30 PM</p>
        <p class="registration-card__session-secondary">Training center · $95</p>
      </div>
      <button type="button" class="registration-card__change-btn">Change</button>
    </div>
    <div class="registration-card__names auto-grid">
      <div class="form-field">
        <label class="form-field__label" for="reg-first">First name</label>
        <input class="form-field__input" id="reg-first" name="first_name" autocomplete="given-name">
      </div>
      <div class="form-field">
        <label class="form-field__label" for="reg-last">Last name</label>
        <input class="form-field__input" id="reg-last" name="last_name" autocomplete="family-name">
      </div>
    </div>
    <div class="form-field">
      <label class="form-field__label" for="reg-email">Email</label>
      <input class="form-field__input" id="reg-email" type="email" name="email" autocomplete="email"
             aria-invalid="true" aria-describedby="reg-email-error">
      <p class="form-field__error" id="reg-email-error">Enter your email.</p>
    </div>
    <div class="form-field">
      <label class="form-field__label" for="reg-phone">Contact number</label>
      <input class="form-field__input" id="reg-phone" name="phonenumber" type="tel" autocomplete="tel">
    </div>
    <p class="registration-card__notice" role="alert">We couldn’t open checkout. Try again.</p>
    ${arrowButton("Opening payment…", "primary", "loading")}
    <p class="registration-card__hint">Next, you'll pay securely with Stripe.</p>
  </form>
</aside>`,
    ["App-Icon", "App-TextField", "App-ArrowButton"],
    "",
    styles("course/register", registrationSource),
  ),
  courseGroup: example(
    `<article class="course-group" aria-labelledby="example-course-title">
  <div class="course-group__info panel flow">
    <div class="course-group__top repel">
      <p class="course-group__price"><span class="course-group__amount">$95</span><span class="course-group__unit">per person</span></p>
      <span class="course-group__badge">Provider training</span>
    </div>
    <h2 id="example-course-title" class="course-group__title">Medication administration</h2>
    <p class="course-group__description">In-person training for direct-care professionals.</p>
    <dl class="course-group__meta">
      ${metadataRow("course-group", "clock", "Time", "8:30 AM – 2:30 PM")}
      ${metadataRow("course-group", "map-pin", "Location", "Training center")}
      ${metadataRow("course-group", "users", "Class size", "20 participants")}
    </dl>
    <a class="course-group__details-link" href="#details">Course details ${icon("arrow-right", "icon course-group__details-icon")}</a>
  </div>
  <div class="course-group__sessions-panel panel flow">
    <div class="course-group__sessions-header repel">
      <h3 class="course-group__sessions-title">Upcoming sessions</h3>
      <p class="course-group__sessions-count">3 dates</p>
    </div>
    <ul class="course-group__sessions u-list-reset" role="list">
      ${groupSession("open", "Fri, Nov 13", 13, 12)}
      ${groupSession("limited", "Tue, Nov 24", 24, 3)}
      ${groupSession("full", "Thu, Nov 26", 26, 0)}
    </ul>
    <p class="course-group__stripe-note">Secure payment by Stripe. You'll get a receipt by email.</p>
  </div>
</article>`,
    ["App-Icon", "CourseGroup"],
  ),
  trust: example(
    `<ul class="trust auto-grid" role="list" aria-label="Credentials">
  ${(
    [
      ["check", "APD iBudget Waiver provider"],
      ["shield-check", "State-licensed provider"],
      ["users", "Family-owned in Tampa Bay"],
      ["shield", "Fully insured"],
    ] as const
  )
    .map(
      ([name, title]) => `<li class="trust-item cluster">
    <span class="trust-icon">${icon(name)}</span><span class="trust-text">${title}</span>
  </li>`,
    )
    .join("\n  ")}
</ul>`,
    ["App-Icon", "App-Trust"],
  ),
  careSteps: example(
    `<section class="care-steps panel wrapper" aria-labelledby="example-steps-heading">
  <header class="section-header flow">
    <h2 id="example-steps-heading">Getting started</h2><p>Tell us about the support you’re looking for.</p>
  </header>
  <ol class="care-steps__list auto-grid u-list-reset" role="list" aria-label="Steps to explore care">
    ${steps}
  </ol>
  <div class="repel">${trustBadge}<a class="text-link" href="#contact">Talk with our team ${icon("arrow-right")}</a></div>
</section>`,
    ["App-Icon", "App-StepCard", "App-TrustBadge", "App-TextLink", "section-header", "CareSteps"],
  ),
  applyBand: example(
    `<section class="panel apply-band wrapper split" data-tone="primary" aria-labelledby="example-apply-heading">
  ${rooster.trim().replace("<svg ", '<svg class="apply-band__flourish" aria-hidden="true" ').replaceAll('fill="#4C4C4C"', 'fill="currentColor"')}
  <div class="apply-band__content flow">
    <h2 id="example-apply-heading">Ready to get <span>started?</span></h2>
    <p>Let’s talk about the care and support your loved one needs.</p>
    <div class="cluster">
      <a class="button" data-variant="accent" href="tel:+18134340447">
        <span class="icon">${icon("phone")}</span>813-434-0447
      </a>
    </div>
  </div>
  <div class="apply-band__form">${contactForm}</div>
</section>`,
    ["App-Icon", "App-TextField", "ContactForm", "ApplyBand"],
  ),
};
