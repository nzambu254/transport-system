// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineNuxtConfig({
  // Use 'src' directory
  srcDir: 'src/',

  // Aliases pointing to ./src
  alias: {
    '~': fileURLToPath(new URL('./src', import.meta.url)),
    '@': fileURLToPath(new URL('./src', import.meta.url))
  },

  // Enable component auto-imports from ~/components
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/supabase'
  ],

  // Supabase config
  // @ts-ignore
  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    cookieOptions: {
      maxAge: 60 * 60 * 8 // 8 hours
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  },

  // UI module config
  ui: {
    icons: ['mdi', 'heroicons']
  },

  // Runtime public config
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },

  // TypeScript config
  typescript: {
    typeCheck: true,
    strict: true,
    tsConfig: {
      compilerOptions: {
        types: ['@nuxtjs/supabase']
      }
    }
  },


  // Build config
  build: {
    transpile: ['@googlemaps/js-api-loader']
  },

  // Vite config
  vite: {
    optimizeDeps: {
      include: ['date-fns']
    },
    plugins: [
      tsconfigPaths()
    ]
  },

  // Compatibility date for Nuxt
  compatibilityDate: '2025-07-15',

  // Enable Nuxt Devtools
  devtools: { enabled: true }
})
