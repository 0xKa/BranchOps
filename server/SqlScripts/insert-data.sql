-- ============================================================================
-- BranchOps - Sample Data Insert Script (PostgreSQL)
-- ============================================================================
-- NOTE: Password hashes below are for the password "1234"
--       generated using ASP.NET Core PasswordHasher<User>.
--       To regenerate, register users through the application or use:
--       new PasswordHasher<User>().HashPassword(user, "1234")
--
-- UserRole:   Admin=0, StockManager=1, BranchManager=2, Cashier=3, Guest=4
-- OrderStatus: Paid=1, Cancelled=2
-- PaymentMethod: Cash=1, Card=2, Mixed=3
-- StockAdjustmentType: Restock=1, Sale=2, Return=3, Damage=4, ManualAdjustment=5, Transfer=6
-- ============================================================================

DO $$
DECLARE
    -- Common values
    v_password_hash TEXT := 'AQAAAAIAAYagAAAAEMFZlVABar15+lTQGHrLheDuAn6d4+1EkJEWa+FjCNKreCaGhEF7kRUFoG5Wpg6oHw==';
    v_now TIMESTAMPTZ := now();

    -- User IDs
    v_admin_user_id       UUID := gen_random_uuid();
    v_stock_mgr1_user_id  UUID := gen_random_uuid();
    v_stock_mgr2_user_id  UUID := gen_random_uuid();
    v_branch_mgr1_user_id UUID := gen_random_uuid();
    v_branch_mgr2_user_id UUID := gen_random_uuid();
    v_cashier1_user_id    UUID := gen_random_uuid();
    v_cashier2_user_id    UUID := gen_random_uuid();
    v_cashier3_user_id    UUID := gen_random_uuid();
    v_cashier4_user_id    UUID := gen_random_uuid();
    v_guest_user_id       UUID := gen_random_uuid();

    -- Branch IDs
    v_branch1_id UUID := gen_random_uuid();
    v_branch2_id UUID := gen_random_uuid();
    v_branch3_id UUID := gen_random_uuid();

    -- Employee IDs
    v_emp1_id UUID := gen_random_uuid();  -- Khalid (Admin)
    v_emp2_id UUID := gen_random_uuid();  -- Omar (Stock Mgr)
    v_emp3_id UUID := gen_random_uuid();  -- Tariq (Stock Mgr)
    v_emp4_id UUID := gen_random_uuid();  -- Ahmed (Branch Mgr)
    v_emp5_id UUID := gen_random_uuid();  -- Youssef (Branch Mgr)
    v_emp6_id UUID := gen_random_uuid();  -- Fatima (Cashier)
    v_emp7_id UUID := gen_random_uuid();  -- Noor (Cashier)
    v_emp8_id UUID := gen_random_uuid();  -- Layla (Cashier)
    v_emp9_id UUID := gen_random_uuid();  -- Hassan (Cashier)

    -- Product Category IDs
    v_cat_cocktails    UUID := gen_random_uuid();
    v_cat_mix_juices   UUID := gen_random_uuid();
    v_cat_fresh_juices UUID := gen_random_uuid();
    v_cat_healthy      UUID := gen_random_uuid();
    v_cat_mojitos      UUID := gen_random_uuid();
    v_cat_desserts     UUID := gen_random_uuid();

    -- Product IDs - Cocktails
    v_prod_alsham_cocktail     UUID := gen_random_uuid();
    v_prod_four_seasons        UUID := gen_random_uuid();
    v_prod_shaqaf_slices       UUID := gen_random_uuid();
    v_prod_fruit_salad_avocado UUID := gen_random_uuid();
    v_prod_avocado_special     UUID := gen_random_uuid();
    -- Product IDs - Mix Juices
    v_prod_kiwi_strawberry     UUID := gen_random_uuid();
    v_prod_banana_strawberry   UUID := gen_random_uuid();
    -- Product IDs - Fresh Juices
    v_prod_mango_juice         UUID := gen_random_uuid();
    v_prod_orange_juice        UUID := gen_random_uuid();
    v_prod_avocado_juice       UUID := gen_random_uuid();
    v_prod_beetroot_juice      UUID := gen_random_uuid();
    v_prod_watermelon_juice    UUID := gen_random_uuid();
    v_prod_pomegranate_juice   UUID := gen_random_uuid();
    v_prod_guava_juice         UUID := gen_random_uuid();
    -- Product IDs - Healthy Juices
    v_prod_pom_ginger          UUID := gen_random_uuid();
    v_prod_ginger_lemon        UUID := gen_random_uuid();
    v_prod_beetroot_carrot     UUID := gen_random_uuid();
    -- Product IDs - Mojitos
    v_prod_wildberry_mojito    UUID := gen_random_uuid();
    v_prod_strawberry_mojito   UUID := gen_random_uuid();
    v_prod_mint_lemon_mojito   UUID := gen_random_uuid();
    v_prod_passion_mojito      UUID := gen_random_uuid();
    -- Product IDs - Desserts
    v_prod_fruit_salad         UUID := gen_random_uuid();
    v_prod_sundae              UUID := gen_random_uuid();
    v_prod_ice_cream_cone      UUID := gen_random_uuid();

    -- BranchStock IDs
    v_bs1  UUID := gen_random_uuid();
    v_bs2  UUID := gen_random_uuid();
    v_bs3  UUID := gen_random_uuid();
    v_bs4  UUID := gen_random_uuid();
    v_bs5  UUID := gen_random_uuid();
    v_bs6  UUID := gen_random_uuid();
    v_bs7  UUID := gen_random_uuid();
    v_bs8  UUID := gen_random_uuid();
    v_bs9  UUID := gen_random_uuid();
    v_bs10 UUID := gen_random_uuid();
    v_bs11 UUID := gen_random_uuid();
    v_bs12 UUID := gen_random_uuid();
    v_bs13 UUID := gen_random_uuid();
    v_bs14 UUID := gen_random_uuid();
    v_bs15 UUID := gen_random_uuid();
    v_bs16 UUID := gen_random_uuid();
    v_bs17 UUID := gen_random_uuid();
    v_bs18 UUID := gen_random_uuid();

    -- Order IDs
    v_order1_id UUID := gen_random_uuid();
    v_order2_id UUID := gen_random_uuid();
    v_order3_id UUID := gen_random_uuid();
    v_order4_id UUID := gen_random_uuid();
    v_order5_id UUID := gen_random_uuid();
    v_order6_id UUID := gen_random_uuid();
    v_order7_id UUID := gen_random_uuid();
    v_order8_id UUID := gen_random_uuid();

BEGIN

    -- ========================================================================
    -- 1. USERS
    -- ========================================================================
    INSERT INTO "Users" ("Id", "Username", "PasswordHash", "Email", "Role", "RefreshToken", "RefreshTokenExpiryTime", "CreatedAt", "UpdatedAt")
    VALUES
        (v_admin_user_id,       'khalid.admin',     v_password_hash, 'khalid@branchops.com',      0, NULL, NULL, v_now, v_now),
        (v_stock_mgr1_user_id,  'omar.stock',       v_password_hash, 'omar@branchops.com',        1, NULL, NULL, v_now, v_now),
        (v_stock_mgr2_user_id,  'tariq.stock',      v_password_hash, 'tariq@branchops.com',       1, NULL, NULL, v_now, v_now),
        (v_branch_mgr1_user_id, 'ahmed.manager',    v_password_hash, 'ahmed@branchops.com',       2, NULL, NULL, v_now, v_now),
        (v_branch_mgr2_user_id, 'youssef.manager',  v_password_hash, 'youssef@branchops.com',     2, NULL, NULL, v_now, v_now),
        (v_cashier1_user_id,    'fatima.cashier',   v_password_hash, 'fatima@branchops.com',      3, NULL, NULL, v_now, v_now),
        (v_cashier2_user_id,    'noor.cashier',     v_password_hash, 'noor@branchops.com',        3, NULL, NULL, v_now, v_now),
        (v_cashier3_user_id,    'layla.cashier',    v_password_hash, 'layla@branchops.com',       3, NULL, NULL, v_now, v_now),
        (v_cashier4_user_id,    'hassan.cashier',   v_password_hash, 'hassan@branchops.com',      3, NULL, NULL, v_now, v_now),
        (v_guest_user_id,       'guest',            v_password_hash, 'guest@branchops.com',       4, NULL, NULL, v_now, v_now);

    -- ========================================================================
    -- 2. BRANCHES
    -- ========================================================================
    INSERT INTO "Branches" ("Id", "Code", "DisplayName", "AddressLine1", "AddressLine2", "City", "Country", "IsActive", "CreatedAt", "UpdatedAt")
    VALUES
        (v_branch1_id, 'MCT-001', 'Al Sham - Muscat City Centre',  'Muscat City Centre, Ground Floor',  'Al Qurum',        'Muscat',  'Oman', true, v_now, v_now),
        (v_branch2_id, 'SEE-002', 'Al Sham - Seeb Branch',         'Seeb Commercial Area, Block 5',     'Al Hail South',   'Seeb',    'Oman', true, v_now, v_now),
        (v_branch3_id, 'SLH-003', 'Al Sham - Salalah Branch',      'Salalah Gardens Mall, 1st Floor',   NULL,              'Salalah', 'Oman', true, v_now, v_now);

    -- ========================================================================
    -- 3. BRANCH PHONES
    -- ========================================================================
    INSERT INTO "BranchPhones" ("Id", "BranchId", "Number", "Label", "IsPrimary", "IsActive", "CreatedAt", "UpdatedAt")
    VALUES
        (gen_random_uuid(), v_branch1_id, '+968-2456-7890', 'Main',      true,  true, v_now, v_now),
        (gen_random_uuid(), v_branch1_id, '+968-2456-7891', 'WhatsApp',  false, true, v_now, v_now),
        (gen_random_uuid(), v_branch2_id, '+968-2433-1200', 'Main',      true,  true, v_now, v_now),
        (gen_random_uuid(), v_branch2_id, '+968-2433-1201', 'Delivery',  false, true, v_now, v_now),
        (gen_random_uuid(), v_branch3_id, '+968-2329-8800', 'Main',      true,  true, v_now, v_now);

    -- ========================================================================
    -- 4. EMPLOYEES
    -- ========================================================================
    INSERT INTO "Employees" ("Id", "UserId", "BranchId", "FullName", "Phone", "JobTitle", "Notes", "IsActive", "HiredAt", "CreatedAt", "UpdatedAt")
    VALUES
        (v_emp1_id, v_admin_user_id,       v_branch1_id, 'Khalid bin Saeed Al Mansoori',   '+968-9123-4567', 'General Manager',  'Responsible for all branches',  true, '2023-01-15', v_now, v_now),
        (v_emp2_id, v_stock_mgr1_user_id,  v_branch1_id, 'Omar bin Nasser Al Harthi',      '+968-9234-5678', 'Stock Manager',    'Stock manager - Muscat branch', true, '2023-03-01', v_now, v_now),
        (v_emp3_id, v_stock_mgr2_user_id,  v_branch2_id, 'Tariq bin Khalifa Al Balushi',   '+968-9345-6789', 'Stock Manager',    'Stock manager - Seeb branch',   true, '2023-06-15', v_now, v_now),
        (v_emp4_id, v_branch_mgr1_user_id, v_branch1_id, 'Ahmed bin Mohammed Al Rashdi',   '+968-9456-7890', 'Branch Manager',   'Muscat City branch manager',    true, '2023-02-01', v_now, v_now),
        (v_emp5_id, v_branch_mgr2_user_id, v_branch2_id, 'Youssef bin Ali Al Kindi',       '+968-9567-8901', 'Branch Manager',   'Seeb branch manager',           true, '2023-05-01', v_now, v_now),
        (v_emp6_id, v_cashier1_user_id,    v_branch1_id, 'Fatima bint Salem Al Ameriya',   '+968-9678-9012', 'Senior Cashier',   NULL,                            true, '2023-04-01', v_now, v_now),
        (v_emp7_id, v_cashier2_user_id,    v_branch1_id, 'Noor bint Hamad Al Hinaia',      '+968-9789-0123', 'Cashier',          NULL,                            true, '2024-01-10', v_now, v_now),
        (v_emp8_id, v_cashier3_user_id,    v_branch2_id, 'Layla bint Abdullah Al Saadiya', '+968-9890-1234', 'Cashier',          NULL,                            true, '2024-03-15', v_now, v_now),
        (v_emp9_id, v_cashier4_user_id,    v_branch3_id, 'Hassan bin Yaqoub Al Zadjali',   '+968-9901-2345', 'Cashier',          'Salalah branch cashier',        true, '2024-06-01', v_now, v_now);

    -- ========================================================================
    -- 5. EMPLOYEE SALARIES
    -- ========================================================================
    INSERT INTO "EmployeeSalaries" ("Id", "EmployeeId", "Amount", "Currency", "EffectiveFrom", "EffectiveTo", "Notes", "CreatedAt", "UpdatedAt")
    VALUES
        -- Khalid (Admin / General Manager)
        (gen_random_uuid(), v_emp1_id, 2500.000, 'OMR', '2023-01-15', '2024-12-31', 'Initial salary',      v_now, v_now),
        (gen_random_uuid(), v_emp1_id, 2800.000, 'OMR', '2025-01-01',  NULL,        'Annual raise',        v_now, v_now),
        -- Omar (Stock Manager)
        (gen_random_uuid(), v_emp2_id, 1200.000, 'OMR', '2023-03-01',  NULL,        NULL,                  v_now, v_now),
        -- Tariq (Stock Manager)
        (gen_random_uuid(), v_emp3_id, 1200.000, 'OMR', '2023-06-15',  NULL,        NULL,                  v_now, v_now),
        -- Ahmed (Branch Manager - Muscat)
        (gen_random_uuid(), v_emp4_id, 1800.000, 'OMR', '2023-02-01', '2024-12-31', 'Initial salary',      v_now, v_now),
        (gen_random_uuid(), v_emp4_id, 2000.000, 'OMR', '2025-01-01',  NULL,        'Promotion and raise', v_now, v_now),
        -- Youssef (Branch Manager - Seeb)
        (gen_random_uuid(), v_emp5_id, 1800.000, 'OMR', '2023-05-01',  NULL,        NULL,                  v_now, v_now),
        -- Fatima (Senior Cashier)
        (gen_random_uuid(), v_emp6_id,  800.000, 'OMR', '2023-04-01', '2024-12-31', NULL,                  v_now, v_now),
        (gen_random_uuid(), v_emp6_id,  900.000, 'OMR', '2025-01-01',  NULL,        'Raise after one year',v_now, v_now),
        -- Noor (Cashier)
        (gen_random_uuid(), v_emp7_id,  700.000, 'OMR', '2024-01-10',  NULL,        NULL,                  v_now, v_now),
        -- Layla (Cashier)
        (gen_random_uuid(), v_emp8_id,  700.000, 'OMR', '2024-03-15',  NULL,        NULL,                  v_now, v_now),
        -- Hassan (Cashier - Salalah)
        (gen_random_uuid(), v_emp9_id,  700.000, 'OMR', '2024-06-01',  NULL,        NULL,                  v_now, v_now);

    -- ========================================================================
    -- 6. PRODUCT CATEGORIES
    -- ========================================================================
    INSERT INTO "ProductCategories" ("Id", "Name", "IsActive", "CreatedAt", "UpdatedAt")
    VALUES
        (v_cat_cocktails,    'Cocktails',              true, v_now, v_now),
        (v_cat_mix_juices,   'Mix Juices',             true, v_now, v_now),
        (v_cat_fresh_juices, 'Fresh Juices',           true, v_now, v_now),
        (v_cat_healthy,      'Healthy Juices',         true, v_now, v_now),
        (v_cat_mojitos,      'Mojitos',                true, v_now, v_now),
        (v_cat_desserts,     'Fruit Salad & Desserts', true, v_now, v_now);

    -- ========================================================================
    -- 7. PRODUCTS
    -- ========================================================================
    INSERT INTO "Products" ("Id", "Name", "CategoryId", "Price", "Cost", "IsActive", "CreatedAt", "UpdatedAt")
    VALUES
        -- Cocktails
        (v_prod_alsham_cocktail,     'Al Sham Fruit Cocktail',      v_cat_cocktails,   1.800, 0.700, true, v_now, v_now),
        (v_prod_four_seasons,        'Four Seasons Cocktail',       v_cat_cocktails,   1.600, 0.600, true, v_now, v_now),
        (v_prod_shaqaf_slices,       'Shaqaf Slices Cocktail',      v_cat_cocktails,   2.000, 0.800, true, v_now, v_now),
        (v_prod_fruit_salad_avocado, 'Fruit Salad with Avocado',    v_cat_cocktails,   2.200, 0.900, true, v_now, v_now),
        (v_prod_avocado_special,     'Avocado Special',             v_cat_cocktails,   2.500, 1.000, true, v_now, v_now),
        -- Mix Juices
        (v_prod_kiwi_strawberry,     'Kiwi with Strawberry Juice',  v_cat_mix_juices,  1.500, 0.500, true, v_now, v_now),
        (v_prod_banana_strawberry,   'Banana with Strawberry Juice',v_cat_mix_juices,  1.500, 0.500, true, v_now, v_now),
        -- Fresh Juices
        (v_prod_mango_juice,         'Mango Juice',                 v_cat_fresh_juices,1.200, 0.400, true, v_now, v_now),
        (v_prod_orange_juice,        'Orange Juice',                v_cat_fresh_juices,1.000, 0.300, true, v_now, v_now),
        (v_prod_avocado_juice,       'Avocado Juice',               v_cat_fresh_juices,1.500, 0.600, true, v_now, v_now),
        (v_prod_beetroot_juice,      'Beetroot Juice',              v_cat_fresh_juices,1.200, 0.400, true, v_now, v_now),
        (v_prod_watermelon_juice,    'Watermelon Juice',            v_cat_fresh_juices,0.800, 0.250, true, v_now, v_now),
        (v_prod_pomegranate_juice,   'Pomegranate Juice',           v_cat_fresh_juices,1.500, 0.600, true, v_now, v_now),
        (v_prod_guava_juice,         'Guava Juice',                 v_cat_fresh_juices,1.000, 0.350, true, v_now, v_now),
        -- Healthy Juices
        (v_prod_pom_ginger,          'Pomegranate with Ginger',     v_cat_healthy,     1.800, 0.700, true, v_now, v_now),
        (v_prod_ginger_lemon,        'Ginger Lemon Boost',          v_cat_healthy,     1.500, 0.500, true, v_now, v_now),
        (v_prod_beetroot_carrot,     'Beetroot Carrot Mix',         v_cat_healthy,     1.600, 0.550, true, v_now, v_now),
        -- Mojitos
        (v_prod_wildberry_mojito,    'Wildberry Mojito',            v_cat_mojitos,     2.000, 0.700, true, v_now, v_now),
        (v_prod_strawberry_mojito,   'Strawberry Mojito',           v_cat_mojitos,     2.000, 0.700, true, v_now, v_now),
        (v_prod_mint_lemon_mojito,   'Mint Lemon Mojito',           v_cat_mojitos,     1.800, 0.600, true, v_now, v_now),
        (v_prod_passion_mojito,      'Passion Fruit Mojito',        v_cat_mojitos,     2.200, 0.800, true, v_now, v_now),
        -- Fruit Salad & Desserts
        (v_prod_fruit_salad,         'Fruit Salad',                 v_cat_desserts,    1.800, 0.600, true, v_now, v_now),
        (v_prod_sundae,              'Sundae',                      v_cat_desserts,    1.500, 0.500, true, v_now, v_now),
        (v_prod_ice_cream_cone,      'Ice Cream Sugar Cone',        v_cat_desserts,    0.800, 0.300, true, v_now, v_now);

    -- ========================================================================
    -- 8. BRANCH STOCKS (inventory per branch x product)
    -- ========================================================================
    INSERT INTO "BranchStocks" ("Id", "BranchId", "ProductId", "Quantity", "LowStockThreshold", "CreatedAt", "UpdatedAt")
    VALUES
        -- Branch 1 (Muscat) - all major products
        (v_bs1,  v_branch1_id, v_prod_alsham_cocktail,    50,  10, v_now, v_now),
        (v_bs2,  v_branch1_id, v_prod_wildberry_mojito,   40,  10, v_now, v_now),
        (v_bs3,  v_branch1_id, v_prod_strawberry_mojito,  35,  10, v_now, v_now),
        (v_bs4,  v_branch1_id, v_prod_mango_juice,        60,  15, v_now, v_now),
        (v_bs5,  v_branch1_id, v_prod_orange_juice,       80,  20, v_now, v_now),
        (v_bs6,  v_branch1_id, v_prod_avocado_juice,      30,  10, v_now, v_now),
        (v_bs7,  v_branch1_id, v_prod_avocado_special,    25,  10, v_now, v_now),
        (v_bs8,  v_branch1_id, v_prod_sundae,             45,  10, v_now, v_now),
        (v_bs9,  v_branch1_id, v_prod_ice_cream_cone,     70,  15, v_now, v_now),
        -- Branch 2 (Seeb) - subset of products
        (v_bs10, v_branch2_id, v_prod_alsham_cocktail,    40,  10, v_now, v_now),
        (v_bs11, v_branch2_id, v_prod_wildberry_mojito,   30,  10, v_now, v_now),
        (v_bs12, v_branch2_id, v_prod_mango_juice,        55,  15, v_now, v_now),
        (v_bs13, v_branch2_id, v_prod_orange_juice,       75,  20, v_now, v_now),
        (v_bs14, v_branch2_id, v_prod_shaqaf_slices,       8,  10, v_now, v_now),  -- low stock!
        -- Branch 3 (Salalah) - smaller inventory
        (v_bs15, v_branch3_id, v_prod_alsham_cocktail,    20,  10, v_now, v_now),
        (v_bs16, v_branch3_id, v_prod_orange_juice,       50,  15, v_now, v_now),
        (v_bs17, v_branch3_id, v_prod_strawberry_mojito,  15,  10, v_now, v_now),
        (v_bs18, v_branch3_id, v_prod_fruit_salad,         5,  10, v_now, v_now);  -- low stock!

    -- ========================================================================
    -- 9. ORDERS
    -- ========================================================================
    INSERT INTO "Orders" ("Id", "BranchId", "CreatedByUserId", "Status", "Subtotal", "Discount", "Tax", "Total", "PaymentMethod", "AmountPaid", "PaidAtUtc", "CancelledByUserId", "Notes", "CreatedAt", "UpdatedAt")
    VALUES
        -- Branch 1 orders (by Fatima & Noor)
        (v_order1_id, v_branch1_id, v_cashier1_user_id, 1, 5.600, 0.000, 0.000, 5.600, 1, 5.600, '2026-02-25 09:15:00', NULL, NULL,                                '2026-02-25 09:15:00', '2026-02-25 09:15:00'),
        (v_order2_id, v_branch1_id, v_cashier1_user_id, 1, 4.500, 0.500, 0.000, 4.000, 2, 4.000, '2026-02-25 10:30:00', NULL, 'Discount for regular customer',      '2026-02-25 10:30:00', '2026-02-25 10:30:00'),
        (v_order3_id, v_branch1_id, v_cashier2_user_id, 1, 3.000, 0.000, 0.000, 3.000, 1, 5.000, '2026-02-25 14:00:00', NULL, NULL,                                '2026-02-25 14:00:00', '2026-02-25 14:00:00'),
        (v_order4_id, v_branch1_id, v_cashier2_user_id, 2, 2.000, 0.000, 0.000, 2.000, 1, 0.000, NULL,                  v_branch_mgr1_user_id, 'Cancelled - customer changed mind', '2026-02-26 11:00:00', '2026-02-26 11:05:00'),
        -- Branch 2 orders (by Layla)
        (v_order5_id, v_branch2_id, v_cashier3_user_id, 1, 7.200, 0.000, 0.000, 7.200, 1, 7.200, '2026-02-26 09:45:00', NULL, NULL,                                '2026-02-26 09:45:00', '2026-02-26 09:45:00'),
        (v_order6_id, v_branch2_id, v_cashier3_user_id, 1, 3.500, 0.000, 0.000, 3.500, 3, 3.500, '2026-02-26 13:20:00', NULL, 'Mixed payment cash + card',          '2026-02-26 13:20:00', '2026-02-26 13:20:00'),
        -- Branch 3 orders (by Hassan)
        (v_order7_id, v_branch3_id, v_cashier4_user_id, 1, 2.800, 0.000, 0.000, 2.800, 1, 2.800, '2026-02-27 08:30:00', NULL, NULL,                                '2026-02-27 08:30:00', '2026-02-27 08:30:00'),
        (v_order8_id, v_branch3_id, v_cashier4_user_id, 1, 4.600, 0.200, 0.000, 4.400, 2, 4.400, '2026-02-27 15:10:00', NULL, NULL,                                '2026-02-27 15:10:00', '2026-02-27 15:10:00');

    -- ========================================================================
    -- 10. ORDER ITEMS
    -- ========================================================================
    INSERT INTO "OrderItems" ("Id", "OrderId", "ProductId", "Quantity", "UnitPrice", "LineTotal", "CreatedAt", "UpdatedAt")
    VALUES
        -- Order 1: Al Sham Cocktail x2 + Wildberry Mojito x1
        (gen_random_uuid(), v_order1_id, v_prod_alsham_cocktail,   2, 1.800, 3.600, '2026-02-25 09:15:00', '2026-02-25 09:15:00'),
        (gen_random_uuid(), v_order1_id, v_prod_wildberry_mojito,  1, 2.000, 2.000, '2026-02-25 09:15:00', '2026-02-25 09:15:00'),
        -- Order 2: Mango Juice x1 + Avocado Juice x1 + Strawberry Mojito x1
        (gen_random_uuid(), v_order2_id, v_prod_mango_juice,       1, 1.200, 1.200, '2026-02-25 10:30:00', '2026-02-25 10:30:00'),
        (gen_random_uuid(), v_order2_id, v_prod_avocado_juice,     1, 1.500, 1.500, '2026-02-25 10:30:00', '2026-02-25 10:30:00'),
        (gen_random_uuid(), v_order2_id, v_prod_strawberry_mojito, 1, 1.800, 1.800, '2026-02-25 10:30:00', '2026-02-25 10:30:00'),
        -- Order 3: Orange Juice x3
        (gen_random_uuid(), v_order3_id, v_prod_orange_juice,      3, 1.000, 3.000, '2026-02-25 14:00:00', '2026-02-25 14:00:00'),
        -- Order 4 (Cancelled): Wildberry Mojito x1
        (gen_random_uuid(), v_order4_id, v_prod_wildberry_mojito,  1, 2.000, 2.000, '2026-02-26 11:00:00', '2026-02-26 11:00:00'),
        -- Order 5: Avocado Special x2 + Al Sham Cocktail x1 + Ice Cream Cone x1
        (gen_random_uuid(), v_order5_id, v_prod_avocado_special,   2, 2.500, 5.000, '2026-02-26 09:45:00', '2026-02-26 09:45:00'),
        (gen_random_uuid(), v_order5_id, v_prod_alsham_cocktail,   1, 1.800, 1.800, '2026-02-26 09:45:00', '2026-02-26 09:45:00'),
        (gen_random_uuid(), v_order5_id, v_prod_ice_cream_cone,    1, 0.800, 0.800, '2026-02-26 09:45:00', '2026-02-26 09:45:00'),
        -- Order 6: Kiwi Strawberry x1 + Wildberry Mojito x1
        (gen_random_uuid(), v_order6_id, v_prod_kiwi_strawberry,   1, 1.500, 1.500, '2026-02-26 13:20:00', '2026-02-26 13:20:00'),
        (gen_random_uuid(), v_order6_id, v_prod_wildberry_mojito,  1, 2.000, 2.000, '2026-02-26 13:20:00', '2026-02-26 13:20:00'),
        -- Order 7: Strawberry Mojito x1 + Orange Juice x1
        (gen_random_uuid(), v_order7_id, v_prod_strawberry_mojito, 1, 2.000, 2.000, '2026-02-27 08:30:00', '2026-02-27 08:30:00'),
        (gen_random_uuid(), v_order7_id, v_prod_orange_juice,      1, 1.000, 1.000, '2026-02-27 08:30:00', '2026-02-27 08:30:00'),
        -- Order 8: Pomegranate Ginger x1 + Al Sham Cocktail x1 + Sundae x1
        (gen_random_uuid(), v_order8_id, v_prod_pom_ginger,        1, 1.800, 1.800, '2026-02-27 15:10:00', '2026-02-27 15:10:00'),
        (gen_random_uuid(), v_order8_id, v_prod_alsham_cocktail,   1, 1.800, 1.800, '2026-02-27 15:10:00', '2026-02-27 15:10:00'),
        (gen_random_uuid(), v_order8_id, v_prod_sundae,            1, 1.500, 1.500, '2026-02-27 15:10:00', '2026-02-27 15:10:00');

    -- ========================================================================
    -- 11. STOCK ADJUSTMENTS (initial restock + some sales/adjustments)
    -- ========================================================================
    INSERT INTO "StockAdjustments" ("Id", "BranchStockId", "BranchId", "ProductId", "Type", "QuantityChange", "QuantityAfter", "PerformedByUserId", "Notes", "CreatedAt", "UpdatedAt")
    VALUES
        -- Initial restock for Branch 1
        (gen_random_uuid(), v_bs1,  v_branch1_id, v_prod_alsham_cocktail,   1,  50, 50, v_stock_mgr1_user_id, 'Initial restock - Muscat branch', '2026-02-20 08:00:00', '2026-02-20 08:00:00'),
        (gen_random_uuid(), v_bs2,  v_branch1_id, v_prod_wildberry_mojito,  1,  40, 40, v_stock_mgr1_user_id, 'Initial restock',                 '2026-02-20 08:00:00', '2026-02-20 08:00:00'),
        (gen_random_uuid(), v_bs4,  v_branch1_id, v_prod_mango_juice,       1,  60, 60, v_stock_mgr1_user_id, 'Initial restock',                 '2026-02-20 08:00:00', '2026-02-20 08:00:00'),
        (gen_random_uuid(), v_bs5,  v_branch1_id, v_prod_orange_juice,      1, 100,100, v_stock_mgr1_user_id, 'Initial restock',                 '2026-02-20 08:00:00', '2026-02-20 08:00:00'),
        -- Sales deductions for Branch 1
        (gen_random_uuid(), v_bs1,  v_branch1_id, v_prod_alsham_cocktail,   2,  -3, 47, v_cashier1_user_id,   'Sale - orders #1 & #5',           '2026-02-25 09:15:00', '2026-02-25 09:15:00'),
        (gen_random_uuid(), v_bs2,  v_branch1_id, v_prod_wildberry_mojito,  2,  -1, 39, v_cashier1_user_id,   NULL,                              '2026-02-25 09:15:00', '2026-02-25 09:15:00'),
        (gen_random_uuid(), v_bs5,  v_branch1_id, v_prod_orange_juice,      2,  -3, 97, v_cashier2_user_id,   NULL,                              '2026-02-25 14:00:00', '2026-02-25 14:00:00'),
        -- Damage adjustment
        (gen_random_uuid(), v_bs4,  v_branch1_id, v_prod_mango_juice,       4,  -2, 58, v_stock_mgr1_user_id, 'Damage - expired fruits',         '2026-02-24 17:00:00', '2026-02-24 17:00:00'),
        -- Initial restock for Branch 2
        (gen_random_uuid(), v_bs10, v_branch2_id, v_prod_alsham_cocktail,   1,  40, 40, v_stock_mgr2_user_id, 'Initial restock - Seeb branch',   '2026-02-20 08:30:00', '2026-02-20 08:30:00'),
        (gen_random_uuid(), v_bs12, v_branch2_id, v_prod_mango_juice,       1,  55, 55, v_stock_mgr2_user_id, 'Initial restock',                 '2026-02-20 08:30:00', '2026-02-20 08:30:00'),
        (gen_random_uuid(), v_bs14, v_branch2_id, v_prod_shaqaf_slices,     1,  20, 20, v_stock_mgr2_user_id, 'Initial restock',                 '2026-02-20 08:30:00', '2026-02-20 08:30:00'),
        -- Manual adjustment for Branch 2 (inventory count correction)
        (gen_random_uuid(), v_bs14, v_branch2_id, v_prod_shaqaf_slices,     5, -12,  8, v_stock_mgr2_user_id, 'Manual inventory correction',     '2026-02-26 18:00:00', '2026-02-26 18:00:00'),
        -- Initial restock for Branch 3
        (gen_random_uuid(), v_bs15, v_branch3_id, v_prod_alsham_cocktail,   1,  20, 20, v_stock_mgr1_user_id, 'Initial restock - Salalah branch','2026-02-21 09:00:00', '2026-02-21 09:00:00'),
        (gen_random_uuid(), v_bs16, v_branch3_id, v_prod_orange_juice,      1,  50, 50, v_stock_mgr1_user_id, 'Initial restock',                 '2026-02-21 09:00:00', '2026-02-21 09:00:00'),
        (gen_random_uuid(), v_bs18, v_branch3_id, v_prod_fruit_salad,       1,  15, 15, v_stock_mgr1_user_id, 'Initial restock',                 '2026-02-21 09:00:00', '2026-02-21 09:00:00'),
        -- Sales & damage in Branch 3
        (gen_random_uuid(), v_bs18, v_branch3_id, v_prod_fruit_salad,       2,  -8,  7, v_cashier4_user_id,   NULL,                              '2026-02-25 16:00:00', '2026-02-25 16:00:00'),
        (gen_random_uuid(), v_bs18, v_branch3_id, v_prod_fruit_salad,       4,  -2,  5, v_stock_mgr1_user_id, 'Damage due to poor storage',      '2026-02-26 10:00:00', '2026-02-26 10:00:00');

    -- ====================================================================
    -- Done! Summary:
    --   Users:            10
    --   Branches:          3
    --   BranchPhones:      5
    --   Employees:         9
    --   EmployeeSalaries: 12
    --   ProductCategories:  6
    --   Products:         24
    --   BranchStocks:     18
    --   Orders:            8
    --   OrderItems:       17
    --   StockAdjustments: 17
    --   AuditLogs:        20
    -- ====================================================================

    -- ========================================================================
    -- 12. AUDIT LOGS
    -- ========================================================================
    INSERT INTO "AuditLogs" ("Id", "UserId", "Action", "EntityType", "EntityId", "Details", "Timestamp")
    VALUES
        (gen_random_uuid(), v_admin_user_id,       'Create', 'Branch',      v_branch1_id,  'Created branch Al Sham - Muscat City Centre',          v_now - INTERVAL '10 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'Branch',      v_branch2_id,  'Created branch Al Sham - Seeb Branch',                 v_now - INTERVAL '10 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'Branch',      v_branch3_id,  'Created branch Al Sham - Salalah Branch',              v_now - INTERVAL '10 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'User',        v_branch_mgr1_user_id,  'Registered user ahmed.manager (Branch Manager)',  v_now - INTERVAL '9 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'User',        v_branch_mgr2_user_id,  'Registered user youssef.manager (Branch Manager)', v_now - INTERVAL '9 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'User',        v_cashier1_user_id,     'Registered user fatima.cashier (Cashier)',         v_now - INTERVAL '8 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'Employee',    v_emp1_id,     'Added employee Khalid bin Saeed Al Mansoori',           v_now - INTERVAL '8 days'),
        (gen_random_uuid(), v_branch_mgr1_user_id, 'Update', 'Branch',     v_branch1_id,  'Updated branch address for Muscat City Centre',         v_now - INTERVAL '7 days'),
        (gen_random_uuid(), v_stock_mgr1_user_id,  'Create', 'StockAdjustment', NULL,      'Restocked 50 units of Al Sham Special Cocktail',        v_now - INTERVAL '6 days'),
        (gen_random_uuid(), v_stock_mgr1_user_id,  'Create', 'StockAdjustment', NULL,      'Restocked 30 units of Fresh Orange Juice',              v_now - INTERVAL '6 days'),
        (gen_random_uuid(), v_admin_user_id,       'Create', 'Product',     v_prod_alsham_cocktail, 'Added product Al Sham Special Cocktail',       v_now - INTERVAL '5 days'),
        (gen_random_uuid(), v_admin_user_id,       'Update', 'Product',     v_prod_four_seasons,    'Updated price for Four Seasons Cocktail',      v_now - INTERVAL '5 days'),
        (gen_random_uuid(), v_cashier1_user_id,    'Create', 'Order',       v_order1_id,   'Placed order (3 items, total 5.200 OMR)',               v_now - INTERVAL '3 days'),
        (gen_random_uuid(), v_cashier2_user_id,    'Create', 'Order',       v_order2_id,   'Placed order (2 items, total 3.900 OMR)',               v_now - INTERVAL '3 days'),
        (gen_random_uuid(), v_branch_mgr1_user_id, 'Login',  'User',       v_branch_mgr1_user_id, 'User ahmed.manager logged in',                  v_now - INTERVAL '2 days'),
        (gen_random_uuid(), v_admin_user_id,       'Login',  'User',        v_admin_user_id,       'User khalid.admin logged in',                   v_now - INTERVAL '2 days'),
        (gen_random_uuid(), v_admin_user_id,       'Delete', 'Employee',    v_emp9_id,     'Deactivated employee Hassan bin Nasser Al Busaidi',     v_now - INTERVAL '1 day'),
        (gen_random_uuid(), v_cashier3_user_id,    'Create', 'Order',       v_order5_id,   'Placed order (2 items, total 5.350 OMR)',               v_now - INTERVAL '1 day'),
        (gen_random_uuid(), v_branch_mgr2_user_id, 'Update', 'Branch',     v_branch3_id,  'Updated Salalah branch operating hours',                v_now - INTERVAL '12 hours'),
        (gen_random_uuid(), v_admin_user_id,       'Update', 'User',        v_cashier4_user_id,    'Updated role for hassan.cashier',               v_now - INTERVAL '6 hours');

    RAISE NOTICE 'Sample data inserted successfully.';

END $$;
