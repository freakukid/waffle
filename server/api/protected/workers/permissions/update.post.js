import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const boss_id = session?.user?.boss?.id

  //Check if this is a boss account
  if(!boss_id) {
    return { statusCode: 400, statusMessage: 'You must be a boss account to edit permissions.' }
  }

  let { worker_id, name, permissions } = await readBody(event)

  //Check if we have a worker id
  if (!worker_id) {
    return { statusCode: 400, statusMessage: 'Worker ID is not present.' }
  }

  //Update permissions 
  const permission = await prisma.permission.update({
    where: {
      worker_id: worker_id
    },
    data: {
      add_item: permissions.add_item,
      edit_item: permissions.edit_item,
      delete_item: permissions.delete_item,
      make_transactions: permissions.make_transactions,
      view_log: permissions.view_log
    },
  })

  setResponseStatus(event, 201)
  
  return {
    permission: permission,
    message: `Permissions updated for ${name}!`
  }
})
