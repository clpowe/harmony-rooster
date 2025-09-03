<script setup lang="ts">
const {data} = useAsyncData('courses', () => $fetch('/api/courses'))


function formatDate(dateString: string) {
    // Use noon UTC so the calendar date is stable in ET regardless of DST
  const [year, month, day] = dateString.split("-").map(Number);
  if(!year || !month || !day) return ''
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  const tz = "America/New_York";

  const dayName   = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: tz }).format(utcNoon);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short",  timeZone: tz }).format(utcNoon);
  const dayNumber       = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: tz }).format(utcNoon));

  const suffix = dayNumber > 3 && dayNumber < 21 ? "th" : (dayNumber % 10 === 1 ? "st" : dayNumber % 10 === 2 ? "nd" : dayNumber % 10 === 3 ? "rd" : "th");
  return `${dayName} ${monthName} ${dayNumber}${suffix}`;
}

</script>


<template>
  <section class="courses card u-surface-2">
    <div>
      <Typography tag="h2" variant="heading-medium">
       <span>Courses We</span> <span>Offer</span>
      </Typography>
      <Typography tag="p" variant="text">Harmony Rooster, LLC is a locally owned and operated company based in Tampa, Florida. The company was founded by Derek and Cynthia Robinson, who are passionate about providing exceptional in-home care services that empower individuals to live their best lives.</Typography>
    </div>
    <div v-if="data" class="courses-wrapper">
      <div v-for="course in data" :key="course.id">
        <div class="courses-content">
          <div class="content-main">
            <Typography tag="h3" variant="heading-small" >{{course.course_name}}</Typography>
            <Typography tag="p" variant="text">{{course.description}}</Typography>
          </div >
            <Typography class="content-price" tag="p" variant="text">Price ${{course.cost}}.00</Typography>
        </div>
        <ul class="sessions-wrapper">
          <li v-for="session in course.sessions" :key="session.id">
            <div class="session_card">
              <Typography tag="h4" variant="text-large">
                {{formatDate(session.date) }}
              </Typography>

              <div>
                <Typography tag="p" variant="text"><span class="">Time:</span> {{ session.time }}</Typography>
                <Typography tag="p" variant="text"><span>Spots Remaining:</span> {{session.spots_available}}</Typography>
              </div>

              <button class="u-btn u-btn--md w-fit u-btn--primary">Book Now</button>
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
