<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { contactFormSchema, CONTACT_MESSAGE_MAX_LENGTH } from "@types/contact";

type SubmitState = "idle" | "success" | "error";

const submitState = ref<SubmitState>("idle");
const submitMessage = ref("");
const isSubmittingRequest = ref(false);

const validationSchema = toTypedSchema(contactFormSchema);

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    name: "",
    email: "",
    message: "",
    company: "",
    startedAt: Date.now(),
  },
});

const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [message, messageAttrs] = defineField("message");
const [company, companyAttrs] = defineField("company");
const [startedAt] = defineField("startedAt");

const onSubmit = handleSubmit(async (values) => {
  submitState.value = "idle";
  submitMessage.value = "";
  isSubmittingRequest.value = true;

  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: values,
    });

    submitState.value = "success";
    submitMessage.value = "Thanks. We'll get back to you soon.";
    resetForm({
      values: {
        name: "",
        email: "",
        message: "",
        company: "",
        startedAt: Date.now(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "We could not send your message right now.";

    submitState.value = "error";
    submitMessage.value = message;
    startedAt.value = Date.now();
  } finally {
    isSubmittingRequest.value = false;
  }
});
</script>

<template>
  <form class="contact-form" novalidate @submit.prevent="onSubmit">
    <div class="contact-form__fields">
      <div class="contact-form__field">
        <label class="contact-form__label" for="contact-name">Name</label>
        <input
          id="contact-name"
          v-model="name"
          v-bind="nameAttrs"
          class="contact-form__input"
          :class="{ 'is-invalid': errors.name }"
          type="text"
          name="name"
          autocomplete="name"
          placeholder="Name"
          :aria-invalid="errors.name ? 'true' : 'false'"
        />
        <p v-if="errors.name" class="contact-form__error">{{ errors.name }}</p>
      </div>

      <div class="contact-form__field">
        <label class="contact-form__label" for="contact-email">Email</label>
        <input
          id="contact-email"
          v-model="email"
          v-bind="emailAttrs"
          class="contact-form__input"
          :class="{ 'is-invalid': errors.email }"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="name@example.com"
          :aria-invalid="errors.email ? 'true' : 'false'"
        />
        <p v-if="errors.email" class="contact-form__error">{{ errors.email }}</p>
      </div>

      <div class="contact-form__field">
        <label class="contact-form__label" for="contact-message">Message</label>
        <textarea
          id="contact-message"
          v-model="message"
          v-bind="messageAttrs"
          class="contact-form__input contact-form__textarea"
          :class="{ 'is-invalid': errors.message }"
          name="message"
          rows="6"
          :maxlength="CONTACT_MESSAGE_MAX_LENGTH"
          placeholder="Max message length 250 characters"
          :aria-invalid="errors.message ? 'true' : 'false'"
        />
        <p v-if="errors.message" class="contact-form__error">{{ errors.message }}</p>
      </div>
    </div>

    <div class="u-visually-hidden" aria-hidden="true">
      <label for="contact-company">Company</label>
      <input
        id="contact-company"
        v-model="company"
        v-bind="companyAttrs"
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
      />
    </div>

    <input v-model="startedAt" type="hidden" name="startedAt" />

    <div class="contact-form__actions">
      <button
        type="submit"
        class="button button--sm button--primary contact-form__submit"
        :disabled="isSubmittingRequest"
      >
        {{ isSubmittingRequest ? "Sending..." : "Submit" }}
      </button>

      <p
        v-if="submitState !== 'idle'"
        class="contact-form__status"
        :class="{
          'contact-form__status--success': submitState === 'success',
          'contact-form__status--error': submitState === 'error',
        }"
      >
        {{ submitMessage }}
      </p>
    </div>
  </form>
</template>

<style scoped>
.contact-form {
  display: grid;
  width: 100%;
  gap: var(--space-sm);
  justify-self: start;
}

.contact-form__fields {
  display: grid;
  gap: 0.75rem;
}

.contact-form__field {
  display: grid;
  gap: 0.25rem;
}

.contact-form__label {
  color: var(--text-1);
  font-size: var(--text-base);
  line-height: 1;
}

.contact-form__input {
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid color-mix(in oklch, var(--secondary) 55%, white);
  border-radius: var(--radius-sm);
  background: var(--surface-1);
  color: var(--text-1);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.contact-form__input::placeholder {
  color: var(--neutral-400);
}

.contact-form__input:focus-visible {
  outline: none;
  border-color: var(--primary-400);
  box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary-100) 65%, transparent);
}

.contact-form__textarea {
  min-height: 8.5rem;
  resize: vertical;
}

.contact-form__error {
  color: #b80000;
  font-size: var(--text-sm);
  line-height: 1.2;
}

.contact-form__actions {
  display: grid;
  gap: var(--space-xs);
  justify-items: start;
}

.contact-form__submit {
  min-height: 2rem;
  padding-inline: 0.75rem;
  font-size: 0.75rem;
}

.contact-form__status {
  font-size: var(--text-sm);
  line-height: 1.3;
}

.contact-form__status--success {
  color: var(--primary-600);
}

.contact-form__status--error {
  color: var(--danger-500);
}

@media (min-width: 48rem) {
  .contact-form {
    justify-self: end;
  }
}
</style>
