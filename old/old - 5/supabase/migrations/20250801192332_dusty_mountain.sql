/*
  # Add Database Functions for Library Management

  1. Functions
    - `decrement_available_quantity` - Safely decrease available book quantity
    - `increment_available_quantity` - Safely increase available book quantity  
    - `update_coin_balance` - Update user coin balance safely

  2. Security
    - Functions are accessible to authenticated users
    - Include proper error handling
*/

-- Function to safely decrement available book quantity
CREATE OR REPLACE FUNCTION decrement_available_quantity(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books 
  SET available_quantity = available_quantity - 1,
      updated_at = now()
  WHERE id = book_id 
    AND available_quantity > 0;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book not found or no copies available';
  END IF;
END;
$$;

-- Function to safely increment available book quantity  
CREATE OR REPLACE FUNCTION increment_available_quantity(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books 
  SET available_quantity = available_quantity + 1,
      updated_at = now()
  WHERE id = book_id;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book not found';
  END IF;
END;
$$;

-- Function to update user coin balance
CREATE OR REPLACE FUNCTION update_coin_balance(user_id uuid, amount_change integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET coin_balance = coin_balance + amount_change,
      updated_at = now()
  WHERE profiles.user_id = update_coin_balance.user_id;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Ensure balance doesn't go negative
  UPDATE profiles 
  SET coin_balance = GREATEST(coin_balance, 0)
  WHERE profiles.user_id = update_coin_balance.user_id;
END;
$$;