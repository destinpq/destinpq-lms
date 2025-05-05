const { exec } = require('child_process');

console.log('Starting database seed process...');

exec('npx ts-node src/seed.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing seed script: ${error}`);
    return;
  }
  
  console.log('Seed script output:');
  console.log(stdout);
  
  if (stderr) {
    console.error('Seed script errors:');
    console.error(stderr);
  }
  
  console.log('Seed process completed.');
}); 