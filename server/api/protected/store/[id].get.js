export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  if(id) {
    const store = await prisma.store.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        inventory: true
      }
    })
    
    return store
  } else {
    throw new Error(`Invalid store id: ${id}`)
  }
})