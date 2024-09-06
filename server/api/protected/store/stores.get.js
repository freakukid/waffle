import useAuthChecks from '../../composables/useAuthChecks'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  const boss_id = authUser?.boss.id

  //Check if we have required fields
  if (!boss_id)
    return { statusCode: 400, statusMessage: `You must be login to retrieve stores.` }

  const stores = await prisma.store.findMany({
    where: {
      boss_id: boss_id
    },
    include: {
      workers: true
    },
    orderBy: {
      id: 'asc'
    }
  })

  return stores
})