import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  extends: ['./layers/shop'],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', 'shadcn-nuxt','@nuxtjs/robots','@nuxtjs/sitemap'],
   ssr: true,
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://inventoryitem.shop',
    name: 'Online Food Shop'
  },

  sitemap: {
    exclude: [
      '/authenticated/**',
      '/auth/**'
    ]
  },

  robots: {
    disallow: ['/authenticated/**', '/auth/**', '/api/**'],
    sitemap: '/sitemap.xml'
  },

  app: {
    head: {
      title: 'Online Food Shop - Order Delicious Food Online',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Browse our menu, order fresh meals, drinks, and snacks online. Quick, fast, and easy delivery!' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:site_name', content: 'Online Food Shop' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Online Food Shop - Order Fresh Meals Online' },
        { property: 'og:description', content: 'Browse our delicious menu and order online. Burgers, snacks, drinks, and more!' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Online Food Shop' },
        { name: 'twitter:description', content: 'Order delicious food online fresh to your door.' }
      ],
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