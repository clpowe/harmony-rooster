<script setup lang="ts">
const { data } = useAsyncData("courses", () => $fetch("/api/courses"));

function formatDate(dateString: string) {
  // Use noon UTC so the calendar date is stable in ET regardless of DST
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return "";
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  const tz = "America/New_York";

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: tz,
  }).format(utcNoon);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: tz,
  }).format(utcNoon);
  const dayNumber = Number(
    new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(
      utcNoon,
    ),
  );

  const suffix =
    dayNumber > 3 && dayNumber < 21
      ? "th"
      : dayNumber % 10 === 1
        ? "st"
        : dayNumber % 10 === 2
          ? "nd"
          : dayNumber % 10 === 3
            ? "rd"
            : "th";
  return `${dayName} ${monthName} ${dayNumber}${suffix}`;
}
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
            <div class="session_card">
              <div>
                <div class="date-wrapper">
                  <Icon name="lucide:calendar-range" size="1.75em" />
                  <h4 class="date">
                    {{ formatDate(session.date) }}
                  </h4>
                </div>
              </div>
              <div class="item-wrapper">
                <p class="item">
                  <Icon name="i-lucide-lightbulb" size="1.25em" />
                  {{ session.location }}
                </p>
                <p class="item">
                  <Icon name="i-lucide-lightbulb" size="1.25em" />
                  {{ session.time }}
                </p>
                <p class="item">
                  <Icon name="i-lucide-lightbulb" size="1.25em" />{{
                    session.spots_available
                  }}
                  seats available
                </p>
              </div>
              <button class="u-btn u-btn--md u-btn--primary">Register</button>
            </div>
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

.session_card {
  display: grid;
  gap: var(--space-sm);

  padding: var(--space-sm);
  border: 1px solid var(--neutral-500);
  border-radius: var(--radius-sm);

  .date-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-xs);

    .date {
      color: var(--text-1);
      font-size: 1.125rem;
      font-weight: bold;
    }
  }

  .item-wrapper {
    display: grid;
    gap: var(--space-xxs);

    .item {
      display: flex;
      gap: var(--space-xxxs);
    }
  }
}
</style>
