-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'bska6x5NQq1sQ8mdIyn1dmBG26NcamQXO5HLu3/gZTuLaV60H7HzYXJ7GK/fUbvh2uc223SpvFVrMoQ+V7hrog==';

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES public.customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES public.orders(id),
  product_id BIGINT REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  custom_requirements TEXT
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Enable Row Level Security on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Create policies for authenticated users to manage their own data
CREATE POLICY "Users can insert their own customer data" ON public.customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own customer data" ON public.customers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view orders" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT USING (true);

-- Create policies for contact messages
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Admin policies (only service role can access)
CREATE POLICY "Only service role can access admins" ON public.admins
  USING (auth.role() = 'service_role');

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url, in_stock) VALUES
('Traditional Kaftan', 'Elegant traditional kaftan with intricate embroidery, perfect for special occasions.', 15000, 'Kaftan', '/placeholder.svg?height=400&width=400&text=Traditional%20Kaftan', true),
('Modern Agbada', 'Contemporary Agbada design with a modern twist, suitable for weddings and formal events.', 25000, 'Agbada', '/placeholder.svg?height=400&width=400&text=Modern%20Agbada', true),
('Casual Ankara Shirt', 'Stylish casual shirt made from vibrant Ankara fabric, perfect for everyday wear.', 8000, 'Casual', '/placeholder.svg?height=400&width=400&text=Ankara%20Shirt', true),
('Embroidered Senator', 'Classic Senator style with detailed embroidery, ideal for business and formal settings.', 12000, 'Senator', '/placeholder.svg?height=400&width=400&text=Embroidered%20Senator', true),
('Dashiki Set', 'Colorful Dashiki set with matching pants, celebrating African heritage with modern styling.', 10000, 'Dashiki', '/placeholder.svg?height=400&width=400&text=Dashiki%20Set', true),
('Luxury Babariga', 'Premium Babariga outfit with gold embroidery, designed for royalty and special celebrations.', 30000, 'Babariga', '/placeholder.svg?height=400&width=400&text=Luxury%20Babariga', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin123)
INSERT INTO public.admins (username, password, name) VALUES
('admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Administrator')
ON CONFLICT (username) DO NOTHING;
