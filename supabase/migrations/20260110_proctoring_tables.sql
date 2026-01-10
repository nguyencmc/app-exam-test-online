-- Migration: Create proctoring tables and storage bucket
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create proctoring_sessions table
CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID REFERENCES exam_attempts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL,
  camera_enabled BOOLEAN DEFAULT false,
  screen_enabled BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create proctoring_events table
CREATE TABLE IF NOT EXISTS proctoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('snapshot', 'tab_switch', 'fullscreen_exit', 'copy_attempt', 'violation', 'recording')),
  event_data JSONB DEFAULT '{}',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_user_id ON proctoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_exam_id ON proctoring_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_events_session_id ON proctoring_events(session_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_events_event_type ON proctoring_events(event_type);

-- Enable Row Level Security
ALTER TABLE proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proctoring_sessions
-- Users can view their own sessions
CREATE POLICY "Users can view own proctoring sessions"
  ON proctoring_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own proctoring sessions"
  ON proctoring_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own proctoring sessions"
  ON proctoring_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all proctoring sessions"
  ON proctoring_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'teacher')
    )
  );

-- RLS Policies for proctoring_events
-- Users can view events from their sessions
CREATE POLICY "Users can view own proctoring events"
  ON proctoring_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions
      WHERE proctoring_sessions.id = proctoring_events.session_id
      AND proctoring_sessions.user_id = auth.uid()
    )
  );

-- Users can create events for their sessions
CREATE POLICY "Users can create own proctoring events"
  ON proctoring_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proctoring_sessions
      WHERE proctoring_sessions.id = proctoring_events.session_id
      AND proctoring_sessions.user_id = auth.uid()
    )
  );

-- Admins can view all events
CREATE POLICY "Admins can view all proctoring events"
  ON proctoring_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'teacher')
    )
  );

-- Grant permissions
GRANT ALL ON proctoring_sessions TO authenticated;
GRANT ALL ON proctoring_events TO authenticated;

-- Create proctoring storage bucket (run in Dashboard > Storage)
-- Bucket name: proctoring
-- Public: false (private bucket)
-- File size limit: 50MB
-- Allowed MIME types: image/jpeg, image/png, video/webm

COMMENT ON TABLE proctoring_sessions IS 'Stores proctoring session metadata for exam monitoring';
COMMENT ON TABLE proctoring_events IS 'Stores individual proctoring events like snapshots and violations';
