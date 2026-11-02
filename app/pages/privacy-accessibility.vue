<script setup lang="ts">
useSeoMeta({
  title: "Privacy & Accessibility",
  description:
    "How Harmony Roosters handles website information and how to contact us for accessibility support.",
});
</script>

<template>
  <main class="wrapper measure region flow">
    <header class="flow">
      <AppTextLink href="/" icon="lucide:arrow-left">Home</AppTextLink>
      <Typography tag="h1" variant="heading-large" class="color-primary">
        Privacy &amp; Accessibility
      </Typography>
      <p class="u-text-muted">Last updated: <time datetime="2026-11-02">November 2, 2026</time></p>
      <p>
        This page explains how Harmony Roosters, LLC handles information on this website and how to
        get help accessing our content and services.
      </p>
      <nav class="cluster" aria-label="On this page">
        <AppTextLink href="#privacy" icon="">Privacy</AppTextLink>
        <AppTextLink href="#accessibility" icon="">Accessibility</AppTextLink>
      </nav>
    </header>

    <section id="privacy" class="region flow" aria-labelledby="privacy-heading">
      <Typography id="privacy-heading" tag="h2" variant="heading-medium" class="color-primary">
        Privacy
      </Typography>

      <section class="flow" aria-labelledby="information-heading">
        <Typography id="information-heading" tag="h3" variant="heading-small">
          Information we collect and use
        </Typography>
        <p>
          When you contact us or register for a course, we collect the information you provide, such
          as your name, email address, phone number, message, and registration details. We use it to
          respond to inquiries, manage registrations and payments, and send related communications.
          Please do not include sensitive medical information in the website contact form.
        </p>
      </section>

      <section class="flow" aria-labelledby="providers-heading">
        <Typography id="providers-heading" tag="h3" variant="heading-small">
          Payments and service providers
        </Typography>
        <p>
          We use service providers to operate this website, including Stripe for payments, Airtable
          for registration records, and Resend for email delivery. These providers process
          information needed to provide their services. Payment card details are entered through
          Stripe Checkout. We may also disclose information when required by law.
        </p>
      </section>

      <section class="flow" aria-labelledby="analytics-heading">
        <Typography id="analytics-heading" tag="h3" variant="heading-small">
          Cookies and website usage
        </Typography>
        <p>
          We use PostHog and Vercel analytics and performance tools to understand website use and
          troubleshoot problems. These tools may collect technical and usage information, such as
          pages visited, interactions, browser and device information, and errors. Cookies or
          similar browser storage may be used. You can manage cookies through your browser settings;
          blocking storage may affect some website features.
        </p>
      </section>

      <section class="flow" aria-labelledby="choices-heading">
        <Typography id="choices-heading" tag="h3" variant="heading-small">
          Your information and choices
        </Typography>
        <p>
          To ask about your information or request access, correction, or deletion, contact us using
          the details below. We may need to verify your identity and retain certain records for
          legal, payment, or administrative purposes. No method of online transmission or storage is
          completely secure. Updates to this notice will appear here with a revised date.
        </p>
      </section>
    </section>

    <section id="accessibility" class="flow" aria-labelledby="accessibility-heading">
      <Typography
        id="accessibility-heading"
        tag="h2"
        variant="heading-medium"
        class="color-primary"
      >
        Accessibility
      </Typography>
      <p>
        Harmony Roosters aims to make this website usable by everyone, including people with
        disabilities. We seek to improve accessibility, but some content or third-party services may
        have limitations.
      </p>
      <p>
        If you have difficulty using this website or need information in another format, please
        contact us. Tell us which page or feature caused the issue and what assistance you need. You
        can also contact us for help with course registration or questions about our services.
      </p>
    </section>

    <section class="region flow" aria-labelledby="contact-heading">
      <Typography id="contact-heading" tag="h2" variant="heading-medium" class="color-primary">
        Contact us
      </Typography>
      <p>Harmony Roosters, LLC · Riverview/Brandon, Florida</p>
      <ul class="u-list-reset flow" role="list">
        <li><a href="tel:+18134340447">813-434-0447</a></li>
        <li><a href="mailto:harmonyroosters@gmail.com">harmonyroosters@gmail.com</a></li>
      </ul>
    </section>
  </main>
</template>
