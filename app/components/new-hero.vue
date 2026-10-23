<template>
  <section class="new-hero wrapper">
    <NuxtImg class="image" src="caregiver-and-senior-woman-laughing-together.jpg" />
    <div class="overlay"></div>
    <div class="content">
      <Rooster
        src="../assets/images/Rooster.svg"
        alt=""
        aria-hidden="true"
        :fontControlled="false"
        class="hero__art"
      />
      <h2 class="">Home care & residential habilitation</h2>
      <p>Care you can <span>trust</span></p>
    </div>

    <div class="section-2">
      <div class="actions">
        <div class="link apply">
          <h3>Apply for Care</h3>
          <p>Nursing and Foster Home For Individuals with developmental disabilities.</p>
          <AppButton href="#courses" variant="inverse" size="small">
            All courses
            <template #icon-end><AppIcon name="lucide:arrow-right" /></template>
          </AppButton>
        </div>

        <div class="link train">
          <h3>Caregiver training</h3>
          <p>Medication Administration Provider training for direct-care professionals</p>
          <AppButton href="#courses" variant="secondary" size="small">
            All courses
            <template #icon-end><AppIcon name="lucide:arrow-right" /></template>
          </AppButton>
        </div>
      </div>
      <div class="trust-panel">
        <AppTrust />
      </div>
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .new-hero {
    container-type: inline-size;
    container-name: hero;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(8, minmax(100px, auto));
  }

  .image {
    height: 100%;
    width: 100%;
    border-radius: var(--radius-400);
    object-fit: cover;
    grid-row: 1/-3;
    grid-column: 1/-1;
    aspect-ratio: unset;

    @container hero (width > 800px) {
      grid-row: 1/-2;
      aspect-ratio: 16;
    }
  }

  .overlay {
    height: 100%;
    width: 100%;
    border-radius: var(--radius-400);
    grid-row: 1/-3;
    grid-column: 1/-1;
    background:
      radial-gradient(152.19% 83.7% at 5.33% 117.16%, #002e3e 0%, rgba(0, 46, 62, 0) 100%),
      no-repeat;

    @container hero (width > 800px) {
      grid-row: 1/-2;
    }
  }

  .content {
    grid-template-rows: subgrid;
    grid-row: 3/6;
    grid-column-start: 1;
    grid-column-end: -1;
    padding-inline: var(--space-700);
    padding-bottom: 2rem;
    place-content: end;

    p {
      font-size: var(--text-brand-display);
      text-wrap: balance;
      color: var(--clr-neutral-100);
      line-height: var(--lh-tight);
      max-width: 600px;

      span {
        text-decoration: underline solid var(--clr-accent-400);
        text-underline-offset: 0.15em;
        text-decoration-thickness: 8px;
      }
    }

    @container hero (width > 800px) {
      grid-row: 3/7;
      padding-bottom: 3.5rem;
    }
  }

  .section-2 {
    grid-template-rows: auto auto;
    grid-template-columns: subgrid;
    display: grid;
    padding-inline: var(--space-400);
    gap: var(--space-400);
    grid-row-start: 6;
    grid-row-end: 9;
    grid-column: 1/-1;

    @container hero (width > 800px) {
      grid-template-rows: subgrid;
      padding-inline: var(--space-700);
      gap: var(--space-700);
      grid-row-start: 7;
      grid-row-end: 9;
      grid-column: 1/-1;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-column: span 2;
      grid-row: auto;
      gap: var(--space-300);
      padding: var(--space-200);
      border-radius: var(--radius-400);
      background-color: var(--clr-surface);

      .link {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-300);
        min-width: 0;
        border-radius: var(--radius-300);
        padding: var(--space-500);

        h3 {
          margin: 0;
          color: inherit;
          font-size: var(--text-compact-heading);
          font-weight: var(--fw-regular);
          line-height: var(--lh-snug);
        }

        p {
          margin: 0;
          font-size: var(--text-meta);
          line-height: var(--lh-base);
          text-wrap: pretty;
        }

        .button {
          margin-top: auto;
        }
      }

      .apply {
        background: var(--clr-primary-500);
        color: var(--clr-neutral-100);
      }

      .train {
        background: var(--clr-neutral-300);
        color: var(--clr-text);

        p {
          color: var(--clr-text-muted);
        }
      }

      @container hero (width <= 480px) {
        grid-template-columns: minmax(0, 1fr);
      }

      @container hero (width > 800px) {
        grid-column: span 1;
        grid-row: 1/-1;
      }
    }

    .trust-panel {
      grid-row: auto;
      grid-column: span 2;

      @container hero (width > 800px) {
        grid-row: 2/-1;
        grid-column: span 1;
      }
    }
  }
}
</style>
