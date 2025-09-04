import AIRTABLE from 'airtable'

type Session = {
  id: string
  session_name: string
  date: string
  time: string
  capacity: number
  spots_available: number
  location: string
}

type Course = {
  id: string
  course_name: string
  description: string
  duration: number
  cost: number
  sessions?: Session[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  AIRTABLE.configure({ apiKey: config.airtableKey })
  const base = AIRTABLE.base('apptCFjP3Ns4FdGGi')

  const records = await base('Courses')
    .select({ maxRecords: 4, view: 'Grid view' })
    .firstPage()

  const courses: Course[] = []

  const today = new Date()

  for (const record of records) {
    const sessionIds: string[] = record.get('sessions') || []  // be sure the field name is exact
    const sessions: Session[] = []


    for (const id of sessionIds) {
      const r = await base('Sessions').find(id)

      if (new Date(r.get('date') as string) < today) {
        continue
      }

      sessions.push({
        id: r.id as string,
        session_name: r.get('session-name') as string,
        date: r.get('date') as string,
        time: r.get('time') as string,
        capacity: r.get('capacity') as number,
        spots_available: r.get('spots-available') as number,
        location: r.get('location') as string,
      })
    }

    courses.push({
      id: record.id,
      course_name: record.get('course-name') as string,
      description: record.get('description') as string,
      duration: record.get('duration') as number,
      cost: record.get('cost') as number,
      sessions,
    })
  }

  return courses
})

