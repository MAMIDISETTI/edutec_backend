require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  if (!adminEmail || !adminPassword) {
    console.error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env to seed the admin account.'
    );
    process.exit(1);
  }

  const users = [
    {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    },
    {
      name: 'Student One',
      email: 'student1@eduportal.com',
      password: 'student123',
      role: 'student',
    },
    {
      name: 'Student Two',
      email: 'student2@eduportal.com',
      password: 'student123',
      role: 'student',
    },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email.toLowerCase() });
    if (exists) {
      console.log(`Skipping existing user: ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`Created ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('\nSeed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
