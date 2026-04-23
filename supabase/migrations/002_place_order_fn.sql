-- ============================================
-- place_order() RPC
-- Atomically validates cart, creates order + items,
-- decrements stock, clears cart.
-- Runs with SECURITY DEFINER so it bypasses RLS on product_variants.
-- ============================================

CREATE OR REPLACE FUNCTION public.place_order(
  p_shipping_address TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_order_id BIGINT;
  v_total    INTEGER := 0;
  v_item     RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_shipping_address IS NULL OR btrim(p_shipping_address) = '' THEN
    RAISE EXCEPTION 'shipping_address_required';
  END IF;

  -- Validate stock and compute total
  FOR v_item IN
    SELECT c.variant_id, c.quantity, pv.stock, pr.price, pr.id AS product_id
    FROM cart_items c
    JOIN product_variants pv ON pv.id = c.variant_id
    JOIN products pr ON pr.id = pv.product_id
    WHERE c.user_id = v_user_id
  LOOP
    IF v_item.quantity > v_item.stock THEN
      RAISE EXCEPTION 'insufficient_stock:%:%', v_item.variant_id, v_item.stock;
    END IF;
    v_total := v_total + v_item.price * v_item.quantity;
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'empty_cart';
  END IF;

  -- Persist shipping info on profile for convenience
  UPDATE profiles
  SET
    address = p_shipping_address,
    phone = COALESCE(NULLIF(btrim(p_phone), ''), phone)
  WHERE id = v_user_id;

  -- Create order
  INSERT INTO orders (user_id, total_price, status, shipping_address)
  VALUES (v_user_id, v_total, 'pending', p_shipping_address)
  RETURNING id INTO v_order_id;

  -- Insert order items snapshotting price
  INSERT INTO order_items (order_id, variant_id, quantity, price)
  SELECT v_order_id, c.variant_id, c.quantity, pr.price
  FROM cart_items c
  JOIN product_variants pv ON pv.id = c.variant_id
  JOIN products pr ON pr.id = pv.product_id
  WHERE c.user_id = v_user_id;

  -- Decrement stock
  UPDATE product_variants pv
  SET stock = pv.stock - c.quantity
  FROM cart_items c
  WHERE c.variant_id = pv.id AND c.user_id = v_user_id;

  -- Clear cart
  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(TEXT, TEXT) TO authenticated;
