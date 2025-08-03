export default defineNuxtConfig({
  devtools: { enabled: true },

  // CSS Framework
  css: ['~/assets/css/tailwind.css'],

  // Modules
  modules: [
    ['@nuxt/ui', {
      global: true,
      icons: ['heroicons', 'simple-icons']
    }],
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts'
  ],

  // Supabase Configuration
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/', '/boarding/queue']
    }
  },

  // Runtime Config
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  },

  // Google Fonts
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  },

  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Build Configuration
  build: {
    transpile: ['@googlemaps/js-api-loader']
  },

  // App Configuration
  app: {
    head: {
      title: 'Transport System - Priority Queue Boarding',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Advanced transport system with priority queue-based passenger boarding' }
      ]
    }
  },

  // Nitro Configuration for better performance
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Auto-imports
  imports: {
    dirs: [
      'composables/**',
      'utils/**'
    ]
  }
})
