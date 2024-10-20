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
  // webpack: {
  //   extractCSS: true, // Extract CSS into a single file
  // },
  modules: [
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth',
    'nuxt-icon',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt3-notifications',
  ],
  runtimeConfig: {    
    // Cloudinary
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    authOrigin: 'https://legitski.com',
  },
  auth: {
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: true
    }
  },
  elementPlus: {
    importStyle: 'scss',
    themes: ['dark'],
  },
  plugins: [
    { src: '~/plugins/register-service-worker.client.js', mode: 'client' }
  ],
})
