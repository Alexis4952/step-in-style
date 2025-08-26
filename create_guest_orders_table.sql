-- Create guest_orders table for visitor orders
CREATE TABLE IF NOT EXISTS guest_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_address TEXT,
  
  -- Order Details
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  order_type VARCHAR(20) DEFAULT 'guest',
  
  -- Payment Information
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'stripe',
  payment_id VARCHAR(255),
  payment_amount DECIMAL(10, 2),
  payment_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guest_orders_order_number ON guest_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_guest_orders_email ON guest_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON guest_orders(status);
CREATE INDEX IF NOT EXISTS idx_guest_orders_payment_status ON guest_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_guest_orders_created_at ON guest_orders(created_at);

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guest_orders_updated_at 
    BEFORE UPDATE ON guest_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample guest order data
INSERT INTO guest_orders (
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  items,
  total,
  status,
  payment_status,
  payment_method,
  payment_id,
  payment_amount,
  payment_date
) VALUES (
  'ORD-SAMPLE001',
  'Δοκιμαστικός Πελάτης',
  'test@example.com',
  '+306912345678',
  'Δοκιμαστική Διεύθυνση 123, Αθήνα',
  '[{"product_id": 1, "product_name": "Δοκιμαστικό Προϊόν", "quantity": 1, "price": 30.00}]',
  30.00,
  'pending',
  'completed',
  'stripe',
  'pi_test_1234567890',
  30.00,
  CURRENT_TIMESTAMP
) ON CONFLICT (order_number) DO NOTHING;
