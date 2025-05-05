import { createConnection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { typeOrmConfig } from '../config/typeorm.config';

/**
 * Database Export Utility
 * 
 * This script connects to the database and exports all data as SQL insert statements
 * to enable easy migration to a new database instance.
 */
async function exportDatabase() {
  console.log('📦 Starting database export...');
  
  try {
    // Connect to the database
    const connection = await createConnection({
      ...typeOrmConfig,
      synchronize: false, // Ensure we don't modify the schema
    });
    
    console.log('🔌 Connected to database successfully');
    
    // Get the list of all tables in the database
    const tableNames = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tableNames.length} tables to export`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../../db-export');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create the main seed file
    const seedFilePath = path.join(outputDir, 'db-seed.sql');
    fs.writeFileSync(seedFilePath, `-- Psychology LMS Database Seed\n-- Generated on ${new Date().toISOString()}\n\n`);
    
    // Handle sequence reset information
    let sequenceResets = '';
    
    // Export each table
    for (const tableInfo of tableNames) {
      const tableName = tableInfo.table_name;
      console.log(`📤 Exporting table: ${tableName}`);
      
      // Skip TypeORM migration tables
      if (tableName.includes('migration')) {
        console.log(`⏭️  Skipping migration table: ${tableName}`);
        continue;
      }
      
      try {
        // Get all rows from the table
        const rows = await connection.query(`SELECT * FROM "${tableName}"`);
        
        if (rows.length === 0) {
          console.log(`⚠️  Table ${tableName} is empty, skipping`);
          continue;
        }
        
        // Begin transaction for this table
        let tableData = `\n-- Table: ${tableName}\nBEGIN;\n`;
        
        // Add TRUNCATE statement to clear existing data
        tableData += `TRUNCATE TABLE "${tableName}" CASCADE;\n`;
        
        // For each row, create an INSERT statement
        for (const row of rows) {
          const columns = Object.keys(row).filter(col => row[col] !== null);
          const values = columns.map(col => {
            const value = row[col];
            
            // Format the value based on its type
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          });
          
          tableData += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        // If the table has an ID sequence, add it to our sequence resets
        const hasIdColumn = await connection.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND column_name = 'id' 
          AND table_schema = 'public'
        `);
        
        if (hasIdColumn.length > 0) {
          sequenceResets += `SELECT setval('"${tableName}_id_seq"', (SELECT MAX(id) FROM "${tableName}"));\n`;
        }
        
        // End transaction
        tableData += 'COMMIT;\n';
        
        // Append this table's data to the seed file
        fs.appendFileSync(seedFilePath, tableData);
        
        console.log(`✅ Exported ${rows.length} rows from ${tableName}`);
      } catch (error) {
        console.error(`❌ Error exporting table ${tableName}:`, error);
      }
    }
    
    // Add sequence resets at the end
    if (sequenceResets) {
      fs.appendFileSync(seedFilePath, '\n-- Reset Sequences\nBEGIN;\n');
      fs.appendFileSync(seedFilePath, sequenceResets);
      fs.appendFileSync(seedFilePath, 'COMMIT;\n');
    }
    
    console.log(`🎉 Database export completed! Seed file saved to: ${seedFilePath}`);
    
    // Close the database connection
    await connection.close();
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Run the export
exportDatabase().catch(err => {
  console.error('Failed to export database:', err);
  process.exit(1);
}); 