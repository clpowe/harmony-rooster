<script setup lang="ts">
const serviceLinks = [
  { label: "Personal Support", to: "/#our-services" },
  { label: "Respite", to: "/#our-services" },
  { label: "Nursing", to: "/#our-services" },
  { label: "Foster Home", to: "/#our-services" },
];

const companyLinks = [
  { label: "About", to: "/#about-us" },
  { label: "Courses", to: "/#courses" },
  { label: "FAQ", to: "/#faq" },
];

const legalLinks = [
  { label: "Privacy", to: "/#privacy" },
  { label: "Accessibility", to: "/#accessibility" },
];
</script>

<template>
  <footer class="page-footer">
    <div class="wrapper">
      <div class="page-footer-grid auto-grid">
        <div class="page-footer-brand flow">
          <NuxtLink to="/" class="logo" aria-label="Harmony Roosters home">
            <SvgoIconWordmark
              class="logo-wordmark"
              filled
              :fontControlled="false"
              aria-hidden="true"
            />
          </NuxtLink>
          <p>
            A locally owned and operated care provider serving Riverview, Brandon and the Tampa Bay
            area.
          </p>
        </div>

        <nav class="page-footer-col flow" aria-labelledby="footer-services-heading">
          <h2 id="footer-services-heading">Services</h2>
          <ul class="page-footer-list flow" role="list">
            <li v-for="link in serviceLinks" :key="link.label">
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <nav class="page-footer-col flow" aria-labelledby="footer-company-heading">
          <h2 id="footer-company-heading">Company</h2>
          <ul class="page-footer-list flow" role="list">
            <li v-for="link in companyLinks" :key="link.label">
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="page-footer-col flow">
          <h2>Contact</h2>
          <address class="page-footer-address">
            <ul class="page-footer-list flow" role="list">
              <li><a href="tel:+18134340447">813-434-0447</a></li>
              <li><NuxtLink to="/#contact">Apply for care</NuxtLink></li>
              <li>Riverview/Brandon, FL</li>
            </ul>
          </address>
        </div>
      </div>

      <div class="page-footer-legal repel">
        <p>© {{ new Date().getFullYear() }} Harmony Roosters, LLC</p>
        <ul class="cluster" role="list">
          <li v-for="link in legalLinks" :key="link.label">
            <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@layer blocks {
  /* Block · page-footer */
  .page-footer {
    padding-block: var(--space-800) var(--space-600);
    font-size: var(--text-caption);

    & a {
      color: var(--clr-text-muted);
      text-decoration: none;
    }

    & a:hover {
      color: var(--clr-primary-500);
      text-decoration: underline;
    }

    & h2 {
      font-size: var(--text-caption);
      font-weight: var(--fw-bold);
      color: var(--clr-text);
    }
  }

  .page-footer-grid {
    --auto-grid-min: 12rem;
    --auto-grid-gap: var(--space-600);
    align-items: start;
  }

  .page-footer-brand {
    --flow-space: var(--space-300);

    & p {
      max-inline-size: 30ch;
    }
  }

  .logo {
    display: inline-flex;
    align-items: center;

    & .logo-wordmark {
      inline-size: auto;
      block-size: 2rem;
    }
  }

  .page-footer-col {
    --flow-space: var(--space-300);
  }

  .page-footer-list {
    --flow-space: var(--space-200);
  }

  .page-footer-address {
    font-style: normal;
  }

  .page-footer-legal {
    margin-block-start: var(--space-600);
    padding-block-start: var(--space-400);
    border-block-start: var(--border-width) solid var(--clr-border);
    font-size: var(--text-meta);
    color: var(--clr-text-subtle);
  }
}
</style>
