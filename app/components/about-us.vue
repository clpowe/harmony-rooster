<template>
  <AppPanel id="about-us" class="wrapper about" aria-labelledby="about-us-title">
    <div class="split about-layout">
      <img
        src="/asiannurse.jpg"
        alt="Caregiver providing in-home nursing support to a client"
        width="7728"
        height="5152"
        loading="lazy"
        decoding="async"
        class="about-image"
      />
      <div class="about-content">
        <div class="about-introduction">
          <h2 id="about-us-title" class="about-title">About Us</h2>
          <figure class="about-testimonial">
            <blockquote class="about-quote">
              <p>
                “We believe effective care begins with listening.
                <span class="about-quote-continuation">
                  Our approach centers on each person’s routines, preferences, abilities, and
                  goals.”
                </span>
              </p>
            </blockquote>
            <figcaption class="about-attribution">
              Derek &amp; Cynthia Robinson, Founders
            </figcaption>
          </figure>
        </div>
        <p class="about-description">
          Harmony Roosters, LLC is a locally owned and operated care provider founded by Derek and
          Cynthia Robinson. Their goal is to help individuals with developmental disabilities live
          with greater independence while giving families confidence in the support their loved one
          receives.
        </p>
      </div>
    </div>
  </AppPanel>
</template>

<style scoped>
@layer blocks {
  .about-layout {
    --split-align: stretch;
    --split-gap: var(--space-layout);
  }

  .about-image {
    inline-size: 100%;
    block-size: auto;
    aspect-ratio: var(--ratio-photo);
    object-fit: cover;
    border-radius: var(--radius-nested);
  }

  .about-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-600);
    min-inline-size: 0;
  }

  .about-title {
    color: var(--clr-primary-500);
  }

  .about-testimonial {
    margin-block-start: var(--space-500);
  }

  .about-quote {
    color: var(--clr-text);
    font-size: var(--text-body-lg);
    line-height: var(--lh-body);
  }

  .about-quote-continuation {
    display: block;
    color: var(--clr-text-subtle);
  }

  .about-attribution {
    margin-block-start: var(--space-300);
    color: var(--clr-text-subtle);
    font-size: var(--text-small);
  }

  .about-description {
    color: var(--clr-text-muted);
  }

  @media (width >= 56em) {
    .about-description {
      margin-block-start: auto;
    }
  }
}
</style>
