# Psychology LMS Database Dump

This directory contains a dump of the Psychology LMS PostgreSQL database.

## Database Contents

The database currently contains:

1. `user` table with 3 users:
   - Test User (test@example.com)
   - Admin User (admin@example.com)
   - Pratik Khanapurkar (khanapurkarpratik@gmail.com)

2. Related sequences and constraints

## How to Restore the Database

### Prerequisites

- PostgreSQL 17.4 or compatible version
- Database connection details (from backend/.env)

### Restoration Steps

1. Create a new database (if it doesn't exist):

```bash
createdb -h localhost -U postgres psychology_lms
```

2. Restore the database using the SQL dump:

```bash
psql -h localhost -U postgres -d psychology_lms -f dump.sql
```

3. Verify the restoration by checking user records:

```bash
psql -h localhost -U postgres -d psychology_lms -c "SELECT * FROM \"user\";"
```

## Database Connection Details (from .env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tiger
DB_DATABASE=psychology_lms
```

## Database Structure

### User Table

```
                                        Table "public.user"
  Column   |            Type             | Collation | Nullable |             Default              
-----------+-----------------------------+-----------+----------+----------------------------------
 id        | integer                     |           | not null | nextval('user_id_seq'::regclass)
 firstName | character varying           |           | not null | 
 lastName  | character varying           |           | not null | 
 email     | character varying           |           | not null | 
 password  | character varying           |           | not null | 
 isAdmin   | boolean                     |           | not null | false
 createdAt | timestamp without time zone |           | not null | now()
 updatedAt | timestamp without time zone |           | not null | now()
``` 