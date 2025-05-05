import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { typeOrmConfig } from '../config/typeorm.config';

/**
 * Database JSON Export Utility
 * 
 * This script connects to the database and exports all data as JSON files
 * for easier migration, analysis, or backup purposes.
 */
async function exportDatabaseToJson() {
  console.log('📦 Starting database JSON export...');
  
  try {
    // Create a new DataSource with explicit configuration
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'tiger',
      database: process.env.DB_DATABASE || 'psychology_lms',
      entities: [],
      synchronize: false,
      ssl: process.env.DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    });
    
    // Initialize the connection
    const connection = await dataSource.initialize();
    
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
    const outputDir = path.join(__dirname, '../../../db-export/json');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create a metadata file with database info
    const metadata = {
      exportDate: new Date().toISOString(),
      databaseName: process.env.DB_DATABASE || 'psychology_lms', // Get from env instead of typeOrmConfig
      tableCount: tableNames.length,
      tables: {}
    };
    
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
          metadata.tables[tableName] = { rowCount: 0 };
          continue;
        }
        
        // Get table schema information
        const columns = await connection.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
        `);
        
        // Save to JSON file
        const tableFile = path.join(outputDir, `${tableName}.json`);
        fs.writeFileSync(tableFile, JSON.stringify(rows, null, 2));
        
        // Update metadata
        metadata.tables[tableName] = {
          rowCount: rows.length,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }))
        };
        
        console.log(`✅ Exported ${rows.length} rows from ${tableName}`);
      } catch (error) {
        console.error(`❌ Error exporting table ${tableName}:`, error);
        metadata.tables[tableName] = { error: error.message };
      }
    }
    
    // Save metadata
    const metadataFile = path.join(outputDir, '_metadata.json');
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    console.log(`🎉 Database JSON export completed! Files saved to: ${outputDir}`);
    
    // Close the database connection
    await connection.destroy();
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Run the export
exportDatabaseToJson().catch(err => {
  console.error('Failed to export database to JSON:', err);
  process.exit(1);
}); 