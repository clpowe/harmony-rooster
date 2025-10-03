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
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
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
    <section>
        <NuxtLink to="/"> Back </NuxtLink>
        <div>
            {{ session }}
        </div>
        <div>
            <form @submit.prevent="onSubmit" class="registration-form">
                <h2>Contact Information</h2>
                <div class="form-group">
                    <label for="first_name" class="form-label"
                        >First Name</label
                    >
                    <input
                        id="first_name"
                        v-model="first_name"
                        v-bind="first_nameAttrs"
                        type="text"
                        class="form-input"
                        :class="{ error: errors.first_name }"
                        placeholder="Enter your full name"
                    />
                    <span v-if="errors.first_name" class="error-message">{{
                        errors.first_name
                    }}</span>
                </div>
                <div class="form-group">
                    <label for="last_name" class="form-label">Last Name</label>
                    <input
                        id="last_name"
                        v-model="last_name"
                        v-bind="last_nameAttrs"
                        type="text"
                        class="form-input"
                        :class="{ error: errors.last_name }"
                        placeholder="Enter your full name"
                    />
                    <span v-if="errors.last_name" class="error-message">{{
                        errors.last_name
                    }}</span>
                </div>
                <div class="form-group">
                    <label for="email" class="form-label">Email *</label>
                    <input
                        id="email"
                        v-model="email"
                        v-bind="emailAttrs"
                        type="email"
                        class="form-input"
                        :class="{ error: errors.email }"
                        placeholder="your.email@example.com"
                    />
                    <span v-if="errors.email" class="error-message">{{
                        errors.email
                    }}</span>
                </div>

                <div class="form-group">
                    <label for="phonenumber" class="form-label"
                        >Phone Number *</label
                    >
                    <input
                        id="phonenumber"
                        v-model="phonenumber"
                        v-bind="phonenumberAttrs"
                        type="tel"
                        class="form-input"
                        :class="{ error: errors.phonenumber }"
                        placeholder="(123) 456-7890"
                    />
                    <span v-if="errors.phonenumber" class="error-message">{{
                        errors.phonenumber
                    }}</span>
                </div>

                <button type="submit" class="u-btn u-btn--md u-btn--primary">
                    Submit Registration
                </button>
            </form>
        </div>
    </section>
</template>
