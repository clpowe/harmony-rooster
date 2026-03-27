<script setup lang="ts">
const route = useRoute();
const { getSessionById } = useCourses();
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const session = getSessionById(route.query.session_id as string);

// Submit handler: log all inputs + session_Id
const { refreshCourses } = useCourses();

// Zod schema for validation
const registrationSchema = z.object({
  first_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phonenumber: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      "Please enter a valid phone number",
    ),
});

// Setup VeeValidate form
const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(registrationSchema),
});
// Bind fields
const [first_name, first_nameAttrs] = defineField("first_name");
const [last_name, last_nameAttrs] = defineField("last_name");
const [email, emailAttrs] = defineField("email");
const [phonenumber, phonenumberAttrs] = defineField("phonenumber");

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    first_name: first_name.value,
    last_name: last_name.value,
    email: values.email,
    phonenumber: values.phonenumber,
    sessionId: (session.value?.id ?? "N/A") as string,
  };

  try {
    const response = await $fetch("/api/courses", {
      method: "POST",
      body: payload,
    });

    await navigateTo(response.url, { external: true });
    await refreshCourses();
  } catch (e) {
    // optionally handle toast/notification
    console.error("Registration failed", e);
  }

  // Optionally close and reset
  resetForm();
});
</script>

<template>
  <section class="registration-page l-container">
    <NuxtLink to="/" class="registration-page__back">Back</NuxtLink>

    <div v-if="session" class="registration-page__layout">
      <article class="registration-page__summary u-card u-surface-2">
        <div class="l-flow">
          <Typography tag="h1" variant="heading-medium"> Register for This Session </Typography>
          <Typography tag="p" variant="text">
            Review the session details, then complete your contact information to continue to
            payment.
          </Typography>
        </div>

        <dl class="registration-page__details">
          <div class="registration-page__detail">
            <dt>Date</dt>
            <dd>{{ formatDate(session.date) }}</dd>
          </div>
          <div class="registration-page__detail">
            <dt>Time</dt>
            <dd>{{ session.time }}</dd>
          </div>
          <div class="registration-page__detail">
            <dt>Location</dt>
            <dd>{{ session.location }}</dd>
          </div>
          <div class="registration-page__detail">
            <dt>Available Seats</dt>
            <dd>{{ session.spots_available }}</dd>
          </div>
        </dl>
      </article>

      <form @submit.prevent="onSubmit" class="registration-page__form u-card u-surface-2">
        <Typography tag="h2" variant="heading-small"> Contact Information </Typography>

        <div class="form-field">
          <label for="first_name" class="form-field__label">First Name</label>
          <input
            id="first_name"
            v-model="first_name"
            v-bind="first_nameAttrs"
            type="text"
            class="form-field__input"
            :class="{ 'is-invalid': errors.first_name }"
            placeholder="Enter your full name"
          />
          <span v-if="errors.first_name" class="form-field__error">{{ errors.first_name }}</span>
        </div>
        <div class="form-field">
          <label for="last_name" class="form-field__label">Last Name</label>
          <input
            id="last_name"
            v-model="last_name"
            v-bind="last_nameAttrs"
            type="text"
            class="form-field__input"
            :class="{ 'is-invalid': errors.last_name }"
            placeholder="Enter your full name"
          />
          <span v-if="errors.last_name" class="form-field__error">{{ errors.last_name }}</span>
        </div>
        <div class="form-field">
          <label for="email" class="form-field__label">Email *</label>
          <input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            class="form-field__input"
            :class="{ 'is-invalid': errors.email }"
            placeholder="your.email@example.com"
          />
          <span v-if="errors.email" class="form-field__error">{{ errors.email }}</span>
        </div>

        <div class="form-field">
          <label for="phonenumber" class="form-field__label">Phone Number *</label>
          <input
            id="phonenumber"
            v-model="phonenumber"
            v-bind="phonenumberAttrs"
            type="tel"
            class="form-field__input"
            :class="{ 'is-invalid': errors.phonenumber }"
            placeholder="(123) 456-7890"
          />
          <span v-if="errors.phonenumber" class="form-field__error">{{ errors.phonenumber }}</span>
        </div>

        <button type="submit" class="button button--md button--primary">Submit Registration</button>
      </form>
    </div>

    <div v-else class="registration-page__empty u-card u-surface-2 l-flow">
      <Typography tag="h2" variant="heading-small"> Session not found </Typography>
      <Typography tag="p" variant="text">
        We could not find the selected course session. Go back and pick another available date.
      </Typography>
    </div>
  </section>
</template>

<style scoped>
.registration-page {
  display: grid;
  gap: var(--space-lg);
}

.registration-page__back {
  width: fit-content;
  font-weight: 700;
  text-decoration: none;
  color: var(--primary-500);
}

.registration-page__layout {
  display: grid;
  gap: var(--space-lg);
}

.registration-page__summary,
.registration-page__form {
  display: grid;
  gap: var(--space-md);
}

.registration-page__details {
  display: grid;
  gap: var(--space-sm);
}

.registration-page__detail {
  display: grid;
  gap: var(--space-xxxs);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.registration-page__detail dt {
  color: var(--text-2);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.registration-page__detail dd {
  color: var(--text-1);
  font-size: 1rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .registration-page__layout {
    grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
    align-items: start;
  }
}
</style>
