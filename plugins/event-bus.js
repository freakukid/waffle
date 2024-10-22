import mitt from 'mitt'

export default defineNuxtPlugin(() => {
  const eventBus = mitt()
  
  // Provide the event bus so it can be accessed in your components and composables
  return {
    provide: {
      eventBus,
    },
  }
})