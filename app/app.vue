<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Global imports and setup
useHead({
  title: 'Transport System - Priority Queue Boarding',
  meta: [
    { 
      name: 'description', 
      content: 'Advanced transport system with priority queue-based passenger boarding using heap data structures and real-time updates.' 
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Global error handling
const nuxtApp = useNuxtApp()

nuxtApp.hook('vue:error', (error, context) => {
  console.error('Vue error:', error, context)
})

nuxtApp.hook('app:error', (error) => {
  console.error('App error:', error)
})
</script>

<style>
html {
  font-family: 'Inter', sans-serif;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>