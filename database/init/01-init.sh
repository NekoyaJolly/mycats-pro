#!/bin/bash
set -e

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_cats_owner_id ON cats(owner_id);
    CREATE INDEX IF NOT EXISTS idx_cats_registration_id ON cats(registration_id);
    CREATE INDEX IF NOT EXISTS idx_breeding_records_male_id ON breeding_records(male_id);
    CREATE INDEX IF NOT EXISTS idx_breeding_records_female_id ON breeding_records(female_id);
    CREATE INDEX IF NOT EXISTS idx_care_records_cat_id ON care_records(cat_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_assigned_to ON schedules(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_schedules_cat_id ON schedules(cat_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_schedule_date ON schedules(schedule_date);
EOSQL

echo "Database initialization completed."
