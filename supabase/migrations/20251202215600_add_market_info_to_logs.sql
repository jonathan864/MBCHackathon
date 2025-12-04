/*
  # Add Market Information to Evaluation Logs

  This migration adds human-readable market information to the evaluation_logs table.

  1. New Columns
    - `market_question` (text, nullable) - The market's question text
    - `market_category` (text, nullable) - The market's category

  2. Notes
    - Fields are nullable to maintain compatibility with existing logs
    - The existing `marketId` field in the intent JSONB column remains unchanged
    - This provides a more user-friendly view of what markets the agent is trading
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluation_logs' AND column_name = 'market_question'
  ) THEN
    ALTER TABLE evaluation_logs ADD COLUMN market_question text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluation_logs' AND column_name = 'market_category'
  ) THEN
    ALTER TABLE evaluation_logs ADD COLUMN market_category text;
  END IF;
END $$;