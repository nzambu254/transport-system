export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss'
  ],

  // Keep only the tailwindcss config - REMOVE the postcss block
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    cssPath: '~/assets/css/tailwind.css',
    exposeConfig: false,
    injectPosition: 0,
    viewer: false,
  },

  // REMOVE THIS ENTIRE BLOCK - it's causing the conflict
  // postcss: {
  //   plugins: {
  //     '@tailwindcss/postcss': {
  //       from: undefined
  //     },
  //     autoprefixer: {}
  //   }
  // },

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    realtime: {
      events: ['INSERT', 'UPDATE', 'DELETE']
    }
  },

  ui: {
    icons: ['mdi', 'heroicons']
  },

  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },

  typescript: {
    typeCheck: true,
    strict: true
  },

  build: {
    transpile: ['@googlemaps/js-api-loader']
  },

  vite: {
    optimizeDeps: {
      include: ['date-fns']
    }
  }
})