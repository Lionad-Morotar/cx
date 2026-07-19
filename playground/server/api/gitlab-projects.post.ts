import { getCollection, ok } from '../utils/mock-store'

export default defineEventHandler(async () => ok({ objects: getCollection('gitlab-projects') }))
