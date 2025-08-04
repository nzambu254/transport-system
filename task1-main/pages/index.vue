<!-- pages/index.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-20 bg-gray-50">
    <h1 class="text-4xl font-bold mb-6 text-gray-900">
      Welcome to the Transport System
    </h1>
    <p class="mb-8 text-lg text-gray-700 max-w-xl text-center">
      Manage passenger boarding queues easily with our advanced priority system.
    </p>
    <NuxtLink
      to="/boarding/queue"
      class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Go to Boarding Queue
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// No script needed here unless you want dynamic logic
</script>

<style scoped>
/* Optional styling if you want */
</style>
