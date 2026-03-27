<script setup lang="ts">
import Rooster from "@/assets/icons/icon-rooster.svg";
</script>

<template>
  <section class="hero">
    <Rooster
      src="../assets/images/Rooster.svg"
      alt=""
      aria-hidden="true"
      :fontControlled="false"
      class="hero__art"
    />
    <div class="hero__body">
      <Typography tag="h1" variant="heading" uppercase class="">Harmony Rooster LLC</Typography>
      <Typography tag="h2" uppercase variant="heading-large"
        >Care you can <span>Trust</span> in <span>your Home</span>
      </Typography>
    </div>
    <div class="hero__lede">
      <Typography tag="p" variant="text"
        >We offer compassionate, non-emergency in-home care services designed to promote
        independence, dignity, and overall well-being.</Typography
      >
      <div class="hero__actions">
        <button class="button button--lg button--primary">Contact us</button>
      </div>
    </div>
  </section>
</template>

<style>
.hero {
  display: grid;
  position: relative;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  margin-block: var(--space-lg) var(--space-xl);
  container-type: inline-size;
  color: var(--text-1);

  @media (min-width: 768px) {
    gap: var(--space-xl);
  }
}

.hero__art {
  grid-row: 1 / span 2;
  grid-column: 1;
  z-index: -10;
  opacity: 0.1;
  height: 25cqh;
  justify-self: end;
  margin-right: -25%;

  @media (min-width: 400px) {
    margin-right: -10%;
  }

  @media (min-width: 768px) {
    justify-self: center;
    margin-right: 30%;
    height: 15rem;
    margin-top: -10%;
    grid-row: 2;
  }
}

.hero__body {
  max-width: 90ch;
  display: grid;
  grid-column: 1;
  grid-row: 1;
  gap: var(--space-xs);
}

.hero__body :where(h1, h2) {
  margin: 0;
}

.hero__lede {
  grid-row: 2;
  grid-column: 1;
  display: grid;
  gap: var(--space-md);
  justify-items: start;
  color: var(--text-2);
  font-style: italic;

  @media (min-width: 768px) {
    grid-row: 2;
    grid-column: 1 / -1;
    gap: var(--space-lg);
    align-self: flex-end;
    margin-left: 50%;
  }
}

.hero__actions {
  display: flex;
}

.hero__lede p {
  font-size: 0.875rem;
  max-width: 28rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    max-width: 32rem;
  }
}
</style>
