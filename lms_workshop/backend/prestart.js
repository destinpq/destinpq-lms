// Diagnostic pre-start script
console.log('\n🔍 DIAGNOSTICS: Running pre-start checks...');
console.log(`💻 Node.js version: ${process.version}`);
console.log(`📁 Current directory: ${process.cwd()}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV}`);

// Check if files exist
const fs = require('fs');
console.log('\n📋 Checking critical files:');
['package.json', 'dist/main.js', '.env'].forEach(file => {
  console.log(`   ${file}: ${fs.existsSync(file) ? '✅ EXISTS' : '❌ MISSING'}`);
});

// Check environment variables
console.log('\n🔐 Environment variables:');
['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'NODE_ENV'].forEach(envVar => {
  console.log(`   ${envVar}: ${process.env[envVar] ? '✅ SET' : '❌ MISSING'}`);
});

// Check network
console.log('\n🌐 Network interfaces:');
const os = require('os');
const interfaces = os.networkInterfaces();
Object.keys(interfaces).forEach(iface => {
  console.log(`   Interface: ${iface}`);
  interfaces[iface].forEach(details => {
    console.log(`     ${details.family} ${details.address} ${details.internal ? '(internal)' : '(external)'}`);
  });
});

// Test database connection
console.log('\n🗄️ Testing database connection...');
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000
});

client.connect()
  .then(() => {
    console.log('   ✅ Database connection successful!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log(`   📅 Database time: ${res.rows[0].now}`);
    console.log('\n📢 PRE-START DIAGNOSTICS COMPLETE (SUCCESS)\n');
    return client.end();
  })
  .catch(err => {
    console.error('   ❌ Database connection failed:', err.message);
    console.error('\n📢 PRE-START DIAGNOSTICS FAILED! EXITING.\n');
    process.exit(1);
  }); 