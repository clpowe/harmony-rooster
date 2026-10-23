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
  if (isSubmittingRequest.value) return;
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
      <AppTextField
        id="contact-name"
        v-model="name"
        v-bind="nameAttrs"
        label="Name"
        type="text"
        name="name"
        autocomplete="name"
        placeholder="Name"
        :error="errors.name"
      />
      <AppTextField
        id="contact-email"
        v-model="email"
        v-bind="emailAttrs"
        label="Email"
        type="email"
        name="email"
        autocomplete="email"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="name@example.com"
        :error="errors.email"
      />
      <AppTextField
        id="contact-message"
        v-model="message"
        v-bind="messageAttrs"
        as="textarea"
        label="Message"
        name="message"
        :rows="6"
        :maxlength="CONTACT_MESSAGE_MAX_LENGTH"
        hint="Maximum 250 characters."
        placeholder="How can we help?"
        :error="errors.message"
      />
    </div>

    <div class="visually-hidden" aria-hidden="true">
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
      <AppButton type="submit" variant="inverse" :loading="isSubmittingRequest">
        {{ isSubmittingRequest ? "Sending…" : "Send message" }}
      </AppButton>

      <p
        v-if="submitState !== 'idle'"
        role="status"
        aria-live="polite"
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
@layer blocks {
  .contact-form,
  .contact-form__fields {
    display: grid;
    inline-size: 100%;
    gap: var(--space-450);
  }

  .contact-form__actions {
    display: grid;
    gap: var(--space-300);
    justify-items: start;
  }

  .contact-form__status {
    font-size: var(--text-small);
  }

  .contact-form__status--success {
    color: var(--clr-success-500);
  }

  .contact-form__status--error {
    color: var(--clr-danger-500);
  }
}
</style>
