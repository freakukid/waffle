export default defineEventHandler(async (event) => {
  const { store_id } = event.context.params

  if(store_id) {
    const logs = await prisma.log.findMany({
      where: {
        store_id: parseInt(store_id)
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc' // or 'asc' for ascending order
      }
    })
    
    return logs
  } else {
    throw new Error(`Invalid store id: ${store_id}`)
  }
})