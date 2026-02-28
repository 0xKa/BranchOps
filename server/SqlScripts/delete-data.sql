-- ============================================================================
-- BranchOps - Delete All Data Script (PostgreSQL)
-- ============================================================================
-- Deletes all rows from every table in the correct order to respect
-- foreign key constraints (children first, then parents).
-- ============================================================================

-- Child / leaf tables first
DELETE FROM "AuditLogs";
DELETE FROM "StockAdjustments";
DELETE FROM "OrderItems";
DELETE FROM "Orders";
DELETE FROM "BranchStocks";
DELETE FROM "Products";
DELETE FROM "ProductCategories";
DELETE FROM "EmployeeSalaries";
DELETE FROM "Employees";
DELETE FROM "BranchPhones";
DELETE FROM "Branches";
DELETE FROM "Users";

-- Reset EF Core migration history (optional – uncomment if needed)
-- DELETE FROM "__EFMigrationsHistory";
