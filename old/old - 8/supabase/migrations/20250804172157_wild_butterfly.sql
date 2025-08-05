/*
  # Add return request functionality

  1. Changes
    - Update book_requests status constraint to include 'return_requested'
    - This allows students to request returns and admins to approve them

  2. Security
    - Maintains existing RLS policies
*/

-- Update the status constraint to include return_requested
ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_status_check;
ALTER TABLE book_requests ADD CONSTRAINT book_requests_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'return_requested'::text]));