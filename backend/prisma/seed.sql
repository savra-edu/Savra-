-- Seed Data SQL for Savra AI Database
-- This file contains all the seed data from seed.ts converted to SQL
-- Execute this in Neon DB SQL Editor to populate your database

-- Note: Password hash for 'password123' with 12 rounds
-- All users use this password: password123
-- You may regenerate this hash if needed using: bcrypt.hash('password123', 12)

-- ============================================
-- 1. CREATE SCHOOL
-- ============================================
INSERT INTO schools (id, name, code, created_at)
VALUES (
  gen_random_uuid(),
  'Savra International School',
  'SAVRA001',
  NOW()
)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. CREATE SUBJECTS
-- ============================================
INSERT INTO subjects (id, name, code)
VALUES 
  (gen_random_uuid(), 'Maths', 'MATH'),
  (gen_random_uuid(), 'Science', 'SCI'),
  (gen_random_uuid(), 'English', 'ENG'),
  (gen_random_uuid(), 'History', 'HIST'),
  (gen_random_uuid(), 'Geography', 'GEO'),
  (gen_random_uuid(), 'Physics', 'PHY'),
  (gen_random_uuid(), 'Chemistry', 'CHEM'),
  (gen_random_uuid(), 'Biology', 'BIO')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. CREATE CHAPTERS
-- ============================================
-- Note: Chapters use subject IDs from subqueries

-- Maths Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'MATH') || '-chapter-' || generate_series(1, 11),
  (SELECT id FROM subjects WHERE code = 'MATH'),
  unnest(ARRAY[
    'Fractions & Decimals',
    'The Triangle & Its Properties',
    'Rational Numbers',
    'Data Handling',
    'Simple Equations',
    'Exponents & Powers',
    'Algebraic Expressions',
    'Linear Equations',
    'Geometry',
    'Perimeter & Area',
    'Lines & Angles'
  ]),
  generate_series(1, 11)
ON CONFLICT (id) DO NOTHING;

-- Science Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'SCI') || '-chapter-' || generate_series(1, 9),
  (SELECT id FROM subjects WHERE code = 'SCI'),
  unnest(ARRAY[
    'Nutrition in Plants',
    'Nutrition in Animals',
    'Heat',
    'Acids, Bases & Salts',
    'Physical & Chemical Changes',
    'Weather, Climate & Adaptations',
    'Respiration in Organisms',
    'Transportation in Animals & Plants',
    'Reproduction in Plants'
  ]),
  generate_series(1, 9)
ON CONFLICT (id) DO NOTHING;

-- English Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'ENG') || '-chapter-' || generate_series(1, 8),
  (SELECT id FROM subjects WHERE code = 'ENG'),
  unnest(ARRAY[
    'Grammar Basics',
    'Tenses',
    'Active & Passive Voice',
    'Direct & Indirect Speech',
    'Comprehension',
    'Essay Writing',
    'Letter Writing',
    'Creative Writing'
  ]),
  generate_series(1, 8)
ON CONFLICT (id) DO NOTHING;

-- History Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'HIST') || '-chapter-' || generate_series(1, 6),
  (SELECT id FROM subjects WHERE code = 'HIST'),
  unnest(ARRAY[
    'Ancient Civilizations',
    'Medieval Period',
    'Modern History',
    'Indian Freedom Struggle',
    'World Wars',
    'Post-Independence India'
  ]),
  generate_series(1, 6)
ON CONFLICT (id) DO NOTHING;

-- Geography Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'GEO') || '-chapter-' || generate_series(1, 6),
  (SELECT id FROM subjects WHERE code = 'GEO'),
  unnest(ARRAY[
    'Our Environment',
    'Natural Vegetation & Wildlife',
    'Water Resources',
    'Agriculture',
    'Industries',
    'Human Resources'
  ]),
  generate_series(1, 6)
ON CONFLICT (id) DO NOTHING;

-- Physics Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'PHY') || '-chapter-' || generate_series(1, 8),
  (SELECT id FROM subjects WHERE code = 'PHY'),
  unnest(ARRAY[
    'Motion',
    'Force & Laws of Motion',
    'Gravitation',
    'Work & Energy',
    'Sound',
    'Light',
    'Electricity',
    'Magnetism'
  ]),
  generate_series(1, 8)
ON CONFLICT (id) DO NOTHING;

-- Chemistry Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'CHEM') || '-chapter-' || generate_series(1, 6),
  (SELECT id FROM subjects WHERE code = 'CHEM'),
  unnest(ARRAY[
    'Matter in Our Surroundings',
    'Is Matter Around Us Pure',
    'Atoms & Molecules',
    'Structure of Atom',
    'Chemical Reactions',
    'Periodic Table'
  ]),
  generate_series(1, 6)
ON CONFLICT (id) DO NOTHING;

-- Biology Chapters
INSERT INTO chapters (id, subject_id, name, order_index)
SELECT 
  (SELECT id FROM subjects WHERE code = 'BIO') || '-chapter-' || generate_series(1, 6),
  (SELECT id FROM subjects WHERE code = 'BIO'),
  unnest(ARRAY[
    'Cell Structure',
    'Tissues',
    'Diversity in Living Organisms',
    'Life Processes',
    'Control & Coordination',
    'Heredity & Evolution'
  ]),
  generate_series(1, 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CREATE CLASSES (Grades 1-12, Sections A-E)
-- ============================================
INSERT INTO classes (id, school_id, grade, section, name, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM schools WHERE code = 'SAVRA001'),
  grade_num,
  section_letter,
  'Class ' || grade_num || ' ' || section_letter,
  NOW()
FROM 
  generate_series(1, 12) AS grade_num,
  unnest(ARRAY['A', 'B', 'C', 'D', 'E']) AS section_letter
ON CONFLICT (school_id, grade, section) DO NOTHING;

-- ============================================
-- 5. CREATE USERS (with password hash)
-- ============================================
-- Password hash for 'password123' with 12 rounds (bcrypt)
-- Generated hash: $2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu

-- Teacher User
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'teacher@savra.com',
  '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu',
  'teacher',
  'Shardul Mishra',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Student User
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'student@savra.com',
  '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu',
  'student',
  'Aarav Jain',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Admin User
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@savra.com',
  '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu',
  'admin',
  'Shauryaman Ray',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Additional Students
INSERT INTO users (id, email, password_hash, role, name, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'rahul.kumar@savra.com', '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu', 'student', 'Rahul Kumar', NOW(), NOW()),
  (gen_random_uuid(), 'priya.sharma@savra.com', '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu', 'student', 'Priya Sharma', NOW(), NOW()),
  (gen_random_uuid(), 'amit.singh@savra.com', '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu', 'student', 'Amit Singh', NOW(), NOW()),
  (gen_random_uuid(), 'neha.gupta@savra.com', '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu', 'student', 'Neha Gupta', NOW(), NOW()),
  (gen_random_uuid(), 'vikram.patel@savra.com', '$2a$12$nTw.BRA3uxHXDSC4cS8dZOpCUtqCIo3L9eO3I2Z013f1zx41WsyZu', 'student', 'Vikram Patel', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 6. CREATE TEACHER PROFILE
-- ============================================
INSERT INTO teachers (id, user_id, school_id, location, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'teacher@savra.com'),
  (SELECT id FROM schools WHERE code = 'SAVRA001'),
  'Delhi, India',
  NOW()
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 7. CREATE STUDENT PROFILES
-- ============================================
INSERT INTO students (id, user_id, class_id, roll_number, total_points, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'student@savra.com'),
  (SELECT id FROM classes WHERE grade = 10 AND section = 'A' AND school_id = (SELECT id FROM schools WHERE code = 'SAVRA001') LIMIT 1),
  '10A-001',
  750,
  NOW()
ON CONFLICT (user_id) DO NOTHING;

-- Additional Students
INSERT INTO students (id, user_id, class_id, roll_number, total_points, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = email_val),
  (SELECT id FROM classes WHERE grade = 10 AND section = 'A' AND school_id = (SELECT id FROM schools WHERE code = 'SAVRA001') LIMIT 1),
  roll_val,
  points_val,
  NOW()
FROM (VALUES 
  ('rahul.kumar@savra.com', '10A-002', 850),
  ('priya.sharma@savra.com', '10A-003', 820),
  ('amit.singh@savra.com', '10A-004', 790),
  ('neha.gupta@savra.com', '10A-005', 720),
  ('vikram.patel@savra.com', '10A-006', 680)
) AS t(email_val, roll_val, points_val)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 8. CREATE ADMIN PROFILE
-- ============================================
INSERT INTO admins (id, user_id, school_id, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'admin@savra.com'),
  (SELECT id FROM schools WHERE code = 'SAVRA001'),
  NOW()
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 9. CREATE TEACHER-SUBJECT RELATIONSHIPS
-- ============================================
INSERT INTO teacher_subjects (teacher_id, subject_id)
SELECT 
  (SELECT t.id FROM teachers t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'teacher@savra.com'),
  (SELECT id FROM subjects WHERE code = subject_code)
FROM unnest(ARRAY['MATH', 'PHY']) AS subject_code
ON CONFLICT (teacher_id, subject_id) DO NOTHING;

-- ============================================
-- 10. CREATE TEACHER-CLASS RELATIONSHIP
-- ============================================
INSERT INTO teacher_classes (teacher_id, class_id)
SELECT 
  (SELECT t.id FROM teachers t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'teacher@savra.com'),
  (SELECT id FROM classes WHERE grade = 10 AND section = 'A' AND school_id = (SELECT id FROM schools WHERE code = 'SAVRA001') LIMIT 1)
ON CONFLICT (teacher_id, class_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES (Optional - run after seeding)
-- ============================================
-- SELECT 'School' as table_name, count(*) as count FROM schools
-- UNION ALL
-- SELECT 'Subjects', count(*) FROM subjects
-- UNION ALL
-- SELECT 'Chapters', count(*) FROM chapters
-- UNION ALL
-- SELECT 'Classes', count(*) FROM classes
-- UNION ALL
-- SELECT 'Users', count(*) FROM users
-- UNION ALL
-- SELECT 'Teachers', count(*) FROM teachers
-- UNION ALL
-- SELECT 'Students', count(*) FROM students
-- UNION ALL
-- SELECT 'Admins', count(*) FROM admins;
