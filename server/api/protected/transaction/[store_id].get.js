export default defineEventHandler(async (event) => {
  const { store_id } = event.context.params

  if(store_id) {
    const transactions = await prisma.transaction.findMany({
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
    
    return transactions
  } else {
    throw new Error(`Invalid store id: ${store_id}`)
  }
})