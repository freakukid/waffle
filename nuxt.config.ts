// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ['@/assets/general.scss'],
  build:{ transpile: ["pinia-plugin-persistedstate"] },
  // sourcemap: { server: false, client: false },
  modules: [
    '@sidebase/nuxt-auth',
    'nuxt-icon',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt3-notifications'
  ],
  runtimeConfig: {    
    // Cloudinary
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    authOrigin: 'https://prismatic-stardust-325f17.netlify.app',
  },
  auth: {
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: true
    }
  },
  // @ts-ignore
  // Here you can specify a custom font for the app
  googleFonts: {
    families: {
      Poppins: [100, 200, 300, 400 , 500, 600, 700, 800, 900],
    },
    download: false,
    useStylesheet: true
  },
  elementPlus: {
    importStyle: 'scss',
    themes: ['dark'],
  },
})
