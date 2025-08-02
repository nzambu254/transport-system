<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
// Initialize stores if needed
const boardingStore = useBoardingStore();

// You can add any global initialization logic here
onMounted(() => {
  // Global mount logic if needed
});
</script>

<style>
/* Optional global styles */
body {
  @apply bg-gray-50;
}
</style>