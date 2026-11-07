<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toastStore = useToastStore();

const redirect = (route.query.redirect as string) || '/';

const email = ref('admin@his.local');
const password = ref('Admin1234!');
const submitting = ref(false);
const formError = ref<string | null>(null);

async function onSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    formError.value = 'Email y contraseña son requeridos';
    return;
  }
  submitting.value = true;
  formError.value = null;
  try {
    await authStore.login(email.value, password.value);
    toastStore.success('Bienvenido', `Hola, ${authStore.usuario?.nombre}`);
    await router.push(redirect);
  } catch (err) {
    // Error ya manejado en el store
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-brand">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="brand-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h1>HIS</h1>
        <p>Hospital Information System</p>
      </div>

      <Card class="login-card">
        <div class="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingrese sus credenciales para acceder al sistema</p>
        </div>

        <form @submit.prevent="onSubmit" class="login-form">
          <Input
            v-model="email"
            label="Email"
            type="email"
            placeholder="admin@his.local"
            required
            autocomplete="email"
          />

          <Input
            v-model="password"
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />

          <div class="login-actions">
            <Button type="submit" variant="primary" block :loading="submitting">
              Iniciar Sesión
            </Button>
          </div>
        </form>

        <div v-if="authStore.error" class="login-error" role="alert">
          {{ authStore.error }}
        </div>

        <div class="login-footer">
          <p class="login-hint">
            <strong>Credenciales de prueba:</strong><br />
            admin@his.local / Admin1234!
          </p>
        </div>
      </Card>

      <div class="login-version">v0.1.0 - Programación 4 TFI</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-primary-light) 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  text-align: center;
}

.brand-icon {
  color: var(--color-primary);
}

.login-brand h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.login-brand p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.login-card {
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.login-header h2 {
  margin: 0 0 var(--space-xs);
  font-size: 1.5rem;
}

.login-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.login-actions {
  margin-top: var(--space-sm);
}

.login-error {
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.875rem;
  text-align: center;
  margin-top: var(--space-md);
}

.login-footer {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.login-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.login-hint strong {
  color: var(--color-text-secondary);
}

.login-version {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
