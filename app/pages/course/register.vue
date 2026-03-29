<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const route = useRoute();
const { getSessionById, refreshCourses } = useCourses();

const session = getSessionById(route.query.session_id as string);
const isSessionFull = computed(() => (session.value?.spots_available ?? 0) <= 0);
const submitDisabled = computed(() => !session.value || isSessionFull.value);

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

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(registrationSchema),
});

const [first_name, first_nameAttrs] = defineField("first_name");
const [last_name, last_nameAttrs] = defineField("last_name");
const [email, emailAttrs] = defineField("email");
const [phonenumber, phonenumberAttrs] = defineField("phonenumber");

const onSubmit = handleSubmit(async (values) => {
  if (submitDisabled.value) {
    return;
  }

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
    console.error("Registration failed", e);
  }

  resetForm();
});
</script>

<template>
  <section class="registration-page l-container">
    <NuxtLink to="/" class="registration-page__back button button--sm button--secondary">
      <Icon name="lucide:arrow-left" aria-hidden="true" />
      <span>Back</span>
    </NuxtLink>

    <div v-if="session" class="registration-page__shell">
      <article class="registration-page__card">
        <div class="registration-page__summary">
          <p v-if="isSessionFull" class="registration-page__status">This Session is full</p>

          <div class="registration-page__intro">
            <h1 class="registration-page__title">{{ session.course_name }}</h1>
            <p class="registration-page__description">{{ session.course_description }}</p>
          </div>

          <p class="registration-page__cost">Session Cost: ${{ session.course_cost }}</p>

          <dl class="registration-page__details">
            <div class="registration-page__detail">
              <Icon
                name="lucide:clock-4"
                class="registration-page__detail-icon"
                aria-hidden="true"
              />
              <div>
                <dt>Date</dt>
                <dd>{{ formatDate(session.date) }}</dd>
              </div>
            </div>

            <div class="registration-page__detail">
              <Icon
                name="lucide:clock-4"
                class="registration-page__detail-icon"
                aria-hidden="true"
              />
              <div>
                <dt>Time</dt>
                <dd>{{ session.time }}</dd>
              </div>
            </div>

            <div class="registration-page__detail">
              <Icon
                name="lucide:map-pin"
                class="registration-page__detail-icon"
                aria-hidden="true"
              />
              <div>
                <dt>Location</dt>
                <dd>{{ session.location }}</dd>
              </div>
            </div>

            <div class="registration-page__detail">
              <Icon name="lucide:users" class="registration-page__detail-icon" aria-hidden="true" />
              <div>
                <dt>Available Seats</dt>
                <dd>{{ session.spots_available }}</dd>
              </div>
            </div>
          </dl>
        </div>

        <form @submit.prevent="onSubmit" class="registration-page__form">
          <div class="registration-page__form-header">
            <span class="registration-page__step">1</span>
            <h2 class="registration-page__form-title">Contact Information</h2>
          </div>

          <div class="form-field">
            <label for="first_name" class="form-field__label">First Name</label>
            <input
              id="first_name"
              v-model="first_name"
              v-bind="first_nameAttrs"
              type="text"
              class="form-field__input registration-page__input"
              :class="{ 'is-invalid': errors.first_name }"
              placeholder="Name"
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
              class="form-field__input registration-page__input"
              :class="{ 'is-invalid': errors.last_name }"
              placeholder="Name"
            />
            <span v-if="errors.last_name" class="form-field__error">{{ errors.last_name }}</span>
          </div>

          <div class="form-field">
            <label for="email" class="form-field__label">Email</label>
            <input
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              class="form-field__input registration-page__input"
              :class="{ 'is-invalid': errors.email }"
              placeholder="ecample@example.com"
            />
            <span v-if="errors.email" class="form-field__error">{{ errors.email }}</span>
          </div>

          <div class="form-field">
            <label for="phonenumber" class="form-field__label">Contact Number</label>
            <input
              id="phonenumber"
              v-model="phonenumber"
              v-bind="phonenumberAttrs"
              type="tel"
              class="form-field__input registration-page__input"
              :class="{ 'is-invalid': errors.phonenumber }"
              placeholder="ex. (555)-555-5555"
            />
            <span v-if="errors.phonenumber" class="form-field__error">{{
              errors.phonenumber
            }}</span>
          </div>

          <button
            type="submit"
            class="button button--sm button--primary registration-page__submit"
            :disabled="submitDisabled"
          >
            Submit Registration
          </button>
        </form>
      </article>
    </div>

    <div v-else class="registration-page__empty u-card u-surface-2 l-flow">
      <Typography tag="h2" variant="heading-small">Session not found</Typography>
      <Typography tag="p" variant="text">
        We could not find the selected course session. Go back and pick another available date.
      </Typography>
    </div>
  </section>
</template>

<style scoped>
.registration-page {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  padding-block: clamp(1rem, 4vw, 3rem) var(--space-xxl);
}

.registration-page__back {
  justify-self: start;
  gap: 0.75rem;
  min-height: 2.5rem;
  color: var(--text-1);
  border-color: oklch(53.48% 0 89.88);
  background: var(--surface-1);
  text-transform: none;
  letter-spacing: 0;
}

.registration-page__back :deep(.icon) {
  font-size: 1rem;
}

.registration-page__shell {
  width: 100%;
}

.registration-page__card {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.75rem);
  padding: clamp(1.5rem, 4vw, 2rem);
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  box-shadow: 0 0 0 1px color-mix(in oklch, var(--neutral-200) 65%, transparent);
}

.registration-page__summary,
.registration-page__form {
  display: grid;
  align-content: start;
}

.registration-page__summary {
  gap: 1rem;
}

.registration-page__form {
  gap: 0.75rem;
}

.registration-page__status {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: oklch(59.15% 0.1857 31.78);
  color: var(--surface-1);
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
}

.registration-page__intro {
  display: grid;
  gap: 1rem;
}

.registration-page__title {
  color: var(--button-primary);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  font-weight: 400;
}

.registration-page__description {
  max-width: 26rem;
  color: var(--button-disabled-ink);
  font-size: 1rem;
  line-height: 1.2;
}

.registration-page__cost {
  width: fit-content;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--button-primary-active);
  color: var(--surface-1);
  font-size: 1rem;
  line-height: 1.5;
}

.registration-page__details {
  display: grid;
  gap: 1rem;
}

.registration-page__detail {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
  align-items: start;
}

.registration-page__detail-icon {
  margin-top: 0.15rem;
  font-size: 1.5rem;
  color: var(--text-1);
}

.registration-page__detail dt {
  color: color-mix(in oklch, var(--text-1) 78%, var(--button-disabled-ink));
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.registration-page__detail dd {
  color: color-mix(in oklch, var(--text-1) 82%, var(--button-disabled-ink));
  font-size: 1rem;
  line-height: 1.25;
}

.registration-page__form-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.registration-page__step {
  display: grid;
  place-items: center;
  width: 2.25rem;
  aspect-ratio: 1;
  border-radius: 999px;
  background: var(--button-accent);
  color: var(--text-1);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.registration-page__form-title {
  color: color-mix(in oklch, var(--text-1) 70%, var(--button-disabled-ink));
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1.2;
  font-weight: 700;
}

.registration-page__input {
  min-height: 4rem;
  padding: 0.75rem 1rem;
  border-color: oklch(57.52% 0 89.88);
  border-radius: 0.75rem;
  background: transparent;
  font-size: 1rem;
  line-height: 1.5;
}

.registration-page__input::placeholder {
  color: oklch(74.52% 0 89.88);
}

.registration-page__submit {
  justify-self: start;
  margin-top: 0.75rem;
}

.registration-page__empty {
  display: grid;
  gap: var(--space-md);
}

@media (max-width: 47.99rem) {
  .registration-page__card {
    border-radius: var(--radius-md);
  }

  .registration-page__summary {
    order: 1;
  }

  .registration-page__form {
    order: 2;
  }
}

@media (min-width: 48rem) {
  .registration-page__card {
    grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 23rem);
    align-items: start;
  }
}

@media (min-width: 64rem) {
  .registration-page__card {
    padding: 2.5rem;
  }
}
</style>
