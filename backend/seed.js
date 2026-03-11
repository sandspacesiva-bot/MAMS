require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./config/db');

const User  = require('./models/User');
const Base  = require('./models/Base');
const Asset = require('./models/Asset');

(async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Base.deleteMany({}),
    Asset.deleteMany({})
  ]);

  // Bases
  const [alpha, bravo] = await Base.insertMany([
    { name: 'Alpha Base', location: 'Northern Sector' },
    { name: 'Bravo Base', location: 'Southern Sector' }
  ]);

  // Assets
  await Asset.insertMany([
    { name: 'M4 Carbine',       type: 'weapon',      unit: 'unit',   description: 'Standard assault rifle' },
    { name: '5.56mm Ammo',      type: 'ammunition',  unit: 'rounds', description: 'Standard NATO ammunition' },
    { name: 'Humvee',           type: 'vehicle',     unit: 'unit',   description: 'High Mobility Multipurpose Vehicle' },
    { name: 'Night Vision NVG', type: 'equipment',   unit: 'unit',   description: 'Night vision goggles' },
    { name: 'M9 Pistol',        type: 'weapon',      unit: 'unit',   description: 'Service pistol' },
    { name: '9mm Ammo',         type: 'ammunition',  unit: 'rounds', description: '9mm pistol rounds' },
    { name: 'MRAP Vehicle',     type: 'vehicle',     unit: 'unit',   description: 'Mine Resistant Ambush Protected' },
    { name: 'Body Armor',       type: 'equipment',   unit: 'unit',   description: 'Level IV plate carrier' },
  ]);

  // Users (passwordHash will be auto-hashed by pre-save hook)
  await User.create([
    { name: 'Admin User',        email: 'admin@mams.mil',       passwordHash: 'admin123',     role: 'admin' },
    { name: 'Commander Alpha',   email: 'alpha@mams.mil',       passwordHash: 'alpha123',     role: 'base_commander',    assignedBase: alpha._id },
    { name: 'Commander Bravo',   email: 'bravo@mams.mil',       passwordHash: 'bravo123',     role: 'base_commander',    assignedBase: bravo._id },
    { name: 'Logistics Officer', email: 'logistics@mams.mil',   passwordHash: 'logistics123', role: 'logistics_officer', assignedBase: alpha._id },
  ]);

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  admin@mams.mil       / admin123');
  console.log('  alpha@mams.mil       / alpha123');
  console.log('  bravo@mams.mil       / bravo123');
  console.log('  logistics@mams.mil   / logistics123');
  process.exit(0);
})();
