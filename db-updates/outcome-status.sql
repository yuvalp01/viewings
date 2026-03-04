CREATE TABLE [dbo].[lkp_viewingOutcomeStatus] (
    [Id] INT NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    CONSTRAINT [PK_lkp_viewingOutcomeStatus] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [UQ_lkp_viewingOutcomeStatus_Name] UNIQUE ([Name])
);

-- Populate the lookup table with your requested options
INSERT INTO [dbo].[lkp_viewingOutcomeStatus] ([Id], [Name])
VALUES 
    (1, N'Good opportunity'),
    (2, N'Good but expensive'),
    (3, N'Possible for low price'),
    (4, N'Offer given',
    (5, N'Not good'),
    (6, N'Bought by us'),
    (7, N'Bought by others');
GO

ALTER TABLE [dbo].[viewings]
ADD [OutcomeStatusId] INT NULL; -- Nullable to support existing records
GO

-- Add the Foreign Key constraint for data integrity
ALTER TABLE [dbo].[viewings] WITH CHECK 
ADD CONSTRAINT [FK_Viewings_OutcomeStatus] 
FOREIGN KEY ([OutcomeStatusId]) REFERENCES [dbo].[lkp_viewingOutcomeStatus] ([Id]);
GO

-- Create an index for performance, following your existing indexing pattern
CREATE NONCLUSTERED INDEX [IX_Viewings_OutcomeStatusId] 
ON [dbo].[viewings] ([OutcomeStatusId]);
GO