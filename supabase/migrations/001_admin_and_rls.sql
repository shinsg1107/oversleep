-- ============================================
-- Admin role + RLS policies + Storage bucket
-- Run in Supabase SQL Editor (after schema.sql)
-- ============================================

-- 1) Add role column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: does current JWT belong to an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2) Enable RLS on every table
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;

-- 3) Public read (catalog)
DROP POLICY IF EXISTS "public read categories"       ON categories;
DROP POLICY IF EXISTS "public read materials"        ON materials;
DROP POLICY IF EXISTS "public read products"         ON products;
DROP POLICY IF EXISTS "public read product_images"   ON product_images;
DROP POLICY IF EXISTS "public read product_variants" ON product_variants;

CREATE POLICY "public read categories"       ON categories       FOR SELECT USING (true);
CREATE POLICY "public read materials"        ON materials        FOR SELECT USING (true);
CREATE POLICY "public read products"         ON products         FOR SELECT USING (true);
CREATE POLICY "public read product_images"   ON product_images   FOR SELECT USING (true);
CREATE POLICY "public read product_variants" ON product_variants FOR SELECT USING (true);

-- 4) Admin writes (catalog)
DROP POLICY IF EXISTS "admin write categories"       ON categories;
DROP POLICY IF EXISTS "admin write materials"        ON materials;
DROP POLICY IF EXISTS "admin write products"         ON products;
DROP POLICY IF EXISTS "admin write product_images"   ON product_images;
DROP POLICY IF EXISTS "admin write product_variants" ON product_variants;

CREATE POLICY "admin write categories"       ON categories       FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write materials"        ON materials        FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write products"         ON products         FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write product_images"   ON product_images   FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin write product_variants" ON product_variants FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5) Profiles: users can read/update their own row; admins can read all
DROP POLICY IF EXISTS "users read own profile"   ON profiles;
DROP POLICY IF EXISTS "admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "users update own profile" ON profiles;

CREATE POLICY "users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 6) Cart: users manage their own
DROP POLICY IF EXISTS "users manage own cart" ON cart_items;
CREATE POLICY "users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7) Orders: users read their own / create their own; admins read all
DROP POLICY IF EXISTS "users read own orders"   ON orders;
DROP POLICY IF EXISTS "users create own orders" ON orders;
DROP POLICY IF EXISTS "admins read all orders"  ON orders;

CREATE POLICY "users read own orders"   ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all orders"  ON orders FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8) Order items: readable/writable if the parent order is
DROP POLICY IF EXISTS "order items via parent" ON order_items;
CREATE POLICY "order items via parent" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())));

-- ============================================
-- Storage bucket for product images
-- ============================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read product images"  ON storage.objects;
DROP POLICY IF EXISTS "admin write product images"  ON storage.objects;
DROP POLICY IF EXISTS "admin update product images" ON storage.objects;
DROP POLICY IF EXISTS "admin delete product images" ON storage.objects;

CREATE POLICY "public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "admin write product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "admin update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "admin delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================
-- Promote yourself to admin (run after signup)
-- ============================================
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
