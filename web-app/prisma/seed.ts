import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, 'professors.json')
  
  if (!fs.existsSync(filePath)) {
    console.error("❌ Error: Could not find 'professors.json' in the prisma folder!")
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`Seeding ${rawData.length} professors...`)

  // Flags to detect if the scraper grabbed junk data in the courses array
  const avalancheFlags = ['phone', '0135', 'email', 'qualification', 'specialisation', 'brief profile']

  for (const prof of rawData) {
    // 1. Clean the courses array on the fly
    const rawCourses: string[] = prof.courses_taught || []
    const hasAvalanche = rawCourses.some(c => 
      avalancheFlags.some(flag => c.toLowerCase().includes(flag))
    )
    const cleanCourses = hasAvalanche ? [] : rawCourses

    // 2. Helper to convert empty strings to proper database nulls
    const getVal = (val: any) => (val === "" ? null : val)

    // 3. Upsert into Supabase (creates if it doesn't exist, skips if it does)
    await prisma.professor.upsert({
      where: { slug: prof.slug },
      update: {}, 
      create: {
        slug: prof.slug,
        name: prof.name,
        designation: getVal(prof.designation),
        school: getVal(prof.school),
        department: getVal(prof.department),
        bio: getVal(prof.bio),
        photoUrl: getVal(prof.photo_url),
        email: getVal(prof.email),
        profileUrl: getVal(prof.profile_url),
        courses: cleanCourses,
      }
    })
  }
  
  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })