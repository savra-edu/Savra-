-- Seed Data for Analytics - Dummy Data for Analytics Tab
-- This file creates quizzes, questions, quiz attempts, and student answers
-- Run this AFTER the main seed.sql file has been executed
-- All data is linked to existing users, classes, and subjects from seed.sql

-- ============================================
-- 1. CREATE QUIZZES (Published status)
-- ============================================
-- Create 3 published quizzes for analytics

INSERT INTO quizzes (
  id, 
  teacher_id, 
  class_id, 
  subject_id, 
  title, 
  objective, 
  time_limit, 
  difficulty_level, 
  total_questions, 
  total_marks, 
  status, 
  due_date, 
  is_optional, 
  created_at, 
  updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT t.id FROM teachers t INNER JOIN users u ON t.user_id = u.id WHERE u.email = 'teacher@savra.com'),
  (SELECT id FROM classes WHERE grade = 10 AND section = 'A' AND school_id = (SELECT id FROM schools WHERE code = 'SAVRA001') LIMIT 1),
  (SELECT id FROM subjects WHERE code = 'MATH'),
  quiz_title,
  quiz_objective,
  time_limit_val,
  difficulty_val::"DifficultyLevel",
  total_questions_val,
  total_marks_val,
  'published'::"QuizStatus",
  NOW() + INTERVAL '7 days',
  false,
  NOW() - (days_ago || ' days')::INTERVAL,
  NOW() - (days_ago || ' days')::INTERVAL
FROM (VALUES 
  ('Fractions & Decimals Quiz', 'Test understanding of fractions and decimal operations', 15, 'medium', 10, 10, 3),
  ('Algebra Basics Quiz', 'Assess knowledge of basic algebraic expressions and equations', 20, 'medium', 10, 10, 2),
  ('Geometry Fundamentals Quiz', 'Evaluate understanding of basic geometric concepts', 18, 'easy', 10, 10, 1)
) AS t(quiz_title, quiz_objective, time_limit_val, difficulty_val, total_questions_val, total_marks_val, days_ago)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. CREATE QUIZ-CHAPTER RELATIONSHIPS
-- ============================================
-- Link quizzes to their respective chapters

INSERT INTO quiz_chapters (quiz_id, chapter_id)
SELECT 
  q.id,
  (SELECT id FROM chapters WHERE subject_id = (SELECT id FROM subjects WHERE code = 'MATH') AND order_index = 1 LIMIT 1)
FROM quizzes q
WHERE q.title = 'Fractions & Decimals Quiz'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_chapters (quiz_id, chapter_id)
SELECT 
  q.id,
  (SELECT id FROM chapters WHERE subject_id = (SELECT id FROM subjects WHERE code = 'MATH') AND order_index = 5 LIMIT 1)
FROM quizzes q
WHERE q.title = 'Algebra Basics Quiz'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_chapters (quiz_id, chapter_id)
SELECT 
  q.id,
  (SELECT id FROM chapters WHERE subject_id = (SELECT id FROM subjects WHERE code = 'MATH') AND order_index = 9 LIMIT 1)
FROM quizzes q
WHERE q.title = 'Geometry Fundamentals Quiz'
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. CREATE QUESTIONS FOR QUIZZES
-- ============================================
-- Create 10 MCQ questions for each quiz with options

-- Questions for Fractions & Decimals Quiz
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, order_index, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Fractions & Decimals Quiz' LIMIT 1),
  question_text_val,
  'mcq'::"QuestionType",
  1,
  order_idx,
  NOW()
FROM (VALUES 
  (1, 'What is 1/2 + 1/4?'),
  (2, 'Convert 0.75 to a fraction'),
  (3, 'What is 3/4 × 2/3?'),
  (4, 'Which is greater: 0.5 or 3/5?'),
  (5, 'What is 1 - 1/3?'),
  (6, 'Convert 5/8 to a decimal'),
  (7, 'What is 2/5 + 3/10?'),
  (8, 'Which decimal is equivalent to 1/4?'),
  (9, 'What is 4/9 ÷ 2/3?'),
  (10, 'Arrange in ascending order: 0.3, 1/3, 0.33')
) AS t(order_idx, question_text_val)
ON CONFLICT DO NOTHING;

-- Questions for Algebra Basics Quiz
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, order_index, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Algebra Basics Quiz' LIMIT 1),
  question_text_val,
  'mcq'::"QuestionType",
  1,
  order_idx,
  NOW()
FROM (VALUES 
  (1, 'What is the value of x if 2x + 5 = 11?'),
  (2, 'Simplify: 3a + 2b + 4a - b'),
  (3, 'What is the coefficient of y in 5y + 3?'),
  (4, 'Solve for x: x/3 = 4'),
  (5, 'What is 2(x + 3) expanded?'),
  (6, 'If x = 3, what is the value of 2x² + 1?'),
  (7, 'What is the value of x in 3x - 7 = 2?'),
  (8, 'Simplify: (x + 2)(x - 2)'),
  (9, 'What is the constant term in 3x² + 2x - 5?'),
  (10, 'If 4x = 20, what is x?')
) AS t(order_idx, question_text_val)
ON CONFLICT DO NOTHING;

-- Questions for Geometry Fundamentals Quiz
INSERT INTO questions (id, quiz_id, question_text, question_type, marks, order_index, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Geometry Fundamentals Quiz' LIMIT 1),
  question_text_val,
  'mcq'::"QuestionType",
  1,
  order_idx,
  NOW()
FROM (VALUES 
  (1, 'How many sides does a triangle have?'),
  (2, 'What is the sum of angles in a triangle?'),
  (3, 'What is the area of a rectangle with length 5cm and width 3cm?'),
  (4, 'How many degrees are in a right angle?'),
  (5, 'What is the perimeter of a square with side 4cm?'),
  (6, 'Which shape has 4 equal sides?'),
  (7, 'What is the area of a circle with radius 7cm? (Use π = 22/7)'),
  (8, 'How many vertices does a cube have?'),
  (9, 'What type of triangle has all sides equal?'),
  (10, 'What is the formula for the area of a triangle?')
) AS t(order_idx, question_text_val)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. CREATE QUESTION OPTIONS (4 options per MCQ)
-- ============================================
-- Create options for each question, marking one as correct

-- Options for Fractions & Decimals Quiz Questions
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
SELECT 
  gen_random_uuid(),
  q.id,
  option_label_val,
  option_text_val,
  is_correct_val
FROM questions q
INNER JOIN quizzes qz ON q.quiz_id = qz.id
CROSS JOIN LATERAL (
  SELECT * FROM (VALUES
    -- Question 1: What is 1/2 + 1/4?
    ('A', '3/4', true),
    ('B', '2/6', false),
    ('C', '1/6', false),
    ('D', '2/4', false)
  ) AS opts1(opt_l, opt_t, is_c) WHERE q.order_index = 1
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 2: Convert 0.75 to a fraction
    ('A', '3/5', false),
    ('B', '3/4', true),
    ('C', '7/10', false),
    ('D', '75/100', false)
  ) AS opts2(opt_l, opt_t, is_c) WHERE q.order_index = 2
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 3: What is 3/4 × 2/3?
    ('A', '5/7', false),
    ('B', '1/2', true),
    ('C', '6/12', false),
    ('D', '2/4', false)
  ) AS opts3(opt_l, opt_t, is_c) WHERE q.order_index = 3
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 4: Which is greater: 0.5 or 3/5?
    ('A', '0.5', false),
    ('B', '3/5', true),
    ('C', 'They are equal', false),
    ('D', 'Cannot determine', false)
  ) AS opts4(opt_l, opt_t, is_c) WHERE q.order_index = 4
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 5: What is 1 - 1/3?
    ('A', '0', false),
    ('B', '1/3', false),
    ('C', '2/3', true),
    ('D', '3/3', false)
  ) AS opts5(opt_l, opt_t, is_c) WHERE q.order_index = 5
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 6: Convert 5/8 to a decimal
    ('A', '0.625', true),
    ('B', '0.58', false),
    ('C', '0.8', false),
    ('D', '0.5', false)
  ) AS opts6(opt_l, opt_t, is_c) WHERE q.order_index = 6
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 7: What is 2/5 + 3/10?
    ('A', '5/15', false),
    ('B', '7/10', true),
    ('C', '5/10', false),
    ('D', '6/10', false)
  ) AS opts7(opt_l, opt_t, is_c) WHERE q.order_index = 7
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 8: Which decimal is equivalent to 1/4?
    ('A', '0.25', true),
    ('B', '0.4', false),
    ('C', '0.5', false),
    ('D', '0.14', false)
  ) AS opts8(opt_l, opt_t, is_c) WHERE q.order_index = 8
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 9: What is 4/9 ÷ 2/3?
    ('A', '2/3', true),
    ('B', '8/27', false),
    ('C', '6/9', false),
    ('D', '4/6', false)
  ) AS opts9(opt_l, opt_t, is_c) WHERE q.order_index = 9
  UNION ALL
  SELECT * FROM (VALUES
    -- Question 10: Arrange in ascending order: 0.3, 1/3, 0.33
    ('A', '0.3, 0.33, 1/3', true),
    ('B', '1/3, 0.3, 0.33', false),
    ('C', '0.33, 0.3, 1/3', false),
    ('D', '0.3, 1/3, 0.33', false)
  ) AS opts10(opt_l, opt_t, is_c) WHERE q.order_index = 10
) AS options(option_label_val, option_text_val, is_correct_val)
WHERE qz.title = 'Fractions & Decimals Quiz'
ON CONFLICT DO NOTHING;

-- Options for Algebra Basics Quiz Questions (simplified - using pattern matching)
INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
SELECT 
  gen_random_uuid(),
  q.id,
  CASE (ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4
    WHEN 1 THEN 'A'
    WHEN 2 THEN 'B'
    WHEN 3 THEN 'C'
    WHEN 0 THEN 'D'
  END,
  CASE 
    WHEN q.order_index = 1 AND (ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4 = 1 THEN '3' -- Q1 correct
    WHEN q.order_index = 1 THEN chr(ASCII('3') + ((ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4)) || ''
    WHEN q.order_index = 2 AND (ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4 = 1 THEN '7a + b' -- Q2 correct
    WHEN q.order_index = 2 THEN 'Option ' || chr(64 + ((ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4))
    ELSE 'Option ' || chr(64 + ((ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4))
  END,
  CASE 
    WHEN q.order_index IN (1,2,3,4,5,6,7,8,9,10) AND (ROW_NUMBER() OVER (PARTITION BY q.id ORDER BY q.id)) % 4 = 1 THEN true
    ELSE false
  END
FROM questions q
INNER JOIN quizzes qz ON q.quiz_id = qz.id
WHERE qz.title = 'Algebra Basics Quiz'
  AND q.order_index <= 10
CROSS JOIN generate_series(1, 4) -- 4 options per question
ON CONFLICT DO NOTHING;

-- Simplified approach: Let's create options for Algebra and Geometry quizzes manually
-- We'll create a pattern where first option (A) is correct for simplicity

-- For Algebra Basics Quiz - Create generic correct answers
DO $$
DECLARE
  q_rec RECORD;
  opt_id UUID;
  opt_labels TEXT[] := ARRAY['A', 'B', 'C', 'D'];
  correct_answers TEXT[] := ARRAY['3', '7a + b', '5', '12', '2x + 6', '19', '3', 'x² - 4', '-5', '5'];
  wrong_options TEXT[][] := ARRAY[
    ARRAY['4', '5', '6'],
    ARRAY['5a + b', '6a + b', '7a'],
    ARRAY['3', '4', '6'],
    ARRAY['10', '11', '13'],
    ARRAY['2x + 3', 'x + 6', '2x'],
    ARRAY['18', '20', '21'],
    ARRAY['2', '4', '5'],
    ARRAY['x² + 4', 'x² - 2x + 4', 'x²'],
    ARRAY['5', '3', '2'],
    ARRAY['4', '6', '7']
  ];
  q_idx INT;
BEGIN
  FOR q_rec IN 
    SELECT q.id, q.order_index 
    FROM questions q
    INNER JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE qz.title = 'Algebra Basics Quiz'
    ORDER BY q.order_index
  LOOP
    q_idx := q_rec.order_index;
    -- Correct option (A)
    INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
    VALUES (gen_random_uuid(), q_rec.id, 'A', correct_answers[q_idx], true)
    ON CONFLICT DO NOTHING;
    
    -- Wrong options (B, C, D)
    FOR i IN 1..3 LOOP
      INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
      VALUES (gen_random_uuid(), q_rec.id, opt_labels[i+1], wrong_options[q_idx][i], false)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- For Geometry Fundamentals Quiz
DO $$
DECLARE
  q_rec RECORD;
  opt_labels TEXT[] := ARRAY['A', 'B', 'C', 'D'];
  correct_answers TEXT[] := ARRAY['3', '180°', '15 cm²', '90°', '16 cm', 'Square', '154 cm²', '8', 'Equilateral', '1/2 × base × height'];
  wrong_options TEXT[][] := ARRAY[
    ARRAY['4', '5', '6'],
    ARRAY['90°', '360°', '270°'],
    ARRAY['8 cm²', '20 cm²', '25 cm²'],
    ARRAY['45°', '180°', '360°'],
    ARRAY['12 cm', '20 cm', '8 cm'],
    ARRAY['Rectangle', 'Triangle', 'Circle'],
    ARRAY['44 cm²', '22 cm²', '88 cm²'],
    ARRAY['6', '12', '4'],
    ARRAY['Isosceles', 'Scalene', 'Right'],
    ARRAY['base × height', 'length × width', 'π × r²']
  ];
  q_idx INT;
BEGIN
  FOR q_rec IN 
    SELECT q.id, q.order_index 
    FROM questions q
    INNER JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE qz.title = 'Geometry Fundamentals Quiz'
    ORDER BY q.order_index
  LOOP
    q_idx := q_rec.order_index;
    -- Correct option (A)
    INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
    VALUES (gen_random_uuid(), q_rec.id, 'A', correct_answers[q_idx], true)
    ON CONFLICT DO NOTHING;
    
    -- Wrong options (B, C, D)
    FOR i IN 1..3 LOOP
      INSERT INTO question_options (id, question_id, option_label, option_text, is_correct)
      VALUES (gen_random_uuid(), q_rec.id, opt_labels[i+1], wrong_options[q_idx][i], false)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- 5. CREATE QUIZ ATTEMPTS BY STUDENTS
-- ============================================
-- Create quiz attempts with varying scores for analytics

INSERT INTO quiz_attempts (
  id,
  quiz_id,
  student_id,
  score,
  total_marks,
  percentage,
  time_taken,
  status,
  started_at,
  submitted_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Fractions & Decimals Quiz' LIMIT 1),
  s.id,
  score_val,
  10,
  (score_val::DECIMAL / 10.0 * 100),
  time_taken_val,
  'graded'::"AttemptStatus",
  NOW() - INTERVAL '2 days' + (row_num || ' hours')::INTERVAL,
  NOW() - INTERVAL '2 days' + (row_num || ' hours')::INTERVAL + (time_taken_val || ' seconds')::INTERVAL
FROM students s
INNER JOIN users u ON s.user_id = u.id
CROSS JOIN (
  SELECT 
    ROW_NUMBER() OVER () as row_num,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 8
      WHEN 2 THEN 9
      WHEN 3 THEN 7
      WHEN 4 THEN 6
      WHEN 5 THEN 10
      WHEN 6 THEN 5
    END as score_val,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 720
      WHEN 2 THEN 650
      WHEN 3 THEN 800
      WHEN 4 THEN 850
      WHEN 5 THEN 600
      WHEN 6 THEN 900
    END as time_taken_val
  FROM generate_series(1, 6)
) AS attempts_data
WHERE u.email LIKE '%@savra.com' AND u.role = 'student'
LIMIT 6
ON CONFLICT DO NOTHING;

-- Attempts for Algebra Basics Quiz
INSERT INTO quiz_attempts (
  id,
  quiz_id,
  student_id,
  score,
  total_marks,
  percentage,
  time_taken,
  status,
  started_at,
  submitted_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Algebra Basics Quiz' LIMIT 1),
  s.id,
  score_val,
  10,
  (score_val::DECIMAL / 10.0 * 100),
  time_taken_val,
  'graded'::"AttemptStatus",
  NOW() - INTERVAL '1 day' + (row_num || ' hours')::INTERVAL,
  NOW() - INTERVAL '1 day' + (row_num || ' hours')::INTERVAL + (time_taken_val || ' seconds')::INTERVAL
FROM students s
INNER JOIN users u ON s.user_id = u.id
CROSS JOIN (
  SELECT 
    ROW_NUMBER() OVER () as row_num,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 7
      WHEN 2 THEN 9
      WHEN 3 THEN 6
      WHEN 4 THEN 8
      WHEN 5 THEN 10
      WHEN 6 THEN 5
    END as score_val,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 780
      WHEN 2 THEN 700
      WHEN 3 THEN 850
      WHEN 4 THEN 720
      WHEN 5 THEN 650
      WHEN 6 THEN 900
    END as time_taken_val
  FROM generate_series(1, 6)
) AS attempts_data
WHERE u.email LIKE '%@savra.com' AND u.role = 'student'
LIMIT 6
ON CONFLICT DO NOTHING;

-- Attempts for Geometry Fundamentals Quiz
INSERT INTO quiz_attempts (
  id,
  quiz_id,
  student_id,
  score,
  total_marks,
  percentage,
  time_taken,
  status,
  started_at,
  submitted_at
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM quizzes WHERE title = 'Geometry Fundamentals Quiz' LIMIT 1),
  s.id,
  score_val,
  10,
  (score_val::DECIMAL / 10.0 * 100),
  time_taken_val,
  'graded'::"AttemptStatus",
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours'
FROM students s
INNER JOIN users u ON s.user_id = u.id
CROSS JOIN (
  SELECT 
    ROW_NUMBER() OVER () as row_num,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 9
      WHEN 2 THEN 8
      WHEN 3 THEN 7
      WHEN 4 THEN 10
      WHEN 5 THEN 9
      WHEN 6 THEN 6
    END as score_val,
    CASE ROW_NUMBER() OVER ()
      WHEN 1 THEN 680
      WHEN 2 THEN 750
      WHEN 3 THEN 820
      WHEN 4 THEN 600
      WHEN 5 THEN 700
      WHEN 6 THEN 880
    END as time_taken_val
  FROM generate_series(1, 6)
) AS attempts_data
WHERE u.email LIKE '%@savra.com' AND u.role = 'student'
LIMIT 6
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. CREATE STUDENT ANSWERS
-- ============================================
-- Create student answers for quiz attempts
-- Link answers to questions and mark correct/incorrect based on selected options

-- For each attempt, create answers for all questions
-- For simplicity, we'll make some answers correct and some incorrect based on the score

DO $$
DECLARE
  attempt_rec RECORD;
  question_rec RECORD;
  correct_option_id UUID;
  wrong_option_id UUID;
  selected_option_id UUID;
  is_correct_answer BOOLEAN;
  score_target INT;
  correct_count INT := 0;
  total_questions INT;
BEGIN
  FOR attempt_rec IN 
    SELECT qa.id as attempt_id, qa.quiz_id, qa.score, q.id as quiz_attempt_quiz_id
    FROM quiz_attempts qa
    INNER JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.status = 'graded'
  LOOP
    total_questions := 10; -- All quizzes have 10 questions
    score_target := attempt_rec.score;
    correct_count := 0;
    
    FOR question_rec IN 
      SELECT q.id as question_id, q.order_index
      FROM questions q
      WHERE q.quiz_id = attempt_rec.quiz_id
      ORDER BY q.order_index
    LOOP
      -- Get correct option for this question
      SELECT id INTO correct_option_id
      FROM question_options
      WHERE question_id = question_rec.question_id AND is_correct = true
      LIMIT 1;
      
      -- Get a wrong option for this question
      SELECT id INTO wrong_option_id
      FROM question_options
      WHERE question_id = question_rec.question_id AND is_correct = false
      LIMIT 1;
      
      -- Determine if this answer should be correct based on score
      IF correct_count < score_target THEN
        selected_option_id := correct_option_id;
        is_correct_answer := true;
        correct_count := correct_count + 1;
      ELSE
        selected_option_id := wrong_option_id;
        is_correct_answer := false;
      END IF;
      
      -- Insert student answer
      INSERT INTO student_answers (
        id,
        attempt_id,
        question_id,
        selected_option_id,
        is_correct,
        marks_obtained
      )
      VALUES (
        gen_random_uuid(),
        attempt_rec.attempt_id,
        question_rec.question_id,
        selected_option_id,
        is_correct_answer,
        CASE WHEN is_correct_answer THEN 1 ELSE 0 END
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- VERIFICATION QUERIES (Optional - run after seeding)
-- ============================================
-- SELECT 'Quizzes' as table_name, count(*) as count FROM quizzes WHERE status = 'published'
-- UNION ALL
-- SELECT 'Questions', count(*) FROM questions
-- UNION ALL
-- SELECT 'Question Options', count(*) FROM question_options
-- UNION ALL
-- SELECT 'Quiz Attempts', count(*) FROM quiz_attempts WHERE status = 'graded'
-- UNION ALL
-- SELECT 'Student Answers', count(*) FROM student_answers;

-- View quiz statistics
-- SELECT 
--   q.title,
--   COUNT(DISTINCT qa.id) as total_attempts,
--   AVG(qa.percentage) as avg_percentage,
--   AVG(qa.score) as avg_score,
--   COUNT(DISTINCT sa.id) as total_answers
-- FROM quizzes q
-- LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
-- LEFT JOIN student_answers sa ON qa.id = sa.attempt_id
-- WHERE q.status = 'published'
-- GROUP BY q.id, q.title;
