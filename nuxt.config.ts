import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  extends: ['./layers/shop'],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', 'shadcn-nuxt','@nuxtjs/robots','@nuxtjs/sitemap'],
   ssr: true,
   site: {
    url: 'https://inventoryitem.shop/', // required, no trailing slash
    name: 'Shop me pls'
  },
    sitemap: {
    // auto-detects your pages/ routes by default, no extra config needed for static routes
  },

  robots: {
    // default already allows all crawlers — override only if you need to block something
  },
  app: {
  head: {
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  }
},
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