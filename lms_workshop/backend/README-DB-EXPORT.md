# Database Export Utilities

This directory contains utilities to export the entire database for migration purposes. The export tools support both SQL and JSON formats.

## Prerequisites

- Node.js and npm must be installed
- Backend must be properly configured to connect to the source database
- Proper database credentials must be set up in the environment variables or `.env` file

## Configuration

The export utilities use the same database configuration as the backend application. Make sure your `.env` file or environment variables contain the correct database connection details:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=psychology_lms
```

## Usage

### Export to SQL (Default)

To export the database to SQL format:

```bash
# Navigate to the backend directory
cd lms_workshop/backend

# Run the export script
./scripts/export-db.sh
```

This will generate a SQL file with all the data in `db-export/db-seed.sql`.

### Export to JSON

To export the database to JSON format:

```bash
# Navigate to the backend directory
cd lms_workshop/backend

# Run the export script with -j flag
./scripts/export-db.sh -j
```

This will generate a collection of JSON files (one per table) in `db-export/json/`.

## Output

### SQL Export

The SQL export creates a single file that contains:

- A transaction for each table
- TRUNCATE statements to clear existing data
- INSERT statements for all rows
- Sequence reset statements to ensure IDs continue correctly

### JSON Export

The JSON export creates:

- One JSON file per table containing an array of all rows
- A `_metadata.json` file with information about the database structure
- Each file contains the raw data that can be processed for import

## Importing to a New Database

### SQL Import

To import the SQL data to a new database:

```bash
# Using psql
psql -U username -d database_name -f db-export/db-seed.sql

# Or using the PostgreSQL client
cat db-export/db-seed.sql | psql -U username -d database_name
```

### JSON Import

The JSON files can be used with a custom import script if needed. This gives you more flexibility to transform or filter data during migration.

## Troubleshooting

- **Permission denied**: Make sure the export script is executable (`chmod +x scripts/export-db.sh`)
- **Connection error**: Verify your database credentials in the `.env` file
- **Empty export**: Ensure the source database contains data
- **Compilation error**: Run `npm install` to ensure all dependencies are installed

## Disclaimer

Always make a backup of your target database before importing the seed data, as the import will delete existing data in the affected tables. 