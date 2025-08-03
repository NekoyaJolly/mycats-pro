-- Sample data for Cat Management System
-- Insert test users
INSERT INTO "users" ("id", "clerkId", "email", "firstName", "lastName", "role", "createdAt", "updatedAt")
VALUES 
  ('user-1', 'clerk_test_admin', 'admin@catmanagement.com', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user-2', 'clerk_test_user', 'user@catmanagement.com', 'Regular', 'User', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("clerkId") DO NOTHING;

-- Insert sample cats
INSERT INTO "cats" ("id", "registrationId", "name", "breed", "color", "pattern", "gender", "birthDate", "weight", "ownerId", "createdAt", "updatedAt")
VALUES 
  ('cat-1', 'REG001', 'Luna', 'Persian', 'White', 'Solid', 'FEMALE', '2020-03-15', 4.2, 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-2', 'REG002', 'Shadow', 'Maine Coon', 'Black', 'Solid', 'MALE', '2019-08-22', 6.8, 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-3', 'REG003', 'Bella', 'British Shorthair', 'Gray', 'Solid', 'FEMALE', '2021-01-10', 3.9, 'user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-4', 'REG004', 'Max', 'Scottish Fold', 'Orange', 'Tabby', 'MALE', '2020-11-05', 4.5, 'user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("registrationId") DO NOTHING;

-- Insert sample tags
INSERT INTO "tags" ("id", "name", "color", "description", "createdAt", "updatedAt")
VALUES 
  ('tag-1', 'Breeding Program', '#10B981', 'Cats in active breeding program', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tag-2', 'Show Quality', '#F59E0B', 'Cats suitable for cat shows', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tag-3', 'Medical Attention', '#EF4444', 'Cats requiring special medical care', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tag-4', 'Retired', '#6B7280', 'Retired breeding cats', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Insert sample breeding records
INSERT INTO "breeding_records" ("id", "maleId", "femaleId", "breedingDate", "expectedDueDate", "status", "recordedBy", "createdAt", "updatedAt")
VALUES 
  ('breeding-1', 'cat-2', 'cat-1', '2023-06-15', '2023-08-20', 'COMPLETED', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('breeding-2', 'cat-4', 'cat-3', '2024-01-10', '2024-03-15', 'PLANNED', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample care records
INSERT INTO "care_records" ("id", "catId", "careType", "description", "careDate", "nextDueDate", "cost", "veterinarian", "recordedBy", "createdAt", "updatedAt")
VALUES 
  ('care-1', 'cat-1', 'VACCINATION', 'Annual vaccination - FVRCP', '2024-01-15', '2025-01-15', 85.00, 'Dr. Smith', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('care-2', 'cat-2', 'HEALTH_CHECK', 'Routine health examination', '2024-02-20', '2024-08-20', 120.00, 'Dr. Johnson', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('care-3', 'cat-3', 'GROOMING', 'Professional grooming session', '2024-03-10', '2024-06-10', 60.00, NULL, 'user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample schedules
INSERT INTO "schedules" ("id", "title", "description", "scheduleDate", "scheduleType", "priority", "catId", "assignedTo", "createdAt", "updatedAt")
VALUES 
  ('schedule-1', 'Luna Vaccination Due', 'Annual vaccination for Luna', '2025-01-15', 'CARE', 'HIGH', 'cat-1', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('schedule-2', 'Breeding Evaluation', 'Evaluate Max for breeding program', '2025-02-01', 'BREEDING', 'MEDIUM', 'cat-4', 'user-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('schedule-3', 'Grooming Appointment', 'Regular grooming for Bella', '2025-02-10', 'CARE', 'LOW', 'cat-3', 'user-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Link some cats with tags
INSERT INTO "cat_tags" ("catId", "tagId", "createdAt")
VALUES 
  ('cat-1', 'tag-1', CURRENT_TIMESTAMP), -- Luna in breeding program
  ('cat-1', 'tag-2', CURRENT_TIMESTAMP), -- Luna is show quality
  ('cat-2', 'tag-1', CURRENT_TIMESTAMP), -- Shadow in breeding program
  ('cat-3', 'tag-2', CURRENT_TIMESTAMP), -- Bella is show quality
  ('cat-4', 'tag-1', CURRENT_TIMESTAMP)  -- Max in breeding program
ON CONFLICT ("catId", "tagId") DO NOTHING;
