-- ============================================
-- momspageti 쇼핑몰 DB 스키마
-- Supabase (PostgreSQL)
-- ============================================

-- 카테고리 (상의, 하의, 신발, 아우터 등)
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 원단 종류 (면, 폴리에스터, 린넨, 가죽 등)
CREATE TABLE materials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 상품
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,              -- 원 단위 (10000 = 1만원)
  category_id BIGINT NOT NULL REFERENCES categories(id),
  material_id BIGINT REFERENCES materials(id),
  image_url TEXT,                       -- 대표 이미지
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상품 이미지 (여러 장)
CREATE TABLE product_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 상품 옵션 (사이즈 x 컬러 조합별 재고)
CREATE TABLE product_variants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,                   -- S, M, L, XL, 270 등
  color TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  UNIQUE (product_id, size, color)
);

-- 유저 프로필 (Supabase Auth의 auth.users와 연동)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 장바구니
CREATE TABLE cart_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, variant_id)
);

-- 주문
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, paid, shipping, delivered, cancelled
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 주문 상세 항목
CREATE TABLE order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id BIGINT NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL                -- 주문 시점의 가격 (가격 변동 대비)
);

-- ============================================
-- 인덱스 (필터링 성능)
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_material ON products(material_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_size ON product_variants(size);
CREATE INDEX idx_variants_color ON product_variants(color);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- 초기 데이터
-- ============================================
INSERT INTO categories (name) VALUES
  ('상의'), ('하의'), ('아우터'), ('신발'), ('액세서리');

INSERT INTO materials (name) VALUES
  ('면'), ('폴리에스터'), ('린넨'), ('울'), ('가죽'), ('데님'), ('나일론');
