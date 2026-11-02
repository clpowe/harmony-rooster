<template>
  <AppPanel
    id="contact"
    tone="primary"
    class="apply-band wrapper split"
    aria-labelledby="apply-band-heading"
  >
    <SvgoIconRooster class="apply-band__flourish" :fontControlled="false" aria-hidden="true" />
    <div class="apply-band__content flow">
      <h2 id="apply-band-heading">Ready to get <span>started?</span></h2>
      <p>Let’s talk about the care and support your loved one needs.</p>
      <div class="cluster">
        <AppButton href="tel:+18134340447" variant="accent"
          ><template #icon-start><AppIcon name="lucide:phone" /></template>813-434-0447</AppButton
        >
      </div>
    </div>
    <div class="apply-band__form">
      <ContactForm />
    </div>
  </AppPanel>
</template>

<style scoped>
@layer blocks {
  .apply-band {
    --split-gap: var(--space-layout);
    padding-block: var(--space-section);
    isolation: isolate;
  }
  .apply-band__content {
    --flow-space: var(--space-500);
    position: relative;
    max-inline-size: var(--measure-readable);
  }
  .apply-band__content h2 {
    font-size: var(--text-display-lg);
    line-height: var(--lh-display);
    letter-spacing: var(--tracking-display);
  }
  .apply-band__content h2 span {
    color: var(--clr-accent-300);
  }
  .apply-band__content p {
    font-size: var(--text-body-lg);
  }
  .apply-band__form {
    position: relative;
    display: grid;
    min-inline-size: 0;
  }
  .apply-band__flourish {
    position: absolute;
    z-index: -1;
    inset-block-end: -10%;
    inset-inline-end: -2%;
    inline-size: min(50%, 28rem);
    block-size: auto;
    color: var(--clr-primary-300);
    fill: currentColor;
    opacity: 0.2;
    pointer-events: none;
  }
}
</style>
