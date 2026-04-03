import { fileURLToPath } from 'node:url'
import vuetify from 'vite-plugin-vuetify'
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: '%s - CRM',
      title: 'CRM',
      link: [{
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico', // 👈 ruta relativa, sin variable
      }],
    },
  },

  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },

  css: [
    '@core/scss/template/index.scss',
    '@styles/styles.scss',
    '@/plugins/iconify/icons.css',
  ],

  components: {
    dirs: [{
      path: '@/@core/components',
      pathPrefix: false,
    }, {
      path: '~/components/global',
      global: true,
    }, {
      path: '~/components',
      pathPrefix: false,
    }],
  },

  plugins: [
    '@/plugins/vuetify/index.ts',
    '@/plugins/iconify/index.ts',
    '@/plugins/toast.ts',
    '@/plugins/sweetalert2.ts',
    '@/plugins/auth.ts',
  ],

  imports: {
    dirs: [
      './@core/utils',
      './@core/composable/',
      './plugins/*/composables/*',
      './composables/auth',
      './composables/profile',
      './composables/settings',
      './composables/contacts',
      './composables/utils',
    ],
  },

  hooks: {},

  experimental: {
    typedPages: true,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@/*': ['../*'],
          '@themeConfig': ['../themeConfig.ts'],
          '@layouts/*': ['../@layouts/*'],
          '@layouts': ['../@layouts'],
          '@core/*': ['../@core/*'],
          '@core': ['../@core'],
          '@images/*': ['../assets/images/*'],
          '@styles/*': ['../assets/styles/*'],
          '@validators': ['../@core/utils/validators'],
          '@db/*': ['../server/fake-db/*'],
          '@api-utils/*': ['../server/utils/*'],
        },
      },
    },
  },

  sourcemap: {
    server: false,
    client: false,
  },

  alias: {
    '@': fileURLToPath(new URL('.', import.meta.url)),
    '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
    '@core': fileURLToPath(new URL('./@core', import.meta.url)),
    '@layouts': fileURLToPath(new URL('./@layouts', import.meta.url)),
    '@images': fileURLToPath(new URL('./assets/images/', import.meta.url)),
    '@styles': fileURLToPath(new URL('./assets/styles/', import.meta.url)),
    '@configured-variables': fileURLToPath(new URL('./assets/styles/variables/_template.scss', import.meta.url)),
    '@db': fileURLToPath(new URL('./server/fake-db/', import.meta.url)),
    '@api-utils': fileURLToPath(new URL('./server/utils/', import.meta.url)),
  },

  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'swiper-container' || tag === 'swiper-slide',
    },
  },

  vite: {
    server: {
      allowedHosts: ['all'],
    },

    define: { 'process.env': {} },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
        '@themeConfig': fileURLToPath(new URL('./themeConfig.ts', import.meta.url)),
        '@core': fileURLToPath(new URL('./@core', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./@layouts', import.meta.url)),
        '@images': fileURLToPath(new URL('./assets/images/', import.meta.url)),
        '@styles': fileURLToPath(new URL('./assets/styles/', import.meta.url)),
        '@configured-variables': fileURLToPath(new URL('./assets/styles/variables/_template.scss', import.meta.url)),
        '@db': fileURLToPath(new URL('./server/fake-db/', import.meta.url)),
        '@api-utils': fileURLToPath(new URL('./server/utils/', import.meta.url)),
      },
    },

    build: {
      chunkSizeWarningLimit: 5000,
    },

    optimizeDeps: {
      exclude: ['vuetify'],
      entries: ['./**/*.vue'],
    },

    plugins: [
      svgLoader(),
      vuetify({
        styles: {
          configFile: 'assets/styles/variables/_vuetify.scss',
        },
      }),
    ],
  },

  build: {
    transpile: ['vuetify'],
  },

  runtimeConfig: {
    mongoUri: process.env.MONGO_URI,
    mongoUserName: process.env.MONGO_USER_NAME,
    mongoPassword: process.env.MONGO_PASSWORD,
    mongoHost: process.env.MONGO_HOST,
    mongoPort: process.env.MONGO_PORT,
    mongoDataBase: process.env.MONGO_DATA_BASE,
    jwtSecret: process.env.JWT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    facebookAppId: process.env.FACEBOOK_APP_ID,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
    mailHost: process.env.NUXT_MAIL_HOST,
    mailPort: process.env.NUXT_MAIL_PORT,
    mailUser: process.env.NUXT_MAIL_USER,
    mailPass: process.env.NUXT_MAIL_PASS,
    mailFrom: process.env.NUXT_MAIL_FROM,
    public: {
      appUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      n8nWebhookUrl: process.env.NUXT_PUBLIC_N8N_WEBHOOK_URL,
    },
  },

  compatibilityDate: '2025-07-15',

  modules: ['@vueuse/nuxt', '@nuxtjs/i18n', '@nuxtjs/device', '@pinia/nuxt'],

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  nitro: {
    preset: 'node-server',
    trustProxy: true,
  },
})
