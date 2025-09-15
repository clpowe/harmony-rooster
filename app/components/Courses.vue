<script setup lang="ts">

const { data } = useAsyncData("courses", () => $fetch("/api/courses"));

</script>

<template>
  <section class="courses card u-surface-2">
    <div>
      <Typography tag="h2" variant="heading-medium">
        <span>Courses We</span> <span>Offer</span>
      </Typography>
      <Typography tag="p" variant="text">Harmony Rooster, LLC is a locally owned and operated company based in
        Tampa, Florida. The company was founded by Derek and Cynthia Robinson,
        who are passionate about providing exceptional in-home care services
        that empower individuals to live their best lives.</Typography>
    </div>
    <div v-if="data" class="courses-wrapper">
      <div v-for="course in data" :key="course.id">
        <div class="courses-content">
          <div class="content-main">
            <Typography tag="h3" variant="heading-small">{{
              course.course_name
              }}</Typography>
            <Typography tag="p" variant="text">{{
              course.description
              }}</Typography>
          </div>
          <div class="content-price">
            <Typography tag="p" variant="text-large">Price ${{ course.cost }}.00</Typography>
          </div>
        </div>
        <ul class="sessions-wrapper">
          <li v-for="session in course.sessions" :key="session.id">
            <CourseCard :session :course-name="course.course_name" :course-price="course.cost" />
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
ul {
  list-style: none;
}

.courses {
  display: grid;
  gap: var(--space-lg);
}

.courses-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.sessions-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-sm);
}

.courses {
  h2 {
    margin-bottom: var(--space-xxxs);
  }
}

.courses-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  padding-bottom: var(--space-sm);

  .content-main {
    display: grid;
    gap: var(--space-xxs);

    h3 {
      color: var(--primary-500);
      text-transform: uppercase;
    }
  }

  .content-price {
    place-self: start;
    padding: var(--space-xxs) var(--space-xxs);
    border-radius: var(--radius-lg);
  }

  @media (min-width: 768px) {
    flex-direction: row;

    .content-price {
      place-self: end;
    }
  }
}
</style>
