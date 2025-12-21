-- tables
CREATE TABLE dbo.lkp_qualityLevel (
   Id          TINYINT       NOT NULL PRIMARY KEY,  -- 0..3
   Name        VARCHAR(20)   NOT NULL,
   Description NVARCHAR(255) NULL
);


INSERT INTO dbo.lkp_qualityLevel (Id, Name, Description)
VALUES
(0, 'None/Bad', 'None or very poor quality'),
(1, 'Basic',    'Basic, acceptable quality'),
(2, 'Good',     'Good quality'),
(3, 'Superb',   'Excellent quality or finish');




CREATE TABLE dbo.viewings (
   Id                          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,


   -- Basic - all details I can add before the visit (from the ad)
   Address                     NVARCHAR(MAX)   NULL,
   Size                        DECIMAL(9,2)    NULL,
   Price                  DECIMAL(18,2)   NULL,
   Bedrooms                    DECIMAL(3,1)    NULL,
   Floor                       DECIMAL(4,1)    NULL,
   IsElevator                  BIT             NOT NULL DEFAULT (0),
   ConstructionYear            SMALLINT        NULL,


   -- Visit details
   ViewingDate                 DATETIME2       NULL,
   AgentStakeholderId          INT             NULL,
   ViewedByStakeholderId       INT             NULL,


   -- Quality assessment (ALL NULLABLE)
   IsSecurityDoor              BIT             NULL,
   BuildingSecurityDoorsPercent TINYINT        NULL,
   AluminumWindowsLevel        TINYINT         NULL,  -- FK → lkp_qualityLevel
   RenovationKitchenLevel      TINYINT         NULL,  -- FK → lkp_qualityLevel
   RenovationBathroomLevel     TINYINT         NULL,  -- FK → lkp_qualityLevel
   RenovationLevel             TINYINT         NULL,  -- FK → lkp_qualityLevel
   ViewLevel                   TINYINT         NULL,  -- FK → lkp_qualityLevel
   BalconyLevel                TINYINT         NULL,  -- FK → lkp_qualityLevel
   BuildingLobbyLevel          TINYINT         NULL,  -- FK → lkp_qualityLevel
   BuildingMaintenanceLevel    TINYINT         NULL,  -- FK → lkp_qualityLevel
   MetroStationDistanceLevel   TINYINT         NULL,  -- FK → lkp_qualityLevel


   -- Links & notes
   LinkAddress                 NVARCHAR(500)   NULL,
   LinkAd                      NVARCHAR(500)   NULL,
   LinkToPhotos                NVARCHAR(500)   NULL,
   Transportation              NVARCHAR(MAX)   NULL,
   Comments                    NVARCHAR(MAX)   NULL,


   -- Expected finance
   ExpectedMinimalRent         DECIMAL(18,2)   NULL,


   -- Meta
   ApartmentId                 INT             NULL,
   IsDeleted                   BIT             NOT NULL DEFAULT (0)
);



CREATE TABLE auth.viewingsVisibility (
   ViewingId INT       NOT NULL,
   StakeholderId      INT       NOT NULL,
   CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
   CONSTRAINT PK_viewingsVisibility PRIMARY KEY (ViewingId, StakeholderId)
);


CREATE TABLE dbo.lkp_viewingExtras (
  Id                 INT IDENTITY(1,1) PRIMARY KEY,
  Name               VARCHAR(20) NOT NULL,
  Category           INT NOT NULL, -- 1 Basic, 2 Essensial, 3 Extra       
  Description        NVARCHAR(MAX) NOT NULL,
  Estimation             DECIMAL(18,2) NULL
);




INSERT INTO dbo.lkp_viewingExtras (Name, Description, Estimation)
VALUES
('Kitchen renovation',
N'Full kitchen renovation including cabinets, countertop, sink, and basic appliances',
8000.00),


('Bathroom renovation',
N'Complete bathroom renovation including plumbing, tiles, toilet, and shower',
4500.00),


('Aluminum window',
N'Replacement of standard window with aluminum frame and double glazing',
1200.00),


('Security door',
N'Installation of reinforced security entrance door',
1500.00),


('AC',
N'Installation of air conditioning unit including indoor and outdoor units',
1000.00),


('Rent saved',
N'Estimated rent saved by reduced vacancy or renovation timing optimization',
-1000.00),


('Agency saved',
N'Agency commission saved by direct deal without intermediary',
-1000.00);






CREATE TABLE dbo.viewingExtraItems (
   Id                 INT IDENTITY(1,1) PRIMARY KEY,
   ViewingId INT NOT NULL,
   ExtraId          INT NOT NULL,               -- FK → lkp_viewingExtras table
   Type          INT NOT NULL,               -- FK → lkp_viewingExtras table
   Category           INT NOT NULL,               -- FK → lkp_viewingExtras table
   Description        NVARCHAR(MAX) NOT NULL,
   Amount             DECIMAL(18,2) NOT NULL,     -- positive = expense, negative = saving
   CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
   UpdatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME()






   CONSTRAINT FK_viewingExtraItems_Viewing
       FOREIGN KEY (ViewingId)
       REFERENCES dbo.viewings(Id),


   CONSTRAINT FK_viewingExtraItems_lkp_viewingExtras
       FOREIGN KEY (ExtraId)
       REFERENCES dbo.lkp_viewingExtras(Id)
);





-- FKs


-- viewings
ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_Apartment
FOREIGN KEY (ApartmentId)
REFERENCES dbo.apartments(Id);


-- Agent
ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_Agent
FOREIGN KEY (AgentStakeholderId)
REFERENCES dbo.stakeholders(Id);


-- ViewedBy (person who physically visited)
ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_ViewedBy
FOREIGN KEY (ViewedByStakeholderId)
REFERENCES dbo.stakeholders(Id);








-- FK to lkp_qualityLevel


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_AluminumWindowsLevel
FOREIGN KEY (AluminumWindowsLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_RenovationKitchenLevel
FOREIGN KEY (RenovationKitchenLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_RenovationBathroomLevel
FOREIGN KEY (RenovationBathroomLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_RenovationLevel
FOREIGN KEY (RenovationLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_ViewLevel
FOREIGN KEY (ViewLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_BalconyLevel
FOREIGN KEY (BalconyLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_BuildingLobbyLevel
FOREIGN KEY (BuildingLobbyLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_BuildingMaintenanceLevel
FOREIGN KEY (BuildingMaintenanceLevel)
REFERENCES dbo.lkp_qualityLevel(Id);


ALTER TABLE dbo.viewings
ADD CONSTRAINT FK_Viewings_MetroStationDistanceLevel
FOREIGN KEY (MetroStationDistanceLevel)
REFERENCES dbo.lkp_qualityLevel(Id);







-- For auth.viewingsVisibility

ALTER TABLE auth.viewingsVisibility
ADD CONSTRAINT FK_ViewingVisibility_Viewing
FOREIGN KEY (ViewingId)
REFERENCES dbo.viewings(Id);


ALTER TABLE auth.viewingsVisibility
ADD CONSTRAINT FK_ViewingVisibility_Stakeholder
FOREIGN KEY (StakeholderId)
REFERENCES dbo.stakeholders(Id);



CREATE INDEX IX_Viewings_ApartmentId
ON dbo.viewings (ApartmentId);


CREATE INDEX IX_Viewings_AgentStakeholderId
ON dbo.viewings (AgentStakeholderId);


CREATE INDEX IX_Viewings_ViewedByStakeholderId
ON dbo.viewings (ViewedByStakeholderId);


CREATE INDEX IX_Viewings_ViewingDate
ON dbo.viewings (ViewingDate);





CREATE INDEX IX_ViewingVisibility_StakeholderId
ON auth.viewingsVisibility (StakeholderId);



