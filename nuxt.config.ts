import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  extends: ['./layers/shop'],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     */
    componentDir: '@/components/ui'
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.forEach((dir) => {
        if (typeof dir === 'object' && dir !== null) {
          const pathStr = typeof dir.path === 'string' ? dir.path.replace(/\\/g, '/') : '';
          // If this is the main app/components dir (and not the shadcn ui componentDir)
          if (!pathStr.endsWith('/components/ui')) {
            dir.ignore = dir.ignore || [];
            dir.ignore.push('ui/**', 'ui/**/*', '**/ui/**');
          }
        }
      });
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@lucide/vue',
        '@supabase/supabase-js',
        '@tanstack/vue-table',
        '@vueuse/core',
        'class-variance-authority',
        'clsx',
        'lucide-vue-next',
        'reka-ui',
        'tailwind-merge',
        'zod',
      ]
    }
  },
  supabase: {
    redirect: false,
    types: '~~/shared/types/database.types.ts'
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
  },
  nitro: {
    preset: 'cloudflare_module'
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true }
})