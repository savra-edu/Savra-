-- Add 'assertion_reasoning' to QuestionType enum for assessment question papers.
ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'assertion_reasoning';
