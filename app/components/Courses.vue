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
    <div v-if="data">
      <div v-for="course in data" :key="course.id">
        <Typography tag="h3" variant="heading-small" >{{course.course_name}}</Typography>
        <Typography tag="p" variant="text">{{course.description}}</Typography>
        <Typography tag="p" variant="text">Price ${{course.cost}}.00</Typography>
        <ul>
          <li v-for="session in course.sessions" :key="session.id">
            <div>
              <Typography tag="h4" variant="heading-small">
                {{formatDate(session.date) }}
              </Typography>
              <Typography tag="p" variant="text">Time: {{ session.time }}</Typography>
              <Typography tag="p" variant="text">Spots Remaining: {{session.spots_available}}</Typography>
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
