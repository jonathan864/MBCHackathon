/*
  # AgentGuard Sandbox Schema

  1. New Tables
    - `policies`
      - `id` (uuid, primary key) - Policy identifier
      - `name` (text) - Policy name
      - `rules` (jsonb) - Array of rule objects
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `evaluation_logs`
      - `id` (uuid, primary key) - Log entry identifier
      - `policy_id` (uuid) - Reference to policy used
      - `intent` (jsonb) - The trading intent that was evaluated
      - `result` (jsonb) - Evaluation result with allowed/reason
      - `timestamp` (timestamptz) - When evaluation occurred
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Public read access for policies (for hackathon demo)
    - Public read/write access for evaluation_logs (for hackathon demo)
    
  Note: For production, these policies would be much more restrictive
*/

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create evaluation_logs table
CREATE TABLE IF NOT EXISTS evaluation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
  intent jsonb NOT NULL,
  result jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create index for faster log queries
CREATE INDEX IF NOT EXISTS idx_evaluation_logs_timestamp ON evaluation_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_logs_policy_id ON evaluation_logs(policy_id);

-- Enable RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public access (hackathon demo purposes)
CREATE POLICY "Public can view policies"
  ON policies FOR SELECT
  USING (true);

CREATE POLICY "Public can create policies"
  ON policies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update policies"
  ON policies FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete policies"
  ON policies FOR DELETE
  USING (true);

CREATE POLICY "Public can view evaluation logs"
  ON evaluation_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create evaluation logs"
  ON evaluation_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update evaluation logs"
  ON evaluation_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete evaluation logs"
  ON evaluation_logs FOR DELETE
  USING (true);