<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function irAInicio() {
  router.push('/dashboard')
}

function volverAtras() {
  router.back()
}
</script>

<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-code">404</div>
      <h1>Página No Encontrada</h1>
      <p class="error-message">La página que buscas no existe o ha sido movida.</p>
      <div class="error-actions">
        <Button variant="primary" @click="irAInicio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Ir al Inicio
        </Button>
        <Button variant="secondary" @click="volverAtras">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver Atrás
        </Button>
      </div>
      <div class="error-help">
        <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.not-found-container {
  text-align: center;
  max-width: 400px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-md);
  opacity: 0.8;
}

.not-found-container h1 {
  margin: 0 0 var(--space-md);
  font-size: 2rem;
  color: var(--color-text);
}

.error-message {
  color: var(--color-text-secondary);
  font-size: 1.125rem;
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--space-xl);
}

.error-help {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.error-help p {
  margin: 0;
}
</style>