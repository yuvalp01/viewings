-- Create stakeholders table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[stakeholders]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[stakeholders] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(255) NOT NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0
    );
END
GO

-- Create apartmentViewings table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[apartmentViewings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[apartmentViewings] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Address] NVARCHAR(255) NOT NULL,
        [Size] INT NOT NULL,
        [PriceAsked] DECIMAL(18, 2) NOT NULL,
        [Bedrooms] INT NOT NULL,
        [Floor] INT NULL,
        [IsElevator] BIT NOT NULL DEFAULT 0,
        [ConstructionYear] INT NULL,
        [LinkAd] NVARCHAR(500) NULL,
        [AgentStakeholderId] INT NULL,
        [Status] INT NOT NULL DEFAULT 1,
        CONSTRAINT [FK_apartmentViewings_stakeholders] FOREIGN KEY ([AgentStakeholderId]) 
            REFERENCES [dbo].[stakeholders]([Id])
    );
    
    -- Create index on AgentStakeholderId for better query performance
    CREATE INDEX [IX_apartmentViewings_AgentStakeholderId] ON [dbo].[apartmentViewings]([AgentStakeholderId]);
    
    -- Create index on Status for filtering
    CREATE INDEX [IX_apartmentViewings_Status] ON [dbo].[apartmentViewings]([Status]);
END
GO

