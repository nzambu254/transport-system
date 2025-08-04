// nuxt.config.ts
export default defineNuxtConfig({

  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  modules: [
    ['@nuxt/ui', {
      global: true,
      icons: ['heroicons', 'simple-icons']
    }],
    '@pinia/nuxt',
    ['@nuxtjs/supabase', {
      redirectOptions: {
        login: '/auth/login',
        callback: '/auth/confirm',
        exclude: ['/', '/boarding/queue']
      }
    }],
    ['@nuxtjs/google-fonts', {
      families: {
        Inter: [400, 500, 600, 700]
      }
    }],
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  },

  build: {
    transpile: ['@googlemaps/js-api-loader']
  },

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

  nitro: {
    experimental: {
      wasm: true
    }
  },

  imports: {
    dirs: [
      'composables/**',
      'utils/**'
    ]
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  experimental: {
    payloadExtraction: false,
    typedPages: true
  }
})
