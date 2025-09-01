<script setup lang="ts">
const {data} = useAsyncData('courses', () => $fetch('/api/courses'))


function formatDate(dateString) {
  const date = new Date(dateString);

  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();

  // add ordinal suffix
  const suffix = (d => {
    if (d > 3 && d < 21) return "th"; // 4th–20th
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  })(day);

  return `${dayName} ${monthName} ${day}${suffix}`;
}

</script>


<template>
  <section class="courses card u-surface-2">
    <div>
      <Typography tag="h2" variant="heading-medium">
        Courses We <span>Offer</span>
      </Typography>
      <Typography tag="p" variant="text">Harmony Rooster, LLC is a locally owned and operated company based in Tampa, Florida. The company was founded by Derek and Cynthia Robinson, who are passionate about providing exceptional in-home care services that empower individuals to live their best lives.</Typography>
    </div>
    <div v-if="data" class="courses-wrapper">
      <div v-for="course in data" :key="course.id">
        <div>
        <Typography tag="h3" variant="heading-small" >{{course.course_name}}</Typography>
        <Typography tag="p" variant="text">{{course.description}}</Typography>
        <Typography tag="p" variant="text">Price ${{course.cost}}.00</Typography>
        </div>
        <ul class="sessions-wrapper">
          <li v-for="session in course.sessions" :key="session.id">
            <div class="session_card">
              <Typography tag="h4" variant="text-large">
                {{formatDate(session.date) }}
              </Typography>

              <div>
                <Typography tag="p" variant="text"><b>Time:</b> {{ session.time }}</Typography>
                <Typography tag="p" variant="text"><b>Spots Remaining:</b> {{session.spots_available}}</Typography>
              </div>

              <button class="u-btn u-btn--sm u-btn--primary">Book Now</button>
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
</style>
