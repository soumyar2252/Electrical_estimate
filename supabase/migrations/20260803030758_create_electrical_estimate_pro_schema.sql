/*
# Electrical Estimate Pro — Full Schema

1. Overview
This app lets electricians in India create digital material estimates for house wiring projects.
It replaces paper-based estimates with a professional digital estimation platform.
The app has authentication (electrician role), so all tables are owner-scoped via user_id.

2. Tables
- `profiles` — extends auth.users with business info (name, business_name, phone, city, logo, gst, upi, address, theme, language, notifications)
- `customers` — customer records owned by an electrician (name, phone, email, address, project_name, project_type, site_address, notes, status)
- `products` — electrician's product catalog (name, category, unit, default_price) plus a seeded default catalog
- `estimates` — estimate header (customer_id, estimate_number, date, status, subtotal, discount, gst, labour, transport, grand_total, advance, balance, notes, terms)
- `estimate_items` — line items belonging to an estimate (name, category, quantity, unit, rate, amount)
- `invoices` — invoice header generated from an estimate (estimate_id, invoice_number, date, status, totals snapshot)
- `payments` — payment tracking (invoice_id, amount, method, status, date)

3. Security
- RLS enabled on every table.
- Owner-scoped CRUD policies (auth.uid() = user_id) on all tables.
- Child tables (estimate_items, invoices, payments) scoped through parent ownership via EXISTS subquery.
- All owner columns default to auth.uid() so client inserts omitting user_id still succeed.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  business_name text,
  phone text,
  city text,
  logo_url text,
  gst_number text,
  upi_id text,
  address text,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  project_name text,
  project_type text,
  site_address text,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_customers" ON customers;
CREATE POLICY "select_own_customers" ON customers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_customers" ON customers;
CREATE POLICY "insert_own_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_customers" ON customers;
CREATE POLICY "update_own_customers" ON customers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_customers" ON customers;
CREATE POLICY "delete_own_customers" ON customers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  unit text DEFAULT 'Nos',
  default_price numeric DEFAULT 0,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_products" ON products;
CREATE POLICY "select_own_products" ON products FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ESTIMATES
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  estimate_number text NOT NULL,
  estimate_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'draft',
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  gst numeric DEFAULT 0,
  labour numeric DEFAULT 0,
  transport numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  advance numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  notes text,
  terms text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_estimates" ON estimates;
CREATE POLICY "select_own_estimates" ON estimates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_estimates" ON estimates;
CREATE POLICY "insert_own_estimates" ON estimates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_estimates" ON estimates;
CREATE POLICY "update_own_estimates" ON estimates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_estimates" ON estimates;
CREATE POLICY "delete_own_estimates" ON estimates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ESTIMATE ITEMS
CREATE TABLE IF NOT EXISTS estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  quantity numeric DEFAULT 1,
  unit text DEFAULT 'Nos',
  rate numeric DEFAULT 0,
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_estimate_items" ON estimate_items;
CREATE POLICY "select_own_estimate_items" ON estimate_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_estimate_items" ON estimate_items;
CREATE POLICY "insert_own_estimate_items" ON estimate_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_estimate_items" ON estimate_items;
CREATE POLICY "update_own_estimate_items" ON estimate_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_estimate_items" ON estimate_items;
CREATE POLICY "delete_own_estimate_items" ON estimate_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM estimates WHERE estimates.id = estimate_items.estimate_id AND estimates.user_id = auth.uid())
  );

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  estimate_id uuid REFERENCES estimates(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  invoice_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'unpaid',
  subtotal numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  gst numeric DEFAULT 0,
  labour numeric DEFAULT 0,
  transport numeric DEFAULT 0,
  grand_total numeric DEFAULT 0,
  advance numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  notes text,
  terms text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_invoices" ON invoices;
CREATE POLICY "select_own_invoices" ON invoices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_invoices" ON invoices;
CREATE POLICY "insert_own_invoices" ON invoices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_invoices" ON invoices;
CREATE POLICY "update_own_invoices" ON invoices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_invoices" ON invoices;
CREATE POLICY "delete_own_invoices" ON invoices FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  amount numeric DEFAULT 0,
  method text DEFAULT 'Cash',
  status text DEFAULT 'pending',
  payment_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer ON estimates(customer_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
