require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  await connectDB();

  const users = [
    {
      name: 'Admin User',
      email: 'admin@eduportal.com',
      password: 'admin123',
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
    const exists = await User.findOne({ email: u.email });
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
