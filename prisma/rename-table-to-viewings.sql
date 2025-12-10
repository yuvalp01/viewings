-- Migration script to rename apartmentViewings table to viewings
-- and update column names to match the new schema

-- Step 1: Rename the table if it exists
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[apartmentViewings]') AND type in (N'U'))
BEGIN
    -- Check if viewings table already exists
    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[viewings]') AND type in (N'U'))
    BEGIN
        -- Rename the table
        EXEC sp_rename '[dbo].[apartmentViewings]', 'viewings';
        PRINT 'Table renamed from apartmentViewings to viewings';
    END
    ELSE
    BEGIN
        PRINT 'Table viewings already exists. Skipping rename.';
    END
END
ELSE
BEGIN
    PRINT 'Table apartmentViewings does not exist.';
END
GO

-- Step 2: Rename PriceAsked column to Price if it exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[viewings]') AND name = 'PriceAsked')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[viewings]') AND name = 'Price')
    BEGIN
        EXEC sp_rename '[dbo].[viewings].[PriceAsked]', 'Price', 'COLUMN';
        PRINT 'Column PriceAsked renamed to Price';
    END
    ELSE
    BEGIN
        PRINT 'Column Price already exists. Skipping rename.';
    END
END
GO

-- Step 3: Update foreign key constraint names if they reference the old table name
-- Note: Foreign key names are automatically updated when table is renamed, but we can verify
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_apartmentViewings_stakeholders')
BEGIN
    EXEC sp_rename 'FK_apartmentViewings_stakeholders', 'FK_viewings_stakeholders', 'OBJECT';
    PRINT 'Foreign key constraint renamed';
END
GO

-- Step 4: Update index names if they reference the old table name
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_apartmentViewings_AgentStakeholderId' AND object_id = OBJECT_ID(N'[dbo].[viewings]'))
BEGIN
    EXEC sp_rename '[dbo].[viewings].[IX_apartmentViewings_AgentStakeholderId]', 'IX_viewings_AgentStakeholderId', 'INDEX';
    PRINT 'Index IX_apartmentViewings_AgentStakeholderId renamed';
END
GO

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_apartmentViewings_Status' AND object_id = OBJECT_ID(N'[dbo].[viewings]'))
BEGIN
    EXEC sp_rename '[dbo].[viewings].[IX_apartmentViewings_Status]', 'IX_viewings_Status', 'INDEX';
    PRINT 'Index IX_apartmentViewings_Status renamed';
END
GO

PRINT 'Migration completed successfully!';

