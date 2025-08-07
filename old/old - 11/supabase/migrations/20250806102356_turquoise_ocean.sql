/*
  # Update book_requests status constraint

  1. Changes
    - Update the status constraint to include 'return_requested' status
    - This allows students to request returns and admins to approve them

  2. Security
    - No changes to existing RLS policies
*/

-- Update the constraint to include the new status
ALTER TABLE book_requests DROP CONSTRAINT IF EXISTS book_requests_status_check;

ALTER TABLE book_requests ADD CONSTRAINT book_requests_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'return_requested'::text]));