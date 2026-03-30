const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Branch = require('./models/Branch');
const JobDescription = require('./models/JobDescription');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany();
    await Organization.deleteMany();
    await Branch.deleteMany();
    await JobDescription.deleteMany();
    
    console.log('Cleared existing data');
    
    // Create master organization
    const masterOrg = await Organization.create({
      name: 'TaskBridge Master',
      email: 'master@taskbridge.com',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: Date.now(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Create master user
    const hashedPassword = await bcrypt.hash('Master@123', 10);
    const masterUser = await User.create({
      name: 'Master Admin',
      email: 'master@taskbridge.com',
      password: hashedPassword,
      role: 'master',
      organization: masterOrg._id,
      isActive: true
    });
    
    console.log('Master user created:', masterUser.email);
    
    // Create demo organization
    const demoOrg = await Organization.create({
      name: 'Demo School',
      email: 'demo@school.com',
      phone: '+1234567890',
      subscription: {
        plan: 'trial',
        status: 'trial',
        startDate: Date.now(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Create demo branch
    const demoBranch = await Branch.create({
      name: 'Main Campus',
      organization: demoOrg._id,
      address: {
        street: '123 Education St',
        city: 'Stockholm',
        postalCode: '11122',
        country: 'Sweden'
      }
    });
    
    // Create job descriptions
    const jobDescriptions = [
      { name: 'Teacher', description: 'Classroom teacher position' },
      { name: 'Supervisor', description: 'Shift supervisor' },
      { name: 'Receptionist', description: 'Front desk reception' },
      { name: 'Substitute', description: 'Substitute teacher' }
    ];
    
    for (const jd of jobDescriptions) {
      await JobDescription.create({
        name: jd.name,
        description: jd.description,
        organization: demoOrg._id,
        branch: demoBranch._id,
        createdBy: masterUser._id
      });
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
      isActive: true
    });
    
    // Create demo employees
    const employeePassword = await bcrypt.hash('Employee@123', 10);
    const teacherJob = await JobDescription.findOne({ name: 'Teacher' });
    
    const employees = [
      { name: 'John Doe', email: 'john@school.com' },
      { name: 'Jane Smith', email: 'jane@school.com' },
      { name: 'Bob Johnson', email: 'bob@school.com' }
    ];
    
    for (const emp of employees) {
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
    }
    
    console.log('Demo data seeded successfully');
    console.log('\nLogin Credentials:');
    console.log('Master: master@taskbridge.com / Master@123');
    console.log('Admin: admin@school.com / Admin@123');
    console.log('Employee: john@school.com / Employee@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();