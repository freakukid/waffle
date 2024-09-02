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
            username: true,
            name: true,
            email: true
          }
        },
        permission: {
          select: {
            add_item: true,
            edit_item: true,
            delete_item: true,
            make_transactions: true,
            view_log: true
          }
        }
      },
      orderBy: {
        user: {
          id: 'desc' // or 'asc' for ascending order
        }
      }
    })
    
    return workers
  } else {
    throw new Error(`Invalid store id: ${store_id}`)
  }
})