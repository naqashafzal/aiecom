import { prisma } from '../src/lib/db'
import * as bcrypt from 'bcryptjs'

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@aura.com' },
    update: {},
    create: {
      email: 'admin@aura.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('✅ Admin user created!')
  console.log('Email: admin@aura.com')
  console.log('Password: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Note: With driver adapters, we don't necessarily call $disconnect
    // but doing nothing is fine for a quick script
    process.exit(0)
  })
