import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@vue-email/components";
import { defineComponent, h, type PropType, type VNode } from "vue";

/**
 * Mirrors the /success receipt page. Email clients can't use CSS variables, oklch(),
 * web fonts or our component CSS, so tokens from app/assets/css/global/tokens.css are
 * inlined here as hex. Keep the two in sync when the receipt design changes.
 */
const color = {
  primary100: "#ddf0fb",
  primary500: "#055e7c",
  accent300: "#f2ad1d",
  accent900: "#401908",
  success500: "#008100",
  successTint: "#e0f0e0",
  text: "#191919",
  textMuted: "#414141",
  surface: "#ffffff",
  surfacePage: "#f5f5f5",
  border: "#cbcbcb",
};

// Geist is not available in mail clients; fall back to the system UI face.
const fontBase = `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
const fontMono = `ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

const reset = { margin: 0, padding: 0 };

/** Same split as /success: the last words of the class name take the primary accent. */
function splitTitle(name: string) {
  const words = name.trim().split(/\s+/);
  const accentCount = words.length >= 4 ? 2 : words.length >= 2 ? 1 : 0;
  return {
    leading: words.slice(0, words.length - accentCount).join(" "),
    accent: words.slice(words.length - accentCount).join(" "),
  };
}

/** Airtable gives an ISO date; the page shows it as a long UTC date. Pass other strings through. */
function formatClassDate(value: string) {
  if (Number.isNaN(Date.parse(value))) return value;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function detailRow(label: string, value: string, link?: { href: string; label: string }) {
  return h(
    Row,
    {
      style: { borderBottom: `1px solid ${color.border}` },
    },
    () => [
      h(Column, { style: { padding: "16px 0", verticalAlign: "middle" } }, () => [
        h(
          Text,
          {
            style: {
              ...reset,
              color: color.textMuted,
              fontSize: "14px",
              lineHeight: "1.2",
            },
          },
          () => label,
        ),
        h(
          Text,
          {
            style: {
              ...reset,
              marginTop: "4px",
              color: color.text,
              fontSize: "17px",
              lineHeight: "1.55",
            },
          },
          () => value,
        ),
      ]),
      link
        ? h(Column, { align: "right", style: { padding: "16px 0", verticalAlign: "middle" } }, () =>
            h(
              Link,
              {
                href: link.href,
                style: { color: color.primary500, fontSize: "15px", textDecoration: "underline" },
              },
              () => `${link.label} ↗`,
            ),
          )
        : null,
    ],
  );
}

function summaryRow(
  label: string,
  value: string,
  options: { mono?: boolean; valueColor?: string } = {},
) {
  return h(Row, { style: { borderTop: `1px solid ${color.border}` } }, () => [
    h(Column, { style: { width: "43%", padding: "16px 0", verticalAlign: "baseline" } }, () =>
      h(
        Text,
        { style: { ...reset, color: color.textMuted, fontSize: "17px", lineHeight: "1.55" } },
        () => label,
      ),
    ),
    h(Column, { align: "right", style: { padding: "16px 0", verticalAlign: "baseline" } }, () =>
      h(
        Text,
        {
          style: {
            ...reset,
            color: options.valueColor ?? color.text,
            fontFamily: options.mono ? fontMono : fontBase,
            fontSize: options.mono ? "14px" : "17px",
            lineHeight: "1.55",
            textAlign: "right",
            wordBreak: "break-word",
          },
        },
        () => value,
      ),
    ),
  ]);
}

export const ReceiptEmail = defineComponent({
  name: "ReceiptEmail",
  props: {
    amountFormatted: { default: "", type: String },
    firstName: { required: true, type: String },
    receiptUrl: { default: null, type: String as PropType<string | null> },
    registrationId: { required: true, type: String },
    sessionDate: { required: true, type: String },
    sessionLocation: { required: true, type: String },
    sessionName: { required: true, type: String },
    sessionTime: { required: true, type: String },
    supportEmail: { required: true, type: String },
    logoUrl: { required: true, type: String },
  },
  setup(props) {
    return () => {
      const title = splitTitle(props.sessionName);
      const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${props.sessionLocation}, FL`,
      )}`;

      const buttons: VNode[] = [];
      if (props.receiptUrl) {
        buttons.push(
          h(
            Button,
            {
              href: props.receiptUrl,
              style: {
                display: "inline-block",
                marginRight: "12px",
                padding: "16px 24px",
                borderRadius: "999px",
                backgroundColor: color.primary500,
                color: color.surface,
                fontSize: "17px",
                fontWeight: 500,
                lineHeight: "1",
                textDecoration: "none",
              },
            },
            () => "View Stripe receipt",
          ),
        );
      }
      buttons.push(
        h(
          Button,
          {
            href: `mailto:${props.supportEmail}`,
            style: {
              display: "inline-block",
              padding: "16px 24px",
              borderRadius: "999px",
              backgroundColor: color.accent300,
              color: color.accent900,
              fontSize: "17px",
              fontWeight: 500,
              lineHeight: "1",
              textDecoration: "none",
            },
          },
          () => "Contact support",
        ),
      );

      return h(Html, { lang: "en" }, () => [
        h(Head),
        h(Preview, null, () => `You're registered for ${props.sessionName}`),
        h(
          Body,
          {
            style: {
              ...reset,
              backgroundColor: color.surfacePage,
              color: color.text,
              fontFamily: fontBase,
            },
          },
          () =>
            h(
              Container,
              { style: { maxWidth: "600px", margin: "0 auto", padding: "32px 16px" } },
              () => [
                // PNG, not SVG: Gmail and Outlook don't render SVG. Displayed at a third of the 546x120 source for sharp retina output.
                h(Img, {
                  src: props.logoUrl,
                  alt: "Harmony Roosters",
                  width: 182,
                  height: 40,
                  style: { display: "block", margin: "0 0 16px" },
                }),

                h(
                  Section,
                  {
                    style: {
                      overflow: "hidden",
                      borderRadius: "28px",
                      backgroundColor: color.surface,
                    },
                  },
                  () => [
                    // Brand rule: 75% primary / 25% accent, as on the page.
                    h(Row, { style: { height: "8px" } }, () => [
                      h(Column, {
                        style: { width: "75%", height: "8px", backgroundColor: color.primary500 },
                      }),
                      h(Column, {
                        style: { width: "25%", height: "8px", backgroundColor: color.accent300 },
                      }),
                    ]),

                    // Header
                    h(Row, null, () =>
                      h(Column, { style: { padding: "32px 32px 24px" } }, () => [
                        h(Row, null, () => [
                          h(Column, null, () =>
                            h(
                              "span",
                              {
                                style: {
                                  display: "inline-block",
                                  padding: "8px 12px",
                                  borderRadius: "999px",
                                  backgroundColor: color.successTint,
                                  color: color.success500,
                                  fontSize: "14px",
                                  lineHeight: "1.2",
                                },
                              },
                              "✓ Payment confirmed",
                            ),
                          ),
                          h(Column, { align: "right" }, () =>
                            h(
                              Text,
                              {
                                style: {
                                  ...reset,
                                  color: color.textMuted,
                                  fontFamily: fontMono,
                                  fontSize: "14px",
                                  wordBreak: "break-all",
                                },
                              },
                              () => `Receipt ${props.registrationId}`,
                            ),
                          ),
                        ]),
                        h(
                          Heading,
                          {
                            as: "h1",
                            style: {
                              margin: "20px 0 0",
                              color: color.text,
                              fontSize: "40px",
                              fontWeight: 400,
                              lineHeight: "1",
                              letterSpacing: "-0.045em",
                            },
                          },
                          () => "You're registered!",
                        ),
                        h(
                          Text,
                          {
                            style: {
                              margin: "20px 0 0",
                              color: color.textMuted,
                              fontSize: "18px",
                              lineHeight: "1.55",
                            },
                          },
                          () =>
                            `Hi ${props.firstName}, your registration is confirmed. We look forward to seeing you in class.`,
                        ),
                        h("div", { style: { marginTop: "24px" } }, buttons),
                      ]),
                    ),

                    // Class details: inset muted card
                    h(Row, null, () =>
                      h(Column, { style: { padding: "0 16px" } }, () =>
                        h(
                          Section,
                          {
                            style: {
                              borderRadius: "20px",
                              backgroundColor: color.surfacePage,
                            },
                          },
                          () =>
                            h(Row, null, () =>
                              h(Column, { style: { padding: "32px 24px" } }, () => [
                                h(
                                  Text,
                                  {
                                    style: {
                                      ...reset,
                                      color: color.textMuted,
                                      fontSize: "14px",
                                      lineHeight: "1.2",
                                    },
                                  },
                                  () => "Class details",
                                ),
                                h(
                                  Heading,
                                  {
                                    as: "h2",
                                    style: {
                                      margin: "8px 0 24px",
                                      color: color.text,
                                      fontSize: "30px",
                                      fontWeight: 400,
                                      lineHeight: "1.2",
                                      letterSpacing: "-0.03em",
                                    },
                                  },
                                  () => [
                                    `${title.leading} `,
                                    title.accent
                                      ? h(
                                          "span",
                                          { style: { color: color.primary500 } },
                                          title.accent,
                                        )
                                      : null,
                                  ],
                                ),
                                h("div", { style: { borderTop: `1px solid ${color.border}` } }, [
                                  detailRow("Date", formatClassDate(props.sessionDate)),
                                  detailRow("Time", props.sessionTime),
                                  detailRow("Location", props.sessionLocation, {
                                    href: directionsUrl,
                                    label: "Directions",
                                  }),
                                ]),
                              ]),
                            ),
                        ),
                      ),
                    ),

                    // Order summary
                    h(Row, null, () =>
                      h(Column, { style: { padding: "32px 32px 24px" } }, () => [
                        h(Row, null, () => [
                          h(Column, { style: { verticalAlign: "baseline" } }, () =>
                            h(
                              Heading,
                              {
                                as: "h2",
                                style: {
                                  margin: 0,
                                  color: color.text,
                                  fontSize: "22px",
                                  fontWeight: 500,
                                  lineHeight: "1.2",
                                  letterSpacing: "-0.03em",
                                },
                              },
                              () => "Order summary",
                            ),
                          ),
                          props.amountFormatted
                            ? h(
                                Column,
                                { align: "right", style: { verticalAlign: "baseline" } },
                                () =>
                                  h(
                                    Text,
                                    {
                                      style: {
                                        ...reset,
                                        color: color.text,
                                        fontSize: "30px",
                                        fontWeight: 400,
                                        lineHeight: "1.2",
                                        letterSpacing: "-0.03em",
                                      },
                                    },
                                    () => props.amountFormatted,
                                  ),
                              )
                            : null,
                        ]),
                        h("div", { style: { marginTop: "16px" } }, [
                          summaryRow("Registrant", props.firstName),
                          summaryRow("Payment", "Payment received"),
                          summaryRow("Status", "Payment confirmed", {
                            valueColor: color.success500,
                          }),
                          summaryRow("Registration ID", props.registrationId, { mono: true }),
                        ]),
                      ]),
                    ),
                  ],
                ),

                h(
                  Text,
                  {
                    style: {
                      margin: "24px 0 0",
                      color: color.textMuted,
                      fontSize: "15px",
                      lineHeight: "1.55",
                      textAlign: "center",
                    },
                  },
                  () => [
                    "Questions? Contact ",
                    h(
                      Link,
                      { href: `mailto:${props.supportEmail}`, style: { color: color.primary500 } },
                      () => props.supportEmail,
                    ),
                    ".",
                  ],
                ),
              ],
            ),
        ),
      ]);
    };
  },
});
