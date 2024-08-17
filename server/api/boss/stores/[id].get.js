export default defineEventHandler(async (event) => {
  const { id } = event.context.params

  if(id) {
    const stores = await prisma.store.findMany({
      where: {
        boss_id: parseInt(id)
      },
      include: {
        workers: true
      },
      orderBy: {
        id: 'asc'
      }
    })
    return stores
  } else {
    throw new Error(`Invalid boss ID: ${id}`)
  }
})