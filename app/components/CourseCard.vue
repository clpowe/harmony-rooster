<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

type Session = {
  id?: string,
  date: string,
  location: string,
  time: string,
  spots_available: number,
}

const props = defineProps<{
  session: Session,
  courseName?: string,
  coursePrice?: number | string
}>()

const isOpen = ref(false)

// Zod schema for validation
const registrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phonenumber: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    ),
})

// Setup VeeValidate form
const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(registrationSchema),
})

// Bind fields
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [phonenumber, phonenumberAttrs] = defineField('phonenumber')

// Submit handler: log all inputs + session_Id
const onSubmit = handleSubmit((values) => {
  const payload = {
    ...values,
    session_Id: (props.session?.id ?? 'N/A') as string,
  }
  console.log(payload)
  // Optionally close and reset
  resetForm()
  isOpen.value = false
})


</script>

<template>
  <div class="session_card">
    <div class="card-header">
      <div class="date-badge">
        <Icon name="lucide:calendar" class="date-icon" />
        <span>{{ formatDate(session.date) }}</span>
      </div>
      <div class="price-tag" v-if="coursePrice">
        ${{ coursePrice }}
      </div>
    </div>
    
    <div class="card-details">
      <div class="detail-row">
        <Icon name="lucide:clock" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Time</span>
          <span class="detail-value">{{ session.time }}</span>
        </div>
      </div>
      
      <div class="detail-row">
        <Icon name="lucide:map-pin" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Location</span>
          <span class="detail-value">{{ session.location }}</span>
        </div>
      </div>
      
      <div class="detail-row">
        <Icon name="lucide:users" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Available</span>
          <span class="detail-value">{{ session.spots_available }} seats</span>
        </div>
      </div>
    </div>
    <DialogRoot v-model:open="isOpen">
      <DialogTrigger as-child>
        <button class="u-btn u-btn--md u-btn--primary">Register</button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="dialog-overlay" />
        <DialogContent class="dialog-content">
          <DialogTitle class="dialog-title">Course Registration</DialogTitle>
          <DialogDescription class="dialog-description">
            <div class="session-info">
              <div class="course-header" v-if="courseName">
                <h3>{{ courseName }}</h3>
                <div class="price-badge" v-if="coursePrice">
                  ${{ coursePrice }}.00
                </div>
              </div>

              <div class="session-details-grid">
                <div class="detail-item">
                  <Icon name="lucide:calendar" class="detail-icon" />
                  <div>
                    <span class="detail-label">Date</span>
                    <span class="detail-value">{{ formatDate(session.date) }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <Icon name="lucide:clock" class="detail-icon" />
                  <div>
                    <span class="detail-label">Time</span>
                    <span class="detail-value">{{ session.time }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <Icon name="lucide:map-pin" class="detail-icon" />
                  <div>
                    <span class="detail-label">Location</span>
                    <span class="detail-value">{{ session.location }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <Icon name="lucide:users" class="detail-icon" />
                  <div>
                    <span class="detail-label">Available Spots</span>
                    <span class="detail-value">{{ session.spots_available }} seats</span>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="onSubmit" class="registration-form">
              <div class="form-group">
                <label for="name" class="form-label">Name *</label>
                <input id="name" v-model="name" v-bind="nameAttrs" type="text" class="form-input"
                  :class="{ error: errors.name }" placeholder="Enter your full name" />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Email *</label>
                <input id="email" v-model="email" v-bind="emailAttrs" type="email" class="form-input"
                  :class="{ error: errors.email }" placeholder="your.email@example.com" />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="phonenumber" class="form-label">Phone Number *</label>
                <input id="phonenumber" v-model="phonenumber" v-bind="phonenumberAttrs" type="tel" class="form-input"
                  :class="{ error: errors.phonenumber }" placeholder="(123) 456-7890" />
                <span v-if="errors.phonenumber" class="error-message">{{ errors.phonenumber }}</span>
              </div>

              <div class="dialog-actions">
                <DialogClose as-child>
                  <button type="button" class="u-btn u-btn--md u-btn--secondary">Cancel</button>
                </DialogClose>
                <button type="submit" class="u-btn u-btn--md u-btn--primary">Submit Registration</button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<style>
.session_card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-300);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--neutral-200);
}

.date-badge {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--primary-600);
  font-weight: 600;
  font-size: 1rem;
}

.date-icon {
  width: 18px;
  height: 18px;
  color: var(--primary-500);
}

.price-tag {
  background: var(--primary-100, #e0f2fe);
  color: var(--primary-700, #0369a1);
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.875rem;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
}

.detail-row .detail-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-500);
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.detail-row .detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-3, #6b7280);
  font-weight: 500;
}

.detail-row .detail-value {
  font-size: 0.875rem;
  color: var(--text-1);
  font-weight: 500;
}

/* Button styling */
.session_card .u-btn--primary {
  margin-top: var(--space-xs);
  width: 100%;
  justify-content: center;
}

/* Dialog styles */
.dialog-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 50;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-content {
  background-color: var(--surface-1);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 520px;
  max-height: 90vh;
  padding: var(--space-lg);
  z-index: 100;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: var(--space-sm);
}

.dialog-description {
  color: var(--text-2);
  line-height: 1.5;
}

.session-info {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 2px solid var(--neutral-200);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.course-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-500);
  margin: 0;
}

.price-badge {
  background: var(--primary-100, #e0f2fe);
  color: var(--primary-700, #0369a1);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 1.125rem;
}

.session-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.detail-item {
  display: flex;
  gap: var(--space-xs);
  align-items: flex-start;
}

.detail-icon {
  color: var(--primary-500);
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-item>div {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxxs);
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3, #6b7280);
  font-weight: 500;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--text-1);
  font-weight: 500;
}

@media (max-width: 480px) {
  .session-details-grid {
    grid-template-columns: 1fr;
  }

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
}

.dialog-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  margin-top: var(--space-md);
}

/* Form styles */
.registration-form {
  display: grid;
  gap: var(--space-sm);
}

.form-group {
  display: grid;
  gap: var(--space-xxs);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-1);
}

.form-input {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--neutral-300);
  border-radius: var(--radius-sm);
  background: var(--surface-1);
  color: var(--text-1);
}

.form-input.error {
  border-color: var(--danger-500, #ef4444);
}

.error-message {
  color: var(--danger-500, #ef4444);
  font-size: 0.8rem;
}

@keyframes overlayShow {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
