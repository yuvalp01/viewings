\-- tables  
CREATE TABLE dbo.lkp\_qualityLevel (  
   Id          TINYINT       NOT NULL PRIMARY KEY,  \-- 0..3  
   Name        VARCHAR(20)   NOT NULL,  
   Description NVARCHAR(255) NULL  
);

INSERT INTO dbo.lkp\_qualityLevel (Id, Name, Description)  
VALUES  
(0, 'None/Bad', 'None or very poor quality'),  
(1, 'Basic',    'Basic, acceptable quality'),  
(2, 'Good',     'Good quality'),  
(3, 'Superb',   'Excellent quality or finish');

CREATE TABLE dbo.apartmentViewings (  
   Id                          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

   \-- Basic \- all details I can add before the visit (from the ad)  
   Address                     NVARCHAR(MAX)   NULL,  
   Size                        DECIMAL(9,2)    NULL,  
   PriceAsked                  DECIMAL(18,2)   NULL,  
   Bedrooms                    DECIMAL(3,1)    NULL,  
   Floor                       DECIMAL(4,1)    NULL,  
   IsElevator                  BIT             NOT NULL DEFAULT (0),  
   ConstructionYear            SMALLINT        NULL,

   \-- Visit details  
   ViewingDate                 DATETIME2       NULL,  
   AgentStakeholderId          INT             NULL,  
   ViewedByStakeholderId       INT             NULL,

   \-- Quality assessment (ALL NULLABLE)  
   IsSecurityDoor              BIT             NULL,  
   BuildingSecurityDoorsPercent TINYINT        NULL,  
   AluminumWindowsLevel        TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   RenovationKitchenLevel      TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   RenovationBathroomLevel     TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   RenovationLevel             TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   ViewLevel                   TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   BalconyLevel                TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   BuildingLobbyLevel          TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   BuildingMaintenanceLevel    TINYINT         NULL,  \-- FK → lkp\_qualityLevel  
   MetroStationDistanceLevel   TINYINT         NULL,  \-- FK → lkp\_qualityLevel

   \-- Links & notes  
   LinkAddress                 NVARCHAR(500)   NULL,  
   LinkAd                      NVARCHAR(500)   NULL,  
   LinkToPhotos                NVARCHAR(500)   NULL,  
   Transportation              NVARCHAR(MAX)   NULL,  
   Comments                    NVARCHAR(MAX)   NULL,

   \-- Expected finance  
   ExpectedMinimalRent         DECIMAL(18,2)   NULL,

   \-- Meta  
   ApartmentId                 INT             NULL,  
   IsDeleted                   BIT             NOT NULL DEFAULT (0)  
);

CREATE TABLE auth.apartmentViewingsVisibility (  
   ApartmentViewingId INT       NOT NULL,  
   StakeholderId      INT       NOT NULL,  
   CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),  
   CONSTRAINT PK\_apartmentViewingsVisibility PRIMARY KEY (ApartmentViewingId, StakeholderId)  
);

CREATE TABLE dbo.apartmentViewingCostItems (  
   Id                 INT IDENTITY(1,1) PRIMARY KEY,  
   ApartmentViewingId INT NOT NULL,  
   AccountId          INT NOT NULL,               \-- FK → accounts table  
   Description        NVARCHAR(MAX) NOT NULL,  
   Amount             DECIMAL(18,2) NOT NULL,     \-- positive \= expense, negative \= saving  
   CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

   CONSTRAINT FK\_ViewingCostItems\_Viewing  
       FOREIGN KEY (ApartmentViewingId)  
       REFERENCES dbo.apartmentViewings(Id),

   CONSTRAINT FK\_ViewingCostItems\_Account  
       FOREIGN KEY (AccountId)  
       REFERENCES dbo.accounts(Id)  
);

\-- FKs

\-- apartmentViewings  
ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_Apartment  
FOREIGN KEY (ApartmentId)  
REFERENCES dbo.apartments(Id);

\-- Agent  
ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_Agent  
FOREIGN KEY (AgentStakeholderId)  
REFERENCES dbo.stakeholders(Id);

\-- ViewedBy (person who physically visited)  
ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_ViewedBy  
FOREIGN KEY (ViewedByStakeholderId)  
REFERENCES dbo.stakeholders(Id);

\-- FK to lkp\_qualityLevel

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_AluminumWindowsLevel  
FOREIGN KEY (AluminumWindowsLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_RenovationKitchenLevel  
FOREIGN KEY (RenovationKitchenLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_RenovationBathroomLevel  
FOREIGN KEY (RenovationBathroomLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_RenovationLevel  
FOREIGN KEY (RenovationLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_ViewLevel  
FOREIGN KEY (ViewLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_BalconyLevel  
FOREIGN KEY (BalconyLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_BuildingLobbyLevel  
FOREIGN KEY (BuildingLobbyLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_BuildingMaintenanceLevel  
FOREIGN KEY (BuildingMaintenanceLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

ALTER TABLE dbo.apartmentViewings  
ADD CONSTRAINT FK\_Viewings\_MetroStationDistanceLevel  
FOREIGN KEY (MetroStationDistanceLevel)  
REFERENCES dbo.lkp\_qualityLevel(Id);

\-- For auth.apartmentViewingsVisibility

ALTER TABLE auth.apartmentViewingsVisibility  
ADD CONSTRAINT FK\_ViewingVisibility\_Viewing  
FOREIGN KEY (ApartmentViewingId)  
REFERENCES dbo.apartmentViewings(Id);

ALTER TABLE auth.apartmentViewingsVisibility  
ADD CONSTRAINT FK\_ViewingVisibility\_Stakeholder  
FOREIGN KEY (StakeholderId)  
REFERENCES dbo.stakeholders(Id);

CREATE INDEX IX\_Viewings\_ApartmentId  
ON dbo.apartmentViewings (ApartmentId);

CREATE INDEX IX\_Viewings\_AgentStakeholderId  
ON dbo.apartmentViewings (AgentStakeholderId);

CREATE INDEX IX\_Viewings\_ViewedByStakeholderId  
ON dbo.apartmentViewings (ViewedByStakeholderId);

CREATE INDEX IX\_Viewings\_ViewingDate  
ON dbo.apartmentViewings (ViewingDate);

CREATE INDEX IX\_ViewingVisibility\_StakeholderId  
ON auth.apartmentViewingsVisibility (StakeholderId);

