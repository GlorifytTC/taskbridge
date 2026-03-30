const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Organization = require('./models/Organization');
const Branch = require('./models/Branch');
const JobDescription = require('./models/JobDescription');

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    // Connect without deprecated options
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if models are loaded
    console.log('📦 Models loaded:', {
      User: !!User,
      Organization: !!Organization,
      Branch: !!Branch,
      JobDescription: !!JobDescription
    });
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    
    if (User && User.deleteMany) {
      await User.deleteMany({});
      console.log('✓ Users cleared');
    } else {
      console.error('❌ User model or deleteMany method not available');
    }
    
    if (Organization && Organization.deleteMany) {
      await Organization.deleteMany({});
      console.log('✓ Organizations cleared');
    }
    
    if (Branch && Branch.deleteMany) {
      await Branch.deleteMany({});
      console.log('✓ Branches cleared');
    }
    
    if (JobDescription && JobDescription.deleteMany) {
      await JobDescription.deleteMany({});
      console.log('✓ Job descriptions cleared');
    }
    
    console.log('\n📝 Creating seed data...');
    
    // Create master organization
    const masterOrg = await Organization.create({
      name: 'TaskBridge Master',
      email: 'master@taskbridge.com',
      isActive: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✓ Master organization created');
    
    // Create master user
    const hashedMasterPassword = await bcrypt.hash('Master@123', 10);
    const masterUser = await User.create({
      name: 'Master Admin',
      email: 'master@taskbridge.com',
      password: hashedMasterPassword,
      role: 'master',
      organization: masterOrg._id,
      isActive: true,
      permissions: ['all']
    });
    console.log('✓ Master user created:', masterUser.email);
    
    // Create demo organization
    const demoOrg = await Organization.create({
      name: 'Demo School',
      email: 'demo@school.com',
      phone: '+1234567890',
      isActive: true,
      subscription: {
        plan: 'trial',
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✓ Demo organization created');
    
    // Create demo branch
    const demoBranch = await Branch.create({
      name: 'Main Campus',
      organization: demoOrg._id,
      isActive: true,
      address: {
        street: '123 Education St',
        city: 'Stockholm',
        postalCode: '11122',
        country: 'Sweden'
      }
    });
    console.log('✓ Demo branch created');
    
    // Create job descriptions
    const jobDescriptionsData = [
      { name: 'Teacher', description: 'Classroom teacher position' },
      { name: 'Supervisor', description: 'Shift supervisor' },
      { name: 'Receptionist', description: 'Front desk reception' },
      { name: 'Substitute', description: 'Substitute teacher' }
    ];
    
    const jobDescriptions = [];
    for (const jd of jobDescriptionsData) {
      const created = await JobDescription.create({
        name: jd.name,
        description: jd.description,
        organization: demoOrg._id,
        branch: demoBranch._id,
        createdBy: masterUser._id,
        isActive: true
      });
      jobDescriptions.push(created);
      console.log(`✓ Job description created: ${jd.name}`);
    }
    
    // Create demo admin
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const demoAdmin = await User.create({
      name: 'Demo Admin',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'admin',
      organization: demoOrg._id,
      branch: demoBranch._id,
      createdBy: masterUser._id,
      isActive: true,
      permissions: ['manage_employees', 'manage_tasks', 'view_reports']
    });
    console.log('✓ Demo admin created:', demoAdmin.email);
    
    // Create demo employees
    const employeePassword = await bcrypt.hash('Employee@123', 10);
    const teacherJob = jobDescriptions.find(jd => jd.name === 'Teacher');
    
    const employeesData = [
      { name: 'John Doe', email: 'john@school.com' },
      { name: 'Jane Smith', email: 'jane@school.com' },
      { name: 'Bob Johnson', email: 'bob@school.com' },
      { name: 'Alice Brown', email: 'alice@school.com' },
      { name: 'Charlie Wilson', email: 'charlie@school.com' }
    ];
    
    for (const emp of employeesData) {
      await User.create({
        name: emp.name,
        email: emp.email,
        password: employeePassword,
        role: 'employee',
        organization: demoOrg._id,
        branch: demoBranch._id,
        jobDescription: teacherJob._id,
        createdBy: demoAdmin._id,
        isActive: true
      });
      console.log(`✓ Employee created: ${emp.email}`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Master:   master@taskbridge.com / Master@123');
    console.log('👔 Admin:    admin@school.com / Admin@123');
    console.log('👥 Employee: john@school.com / Employee@123');
    console.log('👥 Employee: jane@school.com / Employee@123');
    console.log('👥 Employee: bob@school.com / Employee@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack trace:', error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed
seedDatabase();