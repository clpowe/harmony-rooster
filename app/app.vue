<script setup lang="ts">
import roosterFavicon from "@/assets/images/Favicon.svg?url";
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.harmonyroosters.com/#organization",
  name: "Harmony Rooster, LLC",
  url: "https://www.harmonyroosters.com/",
  description:
    "Harmony Rooster provides personalized home care, respite, nursing support, and licensed foster home services for individuals with developmental disabilities in Hillsborough County, Florida.",
  email: "harmonyrooster@gmail.com",

  founder: [
    {
      "@type": "Person",
      name: "Derek Robinson",
    },
    {
      "@type": "Person",
      name: "Cynthia Robinson",
    },
  ],

  areaServed: [
    {
      "@type": "City",
      name: "Riverview",
    },
    {
      "@type": "City",
      name: "Brandon",
    },
    {
      "@type": "AdministrativeArea",
      name: "Hillsborough County, Florida",
    },
  ],

  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Care and support services",
    itemListElement: [
      "Personal Support",
      "Respite Care",
      "Nursing Support",
      "Residential Habilitation",
      "Foster Home Services",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
      },
    })),
  },
};
useSchemaOrg([
  defineLocalBusiness({
    "@id": "https://www.harmonyroosters.com/#organization",
    name: "Harmony Rooster, LLC",
    url: "https://www.harmonyroosters.com/",
    description:
      "Harmony Rooster provides personalized home care, respite, nursing support, and licensed foster home services for individuals with developmental disabilities in Hillsborough County, Florida.",
    email: "harmonyrooster@gmail.com",
    founder: [
      {
        "@type": "Person",
        name: "Derek Robinson",
      },
      {
        "@type": "Person",
        name: "Cynthia Robinson",
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Riverview",
      },
      {
        "@type": "City",
        name: "Tampa",
      },
      {
        "@type": "City",
        name: "Brandon",
      },
      {
        "@type": "AdministrativeArea",
        name: "Hillsborough County, Florida",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Care and support services",

      itemListElement: [
        "Personal Support",
        "Respite Care",
        "Nursing Support",
        "Residential Habilitation",
        "Foster Home Services",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
      })),
    },
  }),
]);
useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: roosterFavicon,
    },
  ],
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
