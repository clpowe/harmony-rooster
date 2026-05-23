<script setup lang="ts">
import {
  EBody,
  EContainer,
  EHead,
  EHeading,
  EHtml,
  EHr,
  ELink,
  EPreview,
  ESection,
  EText,
} from "@vue-email/components";

defineProps<{
  firstName: string;
  sessionName: string;
  sessionDate: string;
  sessionTime: string;
  sessionLocation: string;
  amountFormatted: string;
  receiptUrl?: string | null;
  registrationId: string;
  supportEmail: string;
}>();

const bodyStyle = {
  backgroundColor: "#f6f6f4",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: "0",
  padding: "24px 0",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e0",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const headerStyle = {
  paddingBottom: "8px",
};

const brandStyle = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const h2Style = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const textStyle = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "1.55",
  margin: "0 0 12px",
};

const rowStyle = {
  color: "#1a1a1a",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px",
};

const mutedStyle = {
  color: "#6b6b66",
  fontSize: "13px",
  lineHeight: "1.55",
  margin: "8px 0 0",
};

const hrStyle = {
  borderColor: "#e5e5e0",
  margin: "24px 0",
};

const ctaSectionStyle = {
  margin: "16px 0",
  textAlign: "center" as const,
};

const buttonStyle = {
  backgroundColor: "#1a1a1a",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};

const linkStyle = {
  color: "#1a1a1a",
  textDecoration: "underline",
};
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EPreview>Receipt for {{ sessionName }}</EPreview>
    <EBody :style="bodyStyle">
      <EContainer :style="containerStyle">
        <ESection :style="headerStyle">
          <EHeading as="h1" :style="brandStyle">Harmony Rooster</EHeading>
        </ESection>

        <ESection>
          <EText :style="textStyle">Hi {{ firstName }},</EText>
          <EText :style="textStyle">
            Your payment was received. You're registered for
            <strong>{{ sessionName }}</strong
            >.
          </EText>
        </ESection>

        <EHr :style="hrStyle" />

        <ESection>
          <EHeading as="h2" :style="h2Style">Session details</EHeading>
          <EText :style="rowStyle"><strong>Date:</strong> {{ sessionDate }}</EText>
          <EText :style="rowStyle"><strong>Time:</strong> {{ sessionTime }}</EText>
          <EText :style="rowStyle"><strong>Location:</strong> {{ sessionLocation }}</EText>
          <EText :style="rowStyle"><strong>Amount paid:</strong> {{ amountFormatted }}</EText>
          <EText :style="mutedStyle">Registration ID: {{ registrationId }}</EText>
        </ESection>

        <ESection v-if="receiptUrl" :style="ctaSectionStyle">
          <ELink :href="receiptUrl" :style="buttonStyle">View Stripe receipt</ELink>
        </ESection>

        <EHr :style="hrStyle" />

        <ESection>
          <EText :style="mutedStyle">
            Questions? Reply to this email or contact
            <ELink :href="`mailto:${supportEmail}`" :style="linkStyle"> {{ supportEmail }} </ELink>.
          </EText>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
