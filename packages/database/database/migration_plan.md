# Data Migration Plan

## Objective

Migrate data from the legacy SQLite database to the new PostgreSQL database while ensuring data integrity and minimal downtime.

## Steps

### 1. Data Export from SQLite

- Use the `sqlite3` CLI tool to export data from the legacy database.
- Export each table to a CSV file:
  ```bash
  sqlite3 dev.db ".headers on" ".mode csv" "SELECT * FROM users;" > users.csv
  sqlite3 dev.db ".headers on" ".mode csv" "SELECT * FROM tickets;" > tickets.csv
  sqlite3 dev.db ".headers on" ".mode csv" "SELECT * FROM audit_logs;" > audit_logs.csv
  ```

### 2. Data Transformation

- Use a Python script to clean and transform the data as needed.
- Ensure data types match the PostgreSQL schema.
- Example transformations:
  - Hash passwords for the `users` table.
  - Map legacy ticket statuses to new status values.

### 3. Data Import to PostgreSQL

- Use the `COPY` command to bulk load data into PostgreSQL tables:
  ```sql
  COPY users(username, passwordHash, role, created_at) FROM '/path/to/users.csv' DELIMITER ',' CSV HEADER;
  COPY tickets(title, description, status, priority, created_by, created_at) FROM '/path/to/tickets.csv' DELIMITER ',' CSV HEADER;
  COPY audit_logs(action, user_id, ticket_id, timestamp) FROM '/path/to/audit_logs.csv' DELIMITER ',' CSV HEADER;
  ```

### 4. Data Validation

- Run SQL queries to validate data integrity:
  - Check row counts match between SQLite and PostgreSQL.
  - Verify foreign key relationships.
  - Spot-check data for accuracy.

### 5. Rollback Plan

- In case of issues, truncate PostgreSQL tables and re-import data.
- Keep backups of the original SQLite database and CSV files.

### 6. Finalization

- Update application configuration to point to the PostgreSQL database.
- Test the application to ensure functionality with the new database.

## Timeline

- **Day 1**: Export and transform data.
- **Day 2**: Import data and validate.
- **Day 3**: Finalize migration and test.

## Risks & Mitigations

- **Risk**: Data corruption during migration.
  - **Mitigation**: Use checksums to verify data integrity.
- **Risk**: Downtime during migration.
  - **Mitigation**: Perform migration during off-peak hours.
- **Risk**: Missing data.
  - **Mitigation**: Perform thorough validation and keep backups.

## Approval

- **Reviewers**: Database Administrator, Tech Lead.
- **Sign-off**: CTO or project sponsor.
