<template>
  <div class=""></div>
</template>

<script setup lang="ts">
type Staff = {
  id: string;
  name: string;
  title: string;
  description: string;
  picture: string;
};

const staff: Staff[] = [
  {
    id: "1",
    name: "Derek Robinson",
    title: "President/Owner",
    description:
      "With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion",
    picture: "/Placeholder.jpg",
  },
  {
    id: "2",
    name: "Cynthia Robinson",
    title: "Administrator",
    description:
      "With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion",
    picture: "/Placeholder.jpg",
  },
  {
    id: "3",
    name: "Cynthia Robinson",
    title: "Administrator",
    description:
      "With over 14+ years of experience in the medical field, Derek leads our team  with expertise and compassion",
    picture: "/Placeholder.jpg",
  },
];
</script>
