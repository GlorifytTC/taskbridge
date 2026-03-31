const bcrypt = require('bcryptjs');

async function generateHash(password, email) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('---');
  return hash;
}

async function main() {
  console.log('Generating bcrypt hashes...\n');
  
  const masterHash = await generateHash('Gladiatorman40', 'georgeglor@hotmail.com');
  const adminHash = await generateHash('Admin@123', 'admin@school.com');
  const employeeHash = await generateHash('Employee@123', 'john@school.com');
  
  console.log('\n📋 COPY THESE HASHES TO UPDATE YOUR DATABASE:');
  console.log('================================================');
  console.log(`Master: ${masterHash}`);
  console.log(`Admin: ${adminHash}`);
  console.log(`Employee: ${employeeHash}`);
  console.log('================================================');
}

main();