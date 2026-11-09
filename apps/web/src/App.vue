<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div class="app">
    <AppHeader v-if="authStore.isAuthenticated" />
    <div class="app-main">
      <AppSidebar v-if="authStore.isAuthenticated" />
      <main class="app-content">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
    <!-- Toast container global -->
    <Teleport to="body">
      <ToastContainer />
    </Teleport>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  margin-top: var(--header-height);

  display: flex;
  flex: 1;
  min-height: calc(100vh - var(--header-height));
}

.app-content {
  flex: 1;
  padding: var(--space-lg);
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-normal);
  min-height: calc(100vh - var(--header-height));
}

/* Sidebar colapsado */
.sidebar-collapsed .app-content {
  margin-left: var(--sidebar-collapsed-width);
}

/* Móvil */
@media (max-width: 1024px) {
  .app-content {
    margin-left: 0;
  }
}

/* Transiciones de router */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
