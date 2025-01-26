// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  compatibilityDate: '2024-10-11',
  css: [
    '@/assets/general.scss',
    '@/assets/tailwind.scss'
  ],
  build: { 
    transpile: ["pinia-plugin-persistedstate"],
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    'nuxt-icon',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-i18n-micro',
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'es', iso: 'es-ES', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    meta: true,
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Specify the appropriate API option as needed
          api: 'modern-compiler', // or "modern"
        },
      },
    },
  },
  runtimeConfig: {    
    // Cloudinary
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    authOrigin: 'https://legitski.com',
  },
  elementPlus: {
    importStyle: 'scss',
    themes: ['dark'],
  },
  plugins: [
    { src: '~/plugins/register-service-worker.client.js', mode: 'client' },
    { src: '~/plugins/apexcharts.js', mode: 'client' }
  ],
})
