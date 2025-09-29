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
    name: z
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
    cardnumber: z
        .string()
        .min(13, "Card number seems too short")
        .max(19, "Card number seems too long"),
    cvc: z.string().regex(/^\d{3,4}$/, "CSV must be 3 or 4 digits"),
    exp: z.string().regex(/^(0[1-9]|1[0-2])$/, "EXP month must be 01-12"),
    expdate: z.string().regex(/^\d{4}$/, "EXP year must be YYYY"),
});

// Setup VeeValidate form
const { defineField, handleSubmit, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(registrationSchema),
});
// Bind fields
const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [phonenumber, phonenumberAttrs] = defineField("phonenumber");
const [cardnumber, cardnumberAttrs] = defineField("cardnumber");
const [cvc, cvcAttrs] = defineField("cvc");
const [exp, expAttrs] = defineField("exp");
const [expdate, expdateAttrs] = defineField("expdate");

const onSubmit = handleSubmit(async (values) => {
    console.log(values.cvc);
    let token;
    const baseUrl =
        "https://sandbox-quickbooks.api.intuit.com/v4/payments/tokens";
    try {
        token = await $fetch(
            "https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens",
            {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    card: {
                        expYear: values.expdate,
                        expMonth: values.exp,
                        name: values.name,
                        cvc: values.cvc,
                        number: values.cardnumber,
                        address: {
                            postalCode: "94086",
                        },
                    },
                },
            },
        );
        console.log(token);
    } catch (e) {
        console.error("Token generation failed", e);
    }

    const payload = {
        name: values.name,
        email: values.email,
        phonenumber: values.phonenumber,
        token: token.value,
        session_Id: (session.value?.id ?? "N/A") as string,
    };

    try {
        const response = await $fetch("/api/courses", {
            method: "POST",
            body: payload,
        });

        console.log(response);
        await refreshCourses();
    } catch (e) {
        // optionally handle toast/notification
        console.error("Registration failed", e.data.message);
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
                    <label for="name" class="form-label">Name *</label>
                    <input
                        id="name"
                        v-model="name"
                        v-bind="nameAttrs"
                        type="text"
                        class="form-input"
                        :class="{ error: errors.name }"
                        placeholder="Enter your full name"
                    />
                    <span v-if="errors.name" class="error-message">{{
                        errors.name
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
                <h2>Payment Information</h2>
                <div class="form-group">
                    <label for="cardnumber" class="form-label"
                        >Card Number</label
                    >
                    <input
                        id="cardnumber"
                        v-model="cardnumber"
                        v-bind="cardnumberAttrs"
                        type="text"
                        inputmode="numeric"
                        class="form-input"
                        :class="{ error: errors.cardnumber }"
                        placeholder="5555 5555 5555 5555"
                        autocomplete="cc-number"
                    />
                    <span v-if="errors.cardnumber" class="error-message">{{
                        errors.cardnumber
                    }}</span>
                </div>
                <div class="form-group">
                    <label for="cvc" class="form-label">CVC</label>
                    <input
                        id="cvc"
                        autocomplete="cc-csc"
                        v-model="cvc"
                        v-bind="cvcAttrs"
                        type="text"
                        inputmode="numeric"
                        class="form-input"
                        :class="{ error: errors.cvc }"
                        placeholder="123"
                    />
                    <span v-if="errors.cvc" class="error-message">{{
                        errors.cvc
                    }}</span>
                </div>
                <div class="form-group">
                    <label for="exp" class="form-label">EXP Month (MM)</label>
                    <input
                        id="exp"
                        v-model="exp"
                        v-bind="expAttrs"
                        autocomplete="cc-exp-month"
                        type="text"
                        inputmode="numeric"
                        class="form-input"
                        placeholder="01"
                        :class="{ error: errors.exp }"
                    />
                    <span v-if="errors.exp" class="error-message">{{
                        errors.exp
                    }}</span>
                </div>

                <div class="form-group">
                    <label for="expdate" class="form-label"
                        >EXP Year (YYYY)</label
                    >
                    <input
                        id="expdate"
                        v-model="expdate"
                        v-bind="expdateAttrs"
                        type="text"
                        inputmode="numeric"
                        class="form-input"
                        placeholder="2026"
                        autocomplete="cc-exp-year"
                        :class="{ error: errors.expdate }"
                    />
                    <span v-if="errors.expdate" class="error-message">{{
                        errors.expdate
                    }}</span>
                </div>
                <button type="submit" class="u-btn u-btn--md u-btn--primary">
                    Submit Registration
                </button>
            </form>
        </div>
    </section>
</template>
