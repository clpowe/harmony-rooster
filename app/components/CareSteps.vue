<template>
  <section class="care-steps panel wrapper" aria-labelledby="care-steps-heading">
    <SectionHeader id="care-steps-heading" title="Getting started">
      <template #description
        >Tell us about the support you’re looking for. We’ll help you understand the next
        steps.</template
      >
    </SectionHeader>
    <ol
      class="care-steps__list auto-grid u-list-reset"
      role="list"
      aria-label="Steps to explore care"
    >
      <AppStepCard :step="1" title="Apply"
        >Start an APD application or contact us with questions about your existing waiver
        services.</AppStepCard
      >
      <AppStepCard :step="2" title="Talk with us"
        >Share your loved one’s needs, routines, and the support you’re looking for.</AppStepCard
      >
      <AppStepCard :step="3" title="Explore the next steps"
        >Discuss availability and the information needed to move forward with our team.</AppStepCard
      >
    </ol>
    <div class="repel">
      <AppTrustBadge icon="lucide:shield-check">State-licensed provider</AppTrustBadge
      ><AppTextLink href="#contact">Talk with our team</AppTextLink>
    </div>
  </section>
</template>

<style scoped>
@layer blocks {
  .care-steps {
    display: grid;
    gap: var(--space-600);
  }
  .care-steps__list {
    --auto-grid-min: 15rem;
    --auto-grid-gap: var(--space-450);
  }
}
</style>
