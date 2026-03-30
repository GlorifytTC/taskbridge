const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testModels = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');
    
    // Import models
    console.log('📦 Loading models...');
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    const Branch = require('./models/Branch');
    const JobDescription = require('./models/JobDescription');
    
    console.log('\n✅ Models loaded:');
    console.log('- User:', typeof User);
    console.log('- Organization:', typeof Organization);
    console.log('- Branch:', typeof Branch);
    console.log('- JobDescription:', typeof JobDescription);
    console.log('');
    
    // Check if deleteMany exists
    console.log('📋 Methods available:');
    console.log('- User.deleteMany:', typeof User.deleteMany);
    console.log('- Organization.deleteMany:', typeof Organization.deleteMany);
    console.log('- Branch.deleteMany:', typeof Branch.deleteMany);
    console.log('- JobDescription.deleteMany:', typeof JobDescription.deleteMany);
    
    // Try to count documents
    console.log('\n📊 Document counts:');
    const userCount = await User.countDocuments();
    const orgCount = await Organization.countDocuments();
    const branchCount = await Branch.countDocuments();
    const jdCount = await JobDescription.countDocuments();
    
    console.log('- Users:', userCount);
    console.log('- Organizations:', orgCount);
    console.log('- Branches:', branchCount);
    console.log('- Job Descriptions:', jdCount);
    
    await mongoose.connection.close();
    console.log('\n✅ Test complete! Database connection closed.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the test
testModels();