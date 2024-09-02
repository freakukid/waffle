export default defineEventHandler(async (event) => {
  const { worker_id } = event.context.params

  //Get permissions
  let permissions = null
  if(worker_id) {
    permissions = await prisma.permission.findUnique({
      where: {
        worker_id: parseInt(worker_id)
      },
      select: {
        add_item: true,
        edit_item: true,
        delete_item: true,
        make_transactions: true,
        view_log: true
      }
    })
  } else {
    throw new Error(`Invalid worker id: ${worker_id}`)
  }
    
  return permissions
})
