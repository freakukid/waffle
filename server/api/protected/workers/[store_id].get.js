export default defineEventHandler(async (event) => {
  const { store_id } = event.context.params

  if(store_id) {
    const workers = await prisma.worker.findMany({
      where: {
        store_id: parseInt(store_id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        permission: {
          select: {
            add_item: true,
            edit_item: true,
            delete_item: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'desc' // or 'asc' for ascending order
        }
      }
    })
    
    return workers
  } else {
    throw new Error(`Invalid store id: ${store_id}`)
  }
})