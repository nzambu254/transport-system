<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoardingStore } from '@/stores/boarding' // Changed from ~ to @

const boardingStore = useBoardingStore()

onMounted(() => {
  boardingStore.subscribeToUpdates()
})
</script>

<style>
body {
  @apply bg-gray-50;
}
</style>