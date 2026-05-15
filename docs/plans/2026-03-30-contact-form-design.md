# Contact Form Design

**Goal:** Add a secure contact form to the home page that matches the provided Figma layout, validates on both client and server, and delivers submissions through Resend.

## Scope

- Replace the placeholder contact form component with a working form.
- Match the provided Figma node for fields, spacing, error treatment, and submit action.
- Use shared validation so the client and server enforce the same rules.
- Deliver submissions to `clpowe@gmail.com` through a Resend-backed server endpoint.
- Add a first-pass spam prevention layer without CAPTCHA.

## Form Shape

The form will collect:

- `name`
- `email`
- `message`

The implementation will also include hidden/internal fields for spam prevention:

- `company` honeypot field
- `startedAt` timestamp used to detect unrealistically fast submissions

## Validation

Validation will be defined once in a shared Zod schema and reused on both sides.

- `name`: required, trimmed, minimum length, maximum length
- `email`: required, trimmed, normalized to lowercase, valid email format
- `message`: required, trimmed, minimum length, maximum length aligned with UI guidance
- `company`: must be empty
- `startedAt`: must be present and indicate a realistic submit delay

The server remains authoritative. Client validation is for UX only.

## Client UX

The form will be implemented in `app/components/ContactForm.vue` using Vee-Validate with Zod integration.

- Inline field labels and error messages
- Pending submit state
- Success and failure status messaging
- Accessible labels and `aria-invalid` wiring
- Styling aligned to the existing CSS token system rather than Tailwind

## Server Architecture

A dedicated POST route will handle submissions and Resend delivery.

- Parse and validate request body with the shared Zod schema
- Reject honeypot hits
- Reject suspiciously fast submissions
- Apply rate limiting by client IP using Nitro storage
- Check `Origin` against the configured site URL when present
- Send a plain-text email to `clpowe@gmail.com`
- Return a minimal UI-safe response

## Runtime Configuration

The following runtime config entries will be used:

- `resendApiKey`
- `contactToEmail`
- `contactFromEmail`
- `public.siteUrl`

`contactFromEmail` must be an address on a Resend-verified domain.

## Security Notes

First-pass anti-spam controls:

- Honeypot field
- Minimum submit-time threshold
- IP-based rate limiting
- Strict server-side validation
- Origin check when available
- Length caps and normalization

Deferred for later:

- CAPTCHA provider integration
- Persistent abuse tracking beyond process storage
- Rich HTML email templating
