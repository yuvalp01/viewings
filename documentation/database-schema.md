# Database Schema Documentation

**Generated:** 2026-10-21 08:34:03
**Database:** yns-db-test2

## Table of Contents

- [accounts](#accounts)
- [activityLog](#activitylog)
- [apartments](#apartments)
- [bankAccounts](#bankaccounts)
- [costEstimates](#costestimates)
- [costEstimateTemplates](#costestimatetemplates)
- [discussionMentions](#discussionmentions)
- [discussionMessages](#discussionmessages)
- [discussionReads](#discussionreads)
- [discussionThreads](#discussionthreads)
- [documents](#documents)
- [documentTypes](#documenttypes)
- [insurances](#insurances)
- [investorEveningInvites](#investoreveninginvites)
- [investorEvenings](#investorevenings)
- [investorTaxPayments](#investortaxpayments)
- [leases](#leases)
- [lkp_apartmentStatus](#lkp-apartmentstatus)
- [lkp_investmentType](#lkp-investmenttype)
- [lkp_investorEveningInviteStatus](#lkp-investoreveninginvitestatus)
- [lkp_personalTransTypes](#lkp-personaltranstypes)
- [lkp_qualityLevel](#lkp-qualitylevel)
- [lkp_stakeholderTypes](#lkp-stakeholdertypes)
- [lkp_taskResponsibility](#lkp-taskresponsibility)
- [lkp_viewingExtras](#lkp-viewingextras)
- [lkp_viewingOutcomeStatus](#lkp-viewingoutcomestatus)
- [managementFees](#managementfees)
- [permissions](#permissions)
- [personalTransactions](#personaltransactions)
- [portfolios](#portfolios)
- [rentCharges](#rentcharges)
- [reportExceptionSnoozes](#reportexceptionsnoozes)
- [role_permissions](#role-permissions)
- [roles](#roles)
- [sprints](#sprints)
- [stakeholder_roles](#stakeholder-roles)
- [stakeholderNotes](#stakeholdernotes)
- [stakeholders](#stakeholders)
- [stakeholderStageItemChecks](#stakeholderstageitemchecks)
- [stakeholderStageItems](#stakeholderstageitems)
- [stakeholderStages](#stakeholderstages)
- [stakeholderViewings](#stakeholderviewings)
- [taskApartmentStages](#taskapartmentstages)
- [tasksApartment](#tasksapartment)
- [taskTemplates](#tasktemplates)
- [transactions](#transactions)
- [users](#users)
- [viewingExtraItems](#viewingextraitems)
- [viewings](#viewings)
- [viewingsVisibility](#viewingsvisibility)

---

## accounts

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | NVARCHAR(MAX) | YES |  |  |  |
| IsIncome | BIT | NO |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |
| IsPurchaseCostDefault | SMALLINT(5) | NO | -1 |  |  |
| IsHidden | BIT | NO | 0 |  |  |
| IsDeleted | BIT | NO | 0 |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_accounts | PRIMARY KEY | ✓ | Id |

---

## activityLog

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| OccurredAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| ActorStakeholderId | INT(10) | YES |  |  | → stakeholders.Id |
| EntityType | NVARCHAR(50) | NO |  |  |  |
| EntityId | INT(10) | NO |  |  |  |
| Action | NVARCHAR(30) | NO |  |  |  |
| Summary | NVARCHAR(500) | YES |  |  |  |
| ChangesJson | NVARCHAR(MAX) | YES |  |  |  |
| MetadataJson | NVARCHAR(MAX) | YES |  |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_activityLog_ActorStakeholder**
  - Columns: ActorStakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: SET NULL

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__activity__3214EC072854830C | PRIMARY KEY | ✓ | Id |
| IX_activityLog_Actor | NONCLUSTERED |  | ActorStakeholderId, OccurredAt |
| IX_activityLog_Entity | NONCLUSTERED |  | EntityType, EntityId, OccurredAt |
| IX_activityLog_OccurredAt | NONCLUSTERED |  | OccurredAt |

### Check Constraints

- **CK_activityLog_Action**: `([Action]=N'closed' OR [Action]=N'activated' OR [Action]=N'sprint_changed' OR [Action]=N'status_changed' OR [Action]=N'bulk_generated' OR [Action]=N'deleted' OR [Action]=N'updated' OR [Action]=N'created')`
- **CK_activityLog_ChangesJson**: `([ChangesJson] IS NULL OR isjson([ChangesJson])=(1))`
- **CK_activityLog_MetadataJson**: `([MetadataJson] IS NULL OR isjson([MetadataJson])=(1))`

---

## apartments

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Address | NVARCHAR(MAX) | YES |  |  |  |
| Status | SMALLINT(5) | NO |  |  |  |
| PurchaseDate | DATETIME2 | YES |  |  |  |
| Floor | INT(10) | YES |  |  |  |
| Size | INT(10) | YES |  |  |  |
| Door | NVARCHAR(50) | YES |  |  |  |
| InvestmentType | INT(10) | NO |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| ManagementFeePercentage | DECIMAL(4,2) | NO | 0.10 |  |  |
| Price | DECIMAL(9,2) | YES |  |  |  |
| TotalInvestment | DECIMAL(9,2) | YES |  |  |  |
| IsUnderDiscussion | BIT | NO | 0 |  |  |
| Bedrooms | DECIMAL(3,1) | YES |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| StageId | INT(10) | YES | 1 |  | → taskApartmentStages.Id |
| LinkToPhotos | NVARCHAR(255) | YES |  |  |  |
| SaleDate | DATE | YES |  |  |  |
| SalePrice | DECIMAL(18,2) | YES |  |  |  |
| TotalSaleCost | DECIMAL(18,2) | YES |  |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_apartments_StageId_taskApartmentStages**
  - Columns: StageId
  - References: taskApartmentStages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__apartmen__3214EC07A6DEB8C7 | PRIMARY KEY | ✓ | Id |

---

## bankAccounts

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | NVARCHAR(50) | YES |  |  |  |
| StakeholderId | INT(10) | YES |  |  |  |
| Iban | VARCHAR(50) | YES |  |  |  |
| Bic | VARCHAR(50) | YES |  |  |  |
| UserNameBank | NVARCHAR(50) | YES |  |  |  |
| LinkToWebsite | NVARCHAR(200) | YES |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| BankName | NVARCHAR(50) | YES |  |  |  |
| BankAddress | NVARCHAR(50) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__bankAcco__3214EC071E6F18CE | PRIMARY KEY | ✓ | Id |

---

## costEstimates

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ApartmentId | INT(10) | NO |  |  | → apartments.Id |
| AccountId | INT(10) | NO |  |  | → accounts.Id |
| TransactionType | VARCHAR(20) | NO | 'Purchase' |  |  |
| PaymentOption | VARCHAR(30) | YES |  |  |  |
| EstimatedAmount | DECIMAL(18,2) | NO |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| CostEstimateTemplateId | INT(10) | YES |  |  | → costEstimateTemplates.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_costEstimates_Accounts**
  - Columns: AccountId
  - References: accounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_costEstimates_Apartments**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_costEstimates_costEstimateTemplates**
  - Columns: CostEstimateTemplateId
  - References: costEstimateTemplates(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_costEstimates | PRIMARY KEY | ✓ | Id |
| IX_costEstimates_ApartmentId_IsDeleted | NONCLUSTERED |  | AccountId, EstimatedAmount, TransactionType, PaymentOption, ApartmentId, IsDeleted |
| IX_costEstimates_CostEstimateTemplateId | NONCLUSTERED |  | CostEstimateTemplateId |

### Check Constraints

- **CK_costEstimates_PaymentOption**: `([PaymentOption] IS NULL OR ([PaymentOption]='Owner' OR [PaymentOption]='Internal' OR [PaymentOption]='OnBehalf' OR [PaymentOption]='Benefit' OR [PaymentOption]='Virtual' OR [PaymentOption]='Charge' OR [PaymentOption]='Legacy' OR [PaymentOption]='Rebate'))`
- **CK_costEstimates_TransactionType**: `([TransactionType]='Sale' OR [TransactionType]='Maintenance' OR [TransactionType]='Purchase')`

---

## costEstimateTemplates

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| AccountId | INT(10) | NO |  |  | → accounts.Id |
| TransactionType | VARCHAR(20) | NO | 'Purchase' |  |  |
| PaymentOption | VARCHAR(30) | YES |  |  |  |
| CalculationType | VARCHAR(20) | NO | 'Fixed' |  |  |
| DefaultAmount | DECIMAL(18,2) | YES |  |  |  |
| DefaultPercentage | DECIMAL(5,2) | YES |  |  |  |
| MinAmount | DECIMAL(18,2) | YES |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| IsActive | BIT | NO | 1 |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_costEstimateTemplates_Accounts**
  - Columns: AccountId
  - References: accounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_costEstimateTemplates | PRIMARY KEY | ✓ | Id |
| IX_costEstimateTemplates_AccountId_IsActive | NONCLUSTERED |  | AccountId, IsActive |

### Check Constraints

- **CK_costEstimateTemplates_CalculationType**: `([CalculationType]='Percentage' OR [CalculationType]='Fixed')`
- **CK_costEstimateTemplates_PaymentOption**: `([PaymentOption] IS NULL OR ([PaymentOption]='Owner' OR [PaymentOption]='Internal' OR [PaymentOption]='OnBehalf' OR [PaymentOption]='Benefit' OR [PaymentOption]='Virtual' OR [PaymentOption]='Charge' OR [PaymentOption]='Legacy' OR [PaymentOption]='Rebate'))`
- **CK_costEstimateTemplates_TransactionType**: `([TransactionType]='Sale' OR [TransactionType]='Maintenance' OR [TransactionType]='Purchase')`

---

## discussionMentions

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| MessageId | INT(10) | NO |  |  | → discussionMessages.Id |
| MentionedStakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| CreatedAt | DATETIME2 | NO | getdate( |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_Mentions_Message**
  - Columns: MessageId
  - References: discussionMessages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Mentions_Stakeholder**
  - Columns: MentionedStakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__discussi__3214EC0717523641 | PRIMARY KEY | ✓ | Id |
| UQ_Message_Mention | NONCLUSTERED | ✓ | MessageId, MentionedStakeholderId |
| IX_discussionMentions_MentionedStakeholderId | NONCLUSTERED |  | MentionedStakeholderId |
| IX_discussionMentions_MessageId | NONCLUSTERED |  | MessageId |

### Unique Constraints

- **UQ_Message_Mention**: MessageId, MentionedStakeholderId

---

## discussionMessages

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ThreadId | INT(10) | NO |  |  | → discussionThreads.Id |
| AuthorId | INT(10) | NO |  |  | → stakeholders.Id |
| MessageHtml | NVARCHAR(MAX) | NO |  |  |  |
| CreatedAt | DATETIME2 | NO | getdate( |  |  |
| UpdatedAt | DATETIME2 | YES |  |  |  |
| CommunicationMethod | VARCHAR(20) | YES |  |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK__discussio__Autho__00FF1D08**
  - Columns: AuthorId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK__discussio__Threa__000AF8CF**
  - Columns: ThreadId
  - References: discussionThreads(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__discussi__3214EC07D936D215 | PRIMARY KEY | ✓ | Id |

### Check Constraints

- **CK_discussionMessages_CommunicationMethod**: `([CommunicationMethod]='Other' OR [CommunicationMethod]='Phone' OR [CommunicationMethod]='Message' OR [CommunicationMethod]='Email')`

---

## discussionReads

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| MessageId | INT(10) | NO |  | ✓ |  |
| StakeholderId | INT(10) | NO |  | ✓ | → stakeholders.Id |
| ReadAt | DATETIME2 | NO | getdate( |  |  |

### Primary Keys

- **MessageId**
- **StakeholderId**

### Foreign Keys

- **FK_discussionReads_Stakeholder**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_discussionReads | PRIMARY KEY | ✓ | MessageId, StakeholderId |
| IX_discussionReads_StakeholderId | NONCLUSTERED |  | StakeholderId |

---

## discussionThreads

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| EntityType | NVARCHAR(50) | NO |  |  |  |
| EntityId | INT(10) | NO |  |  |  |
| CreatedBy | INT(10) | NO |  |  | → stakeholders.Id |
| CreatedAt | DATETIME2 | NO | getdate( |  |  |
| Title | NVARCHAR(255) | YES |  |  |  |
| ClosedAt | DATETIME2 | YES |  |  |  |
| ClosedBy | INT(10) | YES |  |  | → stakeholders.Id |
| IsExternal | BIT | NO | 0 |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK__discussio__Creat__7C3A67EB**
  - Columns: CreatedBy
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_discussionThreads_ClosedBy_StakeholderId**
  - Columns: ClosedBy
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__discussi__3214EC07EDF264FD | PRIMARY KEY | ✓ | Id |
| IX_discussionThreads_ClosedBy | NONCLUSTERED |  | ClosedBy |

---

## documents

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| EntityType | TINYINT(3) | NO |  |  |  |
| EntityId | INT(10) | NO |  |  |  |
| DocumentTypeId | INT(10) | NO |  |  | → documentTypes.Id |
| Link | NVARCHAR(255) | YES |  |  |  |
| Title | NVARCHAR(255) | YES |  |  |  |
| Notes | NVARCHAR(MAX) | YES |  |  |  |
| CreatedAt | DATETIME2 | NO | sysdatetime( |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK__documents__Docum__3A02903A**
  - Columns: DocumentTypeId
  - References: documentTypes(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__document__3214EC07E7E2FFD4 | PRIMARY KEY | ✓ | Id |

### Check Constraints

- **CK_documents_EntityType**: `([EntityType]=(2) OR [EntityType]=(1))`

---

## documentTypes

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| EntityType | TINYINT(3) | NO |  |  |  |
| Name | NVARCHAR(50) | NO |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |
| Name_he | NVARCHAR(50) | NO |  |  |  |
| Description_he | NVARCHAR(255) | YES |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__document__3214EC075E38116E | PRIMARY KEY | ✓ | Id |

---

## insurances

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ApartmentId | INT(10) | YES |  |  |  |
| Company | NVARCHAR(50) | YES |  |  |  |
| Price | DECIMAL(18,2) | YES |  |  |  |
| DateStart | DATETIME2 | YES |  |  |  |
| DateEnd | DATETIME2 | YES |  |  |  |
| IsDeleted | BIT | YES | 0 |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_insurances | PRIMARY KEY | ✓ | Id |

---

## investorEveningInvites

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| EveningId | INT(10) | NO |  | ✓ | → investorEvenings.Id |
| StakeholderId | INT(10) | NO |  | ✓ | → stakeholders.Id |
| StatusId | TINYINT(3) | NO | 1 |  | → lkp_investorEveningInviteStatus.Id |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| UpdatedAt | DATETIME2 | YES |  |  |  |

### Primary Keys

- **EveningId**
- **StakeholderId**

### Foreign Keys

- **FK_investorEveningInvites_Evening**
  - Columns: EveningId
  - References: investorEvenings(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_investorEveningInvites_Stakeholder**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_investorEveningInvites_Status**
  - Columns: StatusId
  - References: lkp_investorEveningInviteStatus(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_investorEveningInvites | PRIMARY KEY | ✓ | EveningId, StakeholderId |
| IX_investorEveningInvites_StakeholderId | NONCLUSTERED |  | StakeholderId |
| IX_investorEveningInvites_StatusId | NONCLUSTERED |  | StatusId |

---

## investorEvenings

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Title | NVARCHAR(255) | NO |  |  |  |
| EventAt | DATETIME2 | NO |  |  |  |
| Location | NVARCHAR(255) | YES |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__investor__3214EC0750EE194E | PRIMARY KEY | ✓ | Id |
| IX_investorEvenings_EventAt | NONCLUSTERED |  | EventAt |

---

## investorTaxPayments

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| Year | SMALLINT(5) | NO |  |  |  |
| ActualAmount | DECIMAL(18,2) | NO |  |  |  |
| PaymentDate | DATETIME2 | NO |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| CreatedAt | DATETIME2 | NO | getdate( |  |  |
| UpdatedAt | DATETIME2 | YES |  |  |  |
| BankAccountId | INT(10) | YES |  |  | → bankAccounts.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_investorTaxPayments_BankAccountId_bankAccounts**
  - Columns: BankAccountId
  - References: bankAccounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_investorTaxPayments_StakeholderId_stakeholders**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_investorTaxPayments | PRIMARY KEY | ✓ | Id |
| IX_investorTaxPayments_BankAccountId | NONCLUSTERED |  | BankAccountId |
| IX_investorTaxPayments_StakeholderId | NONCLUSTERED |  | StakeholderId |

---

## leases

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ApartmentId | INT(10) | NO |  |  | → apartments.Id |
| Tenant | NVARCHAR(MAX) | YES |  |  |  |
| TenantPhone | NVARCHAR(MAX) | YES |  |  |  |
| TenantEmail | NVARCHAR(MAX) | YES |  |  |  |
| DateStart | DATETIME2 | YES |  |  |  |
| DateEnd | DATETIME2 | YES |  |  |  |
| PaymentDay | INT(10) | NO |  |  |  |
| Price | DECIMAL(18,2) | NO |  |  |  |
| PenaltyPerDay | DECIMAL(18,2) | NO |  |  |  |
| Deposit | DECIMAL(18,2) | NO |  |  |  |
| Link | NVARCHAR(MAX) | YES |  |  |  |
| Conditions | NVARCHAR(MAX) | YES |  |  |  |
| IsElectriciyChanged | BIT | NO | 0 |  |  |
| IsDeleted | BIT | NO |  |  |  |
| BankAccountId | INT(10) | NO |  |  |  |
| IsTaxUpload | BIT | NO | 0 |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_leases_apartments_ApartmentId**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_contracts | PRIMARY KEY | ✓ | Id |
| IX_contracts_ApartmentId | NONCLUSTERED |  | ApartmentId |

---

## lkp_apartmentStatus

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | VARCHAR(50) | NO |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_apar__3214EC0735D8118C | PRIMARY KEY | ✓ | Id |
| UQ__lkp_apar__737584F6AD1A80C8 | NONCLUSTERED | ✓ | Name |

### Unique Constraints

- **UQ__lkp_apar__737584F6AD1A80C8**: Name

---

## lkp_investmentType

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | VARCHAR(50) | NO |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_inve__3214EC074A5F5F7B | PRIMARY KEY | ✓ | Id |

---

## lkp_investorEveningInviteStatus

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | TINYINT(3) | NO |  | ✓ |  |
| Name | NVARCHAR(50) | NO |  |  |  |
| Description | NVARCHAR(250) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_inve__3214EC07DD149AAB | PRIMARY KEY | ✓ | Id |

---

## lkp_personalTransTypes

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | VARCHAR(20) | YES |  |  |  |
| DefaultDirection | VARCHAR(10) | YES |  |  |  |
| Name_he | NVARCHAR(50) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_pers__3214EC0711735D8D | PRIMARY KEY | ✓ | Id |

---

## lkp_qualityLevel

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | TINYINT(3) | NO |  | ✓ |  |
| Name | VARCHAR(20) | NO |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_qual__3214EC07EE6A9AFD | PRIMARY KEY | ✓ | Id |

---

## lkp_stakeholderTypes

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | VARCHAR(20) | YES |  |  |  |
| Description | NVARCHAR(250) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_stak__3214EC07EAA355DE | PRIMARY KEY | ✓ | Id |

---

## lkp_taskResponsibility

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | TINYINT(3) | NO |  | ✓ |  |
| Name | NVARCHAR(50) | NO |  |  |  |
| Name_he | NVARCHAR(50) | NO |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_task__3214EC07FCE209DB | PRIMARY KEY | ✓ | Id |

---

## lkp_viewingExtras

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | VARCHAR(20) | NO |  |  |  |
| Description | NVARCHAR(MAX) | NO |  |  |  |
| Estimation | DECIMAL(18,2) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__lkp_view__3214EC07BD0ABAEC | PRIMARY KEY | ✓ | Id |

---

## lkp_viewingOutcomeStatus

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | NVARCHAR(50) | NO |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_lkp_viewingOutcomeStatus | PRIMARY KEY | ✓ | Id |
| UQ_lkp_viewingOutcomeStatus_Name | NONCLUSTERED | ✓ | Name |

### Unique Constraints

- **UQ_lkp_viewingOutcomeStatus_Name**: Name

---

## managementFees

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ApartmentId | INT(10) | NO |  |  | → apartments.Id |
| Price | DECIMAL(18,2) | NO |  |  |  |
| DateStart | DATETIME2 | NO |  |  |  |
| DateEnd | DATETIME2 | YES |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| TransactionId | INT(10) | YES |  |  | → transactions.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_managementFees_ApartmentId**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_managementFees_transactions_TransactionId**
  - Columns: TransactionId
  - References: transactions(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__manageme__3214EC071FAD8733 | PRIMARY KEY | ✓ | Id |

---

## permissions

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Code | NVARCHAR(100) | NO |  |  |  |
| Category | NVARCHAR(50) | YES |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__permissi__3214EC0758D807B9 | PRIMARY KEY | ✓ | Id |
| UQ__permissi__A25C5AA7DC54B7F0 | NONCLUSTERED | ✓ | Code |

### Unique Constraints

- **UQ__permissi__A25C5AA7DC54B7F0**: Code

---

## personalTransactions

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Amount | DECIMAL(18,2) | NO |  |  |  |
| Date | DATETIME2 | NO |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| StakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| ApartmentId | INT(10) | NO | 0 |  | → apartments.Id |
| TransactionType | INT(10) | NO | 0 |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| CreditStakeholderId | INT(10) | NO | 0 |  |  |
| DebitStakeholderId | INT(10) | NO | 0 |  |  |
| AmountAbsolute | DECIMAL(18,2) | NO | 0 |  |  |
| DateCreated | DATETIME2 | NO | getdate( |  |  |
| DateModified | DATETIME2 | YES | getdate( |  |  |
| BankAccountId | INT(10) | YES |  |  | → bankAccounts.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_personalTransactions_apartments_ApartmentId**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_personalTransactions_bankAccounts_BankAccountId**
  - Columns: BankAccountId
  - References: bankAccounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_personalTransactions_stakeholders_StakeholderId**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: CASCADE

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_personalTransactions | PRIMARY KEY | ✓ | Id |
| IX_personalTransactions_ApartmentId | NONCLUSTERED |  | ApartmentId |
| IX_personalTransactions_StakeholderId | NONCLUSTERED |  | StakeholderId |

---

## portfolios

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StakeholderId | INT(10) | NO |  |  |  |
| ApartmentId | INT(10) | NO |  |  |  |
| Percentage | DECIMAL(5,2) | NO |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__portfoli__3214EC079AD39AC5 | PRIMARY KEY | ✓ | Id |

---

## rentCharges

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| LeaseId | INT(10) | NO |  |  | → leases.Id |
| ApartmentId | INT(10) | NO |  |  |  |
| ChargeDate | DATE | NO |  |  |  |
| ChargeMonth | DATE | YES |  |  |  |
| DueDate | DATE | NO |  |  |  |
| Amount | DECIMAL(10,2) | NO |  |  |  |
| AccountId | INT(10) | NO |  |  | → accounts.Id |
| Comments | NVARCHAR(255) | YES |  |  |  |
| CreatedAt | DATETIME2 | YES | getdate( |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **dbo.FK_RentCharges_Leases**
  - Columns: LeaseId
  - References: leases(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_RentCharges_Accounts**
  - Columns: AccountId
  - References: accounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__rentChar__3214EC07FF998D32 | PRIMARY KEY | ✓ | Id |
| UQ_RentCharges_LeaseMonthType | NONCLUSTERED | ✓ | LeaseId, ChargeMonth, AccountId |

---

## reportExceptionSnoozes

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ReportKey | NVARCHAR(100) | NO |  |  |  |
| EntityId | NVARCHAR(50) | NO |  |  |  |
| SnoozeUntil | DATETIME2 | YES |  |  |  |
| Reason | NVARCHAR(500) | YES |  |  |  |
| CreatedAt | DATETIME2 | NO | getutcdate( |  |  |
| CreatedBy | NVARCHAR(100) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__reportEx__3214EC07753974CE | PRIMARY KEY | ✓ | Id |
| UQ_reportExceptionSnoozes_ReportKey_EntityId | NONCLUSTERED | ✓ | ReportKey, EntityId |
| IX_reportExceptionSnoozes_Active | NONCLUSTERED |  | ReportKey, SnoozeUntil |
| IX_reportExceptionSnoozes_ReportKey | NONCLUSTERED |  | ReportKey |

### Unique Constraints

- **UQ_reportExceptionSnoozes_ReportKey_EntityId**: ReportKey, EntityId

---

## role_permissions

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| RoleId | INT(10) | NO |  | ✓ | → roles.Id |
| PermissionId | INT(10) | NO |  | ✓ | → permissions.Id |

### Primary Keys

- **RoleId**
- **PermissionId**

### Foreign Keys

- **FK_RolePermissions_PermissionId**
  - Columns: PermissionId
  - References: permissions(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_RolePermissions_RoleId**
  - Columns: RoleId
  - References: roles(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__role_per__6400A1A8DBBE77B2 | PRIMARY KEY | ✓ | RoleId, PermissionId |

---

## roles

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | NVARCHAR(100) | NO |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__roles__3214EC073D932D35 | PRIMARY KEY | ✓ | Id |
| UQ__roles__737584F6FDB3165F | NONCLUSTERED | ✓ | Name |

### Unique Constraints

- **UQ__roles__737584F6FDB3165F**: Name

---

## sprints

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | NVARCHAR(100) | NO |  |  |  |
| StartsAt | DATE | NO |  |  |  |
| EndsAt | DATE | NO |  |  |  |
| Status | NVARCHAR(20) | NO |  |  |  |
| Focus | NVARCHAR(MAX) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__sprints__3214EC071EFA1059 | PRIMARY KEY | ✓ | Id |
| UX_sprints_one_active | NONCLUSTERED | ✓ | Status |
| IX_sprints_StartsAt | NONCLUSTERED |  | StartsAt |

### Check Constraints

- **CK_sprints_Dates**: `([EndsAt]>=[StartsAt])`
- **CK_sprints_Status**: `([Status]='Closed' OR [Status]='Active' OR [Status]='Planned')`

---

## stakeholder_roles

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| StakeholderId | INT(10) | NO |  | ✓ | → stakeholders.Id |
| RoleId | INT(10) | NO |  | ✓ | → roles.Id |

### Primary Keys

- **StakeholderId**
- **RoleId**

### Foreign Keys

- **FK_StakeholderRoles_RoleId**
  - Columns: RoleId
  - References: roles(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_StakeholderRoles_StakeholderId**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__stakehol__58D18F76FA8ABE3B | PRIMARY KEY | ✓ | StakeholderId, RoleId |

---

## stakeholderNotes

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| Body | NVARCHAR(MAX) | NO |  |  |  |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| CreatedBy | INT(10) | NO |  |  | → stakeholders.Id |
| IsDeleted | BIT | NO | 0 |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_stakeholderNotes_CreatedBy**
  - Columns: CreatedBy
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_stakeholderNotes_Stakeholder**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__stakehol__3214EC075537ED60 | PRIMARY KEY | ✓ | Id |
| IX_stakeholderNotes_StakeholderId | NONCLUSTERED |  | CreatedAt, StakeholderId |

---

## stakeholders

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO |  | ✓ |  |
| Name | NVARCHAR(MAX) | YES |  |  |  |
| Type | INT(10) | NO |  |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| Name_he | NVARCHAR(255) | YES |  |  |  |
| Email | NVARCHAR(200) | YES |  |  |  |
| Phone | NVARCHAR(50) | YES |  |  |  |
| Source | NVARCHAR(100) | YES |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| IsArchived | BIT | NO | 0 |  |  |
| ArchivedAt | DATETIME2 | YES |  |  |  |
| ArchiveReason | NVARCHAR(255) | YES |  |  |  |
| StageId | INT(10) | YES |  |  | → stakeholderStages.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_stakeholders_StageId_stakeholderStages**
  - Columns: StageId
  - References: stakeholderStages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_stakeholders | PRIMARY KEY | ✓ | Id |

---

## stakeholderStageItemChecks

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| ItemId | INT(10) | NO |  |  | → stakeholderStageItems.Id |
| Status | NVARCHAR(20) | NO | N'checked' |  |  |
| CheckedAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| CheckedByStakeholderId | INT(10) | YES |  |  | → stakeholders.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_stakeholderStageItemChecks_CheckedBy_stakeholders**
  - Columns: CheckedByStakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_stakeholderStageItemChecks_ItemId_stakeholderStageItems**
  - Columns: ItemId
  - References: stakeholderStageItems(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_stakeholderStageItemChecks_StakeholderId_stakeholders**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_stakeholderStageItemChecks | PRIMARY KEY | ✓ | Id |
| UQ_stakeholderStageItemChecks_Stakeholder_Item | NONCLUSTERED | ✓ | StakeholderId, ItemId |
| IX_stakeholderStageItemChecks_ItemId | NONCLUSTERED |  | ItemId |

### Unique Constraints

- **UQ_stakeholderStageItemChecks_Stakeholder_Item**: StakeholderId, ItemId

### Check Constraints

- **CK_stakeholderStageItemChecks_Status**: `([Status]=N'skipped' OR [Status]=N'checked')`

---

## stakeholderStageItems

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StageId | INT(10) | NO |  |  | → stakeholderStages.Id |
| Title | NVARCHAR(200) | NO |  |  |  |
| Title_he | NVARCHAR(200) | YES |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |
| IsActive | BIT | NO | 1 |  |  |
| ResponsibilityTypeId | TINYINT(3) | NO | 2 |  | → lkp_taskResponsibility.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_stakeholderStageItems_ResponsibilityTypeId**
  - Columns: ResponsibilityTypeId
  - References: lkp_taskResponsibility(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_stakeholderStageItems_StageId_stakeholderStages**
  - Columns: StageId
  - References: stakeholderStages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_stakeholderStageItems | PRIMARY KEY | ✓ | Id |
| IX_stakeholderStageItems_StageId | NONCLUSTERED |  | StageId, DisplayOrder, Id |

---

## stakeholderStages

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | NVARCHAR(100) | NO |  |  |  |
| Name_he | NVARCHAR(100) | YES |  |  |  |
| Description | NVARCHAR(255) | YES |  |  |  |
| Description_he | NVARCHAR(255) | YES |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |
| IsActive | BIT | NO | 1 |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_stakeholderStages | PRIMARY KEY | ✓ | Id |
| UQ_stakeholderStages_Name | NONCLUSTERED | ✓ | Name |

### Unique Constraints

- **UQ_stakeholderStages_Name**: Name

---

## stakeholderViewings

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| StakeholderId | INT(10) | NO |  | ✓ | → stakeholders.Id |
| ViewingId | INT(10) | NO |  | ✓ | → viewings.Id |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |

### Primary Keys

- **StakeholderId**
- **ViewingId**

### Foreign Keys

- **FK_stakeholderViewings_Stakeholder**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_stakeholderViewings_Viewing**
  - Columns: ViewingId
  - References: viewings(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_stakeholderViewings | PRIMARY KEY | ✓ | StakeholderId, ViewingId |
| IX_stakeholderViewings_ViewingId | NONCLUSTERED |  | ViewingId |

---

## taskApartmentStages

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Name | NVARCHAR(100) | NO |  |  |  |
| DisplayOrder | INT(10) | NO |  |  |  |
| Name_he | NVARCHAR(255) | YES |  |  |  |

### Primary Keys

- **Id**

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__taskApar__3214EC07D10C0D54 | PRIMARY KEY | ✓ | Id |
| UQ__taskApar__737584F6A0D1A42B | NONCLUSTERED | ✓ | Name |

### Unique Constraints

- **UQ__taskApar__737584F6A0D1A42B**: Name

---

## tasksApartment

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ApartmentId | INT(10) | NO |  |  | → apartments.Id |
| StageId | INT(10) | NO |  |  | → taskApartmentStages.Id |
| Name | NVARCHAR(300) | NO |  |  |  |
| Status | VARCHAR(20) | NO | 'Todo' |  |  |
| AssigneeStakeholderId | INT(10) | YES |  |  |  |
| DueAt | DATETIME2 | YES |  |  |  |
| ParentTaskId | INT(10) | YES |  |  | → tasksApartment.Id |
| CreatedFromTemplateId | INT(10) | YES |  |  |  |
| CreatedAt | DATETIME2 | NO | sysutcdatetime( |  |  |
| CreatedBy | INT(10) | YES |  |  |  |
| CompletedAt | DATETIME2 | YES |  |  |  |
| CompletedBy | INT(10) | YES |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |
| Description | NVARCHAR(MAX) | YES |  |  |  |
| Priority | INT(10) | NO | 2 |  |  |
| IsDeleted | BIT | NO | 0 |  |  |
| Name_he | NVARCHAR(255) | YES |  |  |  |
| Description_he | NVARCHAR(MAX) | YES |  |  |  |
| ResponsibilityTypeId | TINYINT(3) | NO | 2 |  | → lkp_taskResponsibility.Id |
| SprintId | INT(10) | YES |  |  | → sprints.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_tasksApartment_Apartment**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_tasksApartment_Parent**
  - Columns: ParentTaskId
  - References: tasksApartment(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_tasksApartment_Responsibility**
  - Columns: ResponsibilityTypeId
  - References: lkp_taskResponsibility(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_tasksApartment_Sprint**
  - Columns: SprintId
  - References: sprints(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_tasksApartment_Stage**
  - Columns: StageId
  - References: taskApartmentStages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__tasksApa__3214EC07263B71EA | PRIMARY KEY | ✓ | Id |
| IX_tasksApartment_IsDeleted | NONCLUSTERED |  | IsDeleted |
| IX_tasksApartment_SprintId | NONCLUSTERED |  | SprintId |

### Check Constraints

- **CK_tasksApartment_Priority**: `([Priority]=(3) OR [Priority]=(2) OR [Priority]=(1))`
- **CK_tasksApartment_Status**: `([Status]='Skipped' OR [Status]='Done' OR [Status]='Blocked' OR [Status]='In-Progress' OR [Status]='Todo' OR [Status]='Backlog')`

---

## taskTemplates

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StageTemplateId | INT(10) | NO |  |  | → taskApartmentStages.Id |
| Name | NVARCHAR(300) | NO |  |  |  |
| DefaultAssigneeStakeholderId | INT(10) | YES |  |  |  |
| ParentTemplateId | INT(10) | YES |  |  | → taskTemplates.Id |
| Description | NVARCHAR(MAX) | YES |  |  |  |
| DisplayOrder | INT(10) | NO | 0 |  |  |
| IsActive | BIT | NO | 1 |  |  |
| Name_he | NVARCHAR(255) | YES |  |  |  |
| Description_he | NVARCHAR(MAX) | YES |  |  |  |
| ResponsibilityTypeId | TINYINT(3) | NO | 2 |  | → lkp_taskResponsibility.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_taskTemplates_Parent**
  - Columns: ParentTemplateId
  - References: taskTemplates(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_taskTemplates_Responsibility**
  - Columns: ResponsibilityTypeId
  - References: lkp_taskResponsibility(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_taskTemplates_StageTemplate**
  - Columns: StageTemplateId
  - References: taskApartmentStages(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__taskTemp__3214EC0748AC4C39 | PRIMARY KEY | ✓ | Id |

---

## transactions

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Amount | DECIMAL(18,2) | NO |  |  |  |
| Date | DATETIME2 | NO |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| ApartmentId | INT(10) | NO |  |  | → apartments.Id |
| AccountId | INT(10) | NO |  |  | → accounts.Id |
| IsDeleted | BIT | NO | 0 |  |  |
| PersonalTransactionId | INT(10) | NO | 0 |  |  |
| BankAccountId | INT(10) | NO |  |  |  |
| RentChargeId | INT(10) | YES |  |  | → rentCharges.Id |
| Status | VARCHAR(10) | NO | 'Pending' |  |  |
| ParentTransactionId | INT(10) | YES |  |  |  |
| DateCreated | DATETIME2 | NO | getdate( |  |  |
| DateModified | DATETIME2 | YES | getdate( |  |  |
| PaymentOption | VARCHAR(10) | YES |  |  |  |
| StakeholderIdPaid | INT(10) | YES |  |  |  |
| TransactionType | VARCHAR(20) | NO |  |  |  |
| CostEstimateId | INT(10) | YES |  |  | → costEstimates.Id |
| InvestorTaxPaymentId | INT(10) | YES |  |  | → investorTaxPayments.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_transactions_accounts_AccountId**
  - Columns: AccountId
  - References: accounts(Id)
  - Update Rule: NO ACTION
  - Delete Rule: CASCADE
- **FK_transactions_apartments_ApartmentId**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_transactions_costEstimates**
  - Columns: CostEstimateId
  - References: costEstimates(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_transactions_InvestorTaxPaymentId**
  - Columns: InvestorTaxPaymentId
  - References: investorTaxPayments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_transactions_RentChargeId**
  - Columns: RentChargeId
  - References: rentCharges(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_transactions | PRIMARY KEY | ✓ | Id |
| IX_transactions_AccountId | NONCLUSTERED |  | AccountId |
| IX_transactions_ApartmentId | NONCLUSTERED |  | ApartmentId |
| IX_transactions_CostEstimateId | NONCLUSTERED |  | CostEstimateId |
| IX_transactions_InvestorTaxPaymentId | NONCLUSTERED |  | InvestorTaxPaymentId |

### Check Constraints

- **CK_transactions_TransactionType**: `([TransactionType]='Sale' OR [TransactionType]='Maintenance' OR [TransactionType]='Purchase')`

---

## users

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| StakeholderId | INT(10) | NO |  |  | → stakeholders.Id |
| Email | NVARCHAR(200) | NO |  |  |  |
| CreatedAt | DATETIME2 | YES | getdate( |  |  |
| IsActive | BIT | YES | 1 |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_Users_StakeholderId**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__users__3214EC07804CFAA5 | PRIMARY KEY | ✓ | Id |
| UQ__users__A9D105345D593D44 | NONCLUSTERED | ✓ | Email |
| IX_users_StakeholderId | NONCLUSTERED |  | StakeholderId |

### Unique Constraints

- **UQ__users__A9D105345D593D44**: Email

---

## viewingExtraItems

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| ViewingId | INT(10) | NO |  |  | → viewings.Id |
| ExtraId | INT(10) | NO |  |  | → lkp_viewingExtras.Id |
| Type | INT(10) | NO |  |  |  |
| Description | NVARCHAR(MAX) | NO |  |  |  |
| Amount | DECIMAL(18,2) | NO |  |  |  |
| CreatedAt | DATETIME2 | NO | sysdatetime( |  |  |
| UpdatedAt | DATETIME2 | NO | sysdatetime( |  |  |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_viewingExtraItems_lkp_viewingExtras**
  - Columns: ExtraId
  - References: lkp_viewingExtras(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_viewingExtraItems_Viewing**
  - Columns: ViewingId
  - References: viewings(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__viewingE__3214EC077607E141 | PRIMARY KEY | ✓ | Id |

---

## viewings

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| Id | INT(10) | NO | IDENTITY | ✓ |  |
| Address | NVARCHAR(MAX) | YES |  |  |  |
| Size | DECIMAL(9,2) | YES |  |  |  |
| Price | DECIMAL(18,2) | YES |  |  |  |
| Bedrooms | DECIMAL(3,1) | YES |  |  |  |
| Floor | DECIMAL(4,1) | YES |  |  |  |
| IsElevator | BIT | NO | 0 |  |  |
| ConstructionYear | SMALLINT(5) | YES |  |  |  |
| ViewingDate | DATETIME2 | YES |  |  |  |
| AgentStakeholderId | INT(10) | YES |  |  | → stakeholders.Id |
| ViewedByStakeholderId | INT(10) | YES |  |  | → stakeholders.Id |
| IsSecurityDoor | BIT | YES |  |  |  |
| BuildingSecurityDoorsPercent | TINYINT(3) | YES |  |  |  |
| AluminumWindowsLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| RenovationKitchenLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| RenovationBathroomLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| RenovationLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| ViewLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| BalconyLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| BuildingLobbyLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| BuildingMaintenanceLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| MetroStationDistanceLevel | TINYINT(3) | YES |  |  | → lkp_qualityLevel.Id |
| LinkAddress | NVARCHAR(500) | YES |  |  |  |
| LinkAd | NVARCHAR(1024) | YES |  |  |  |
| LinkToPhotos | NVARCHAR(500) | YES |  |  |  |
| Transportation | NVARCHAR(MAX) | YES |  |  |  |
| Comments | NVARCHAR(MAX) | YES |  |  |  |
| ExpectedMinimalRent | DECIMAL(18,2) | YES |  |  |  |
| ApartmentId | INT(10) | YES |  |  | → apartments.Id |
| IsDeleted | BIT | NO | 0 |  |  |
| IsArchive | BIT | NO | 0 |  |  |
| OverallLevel | TINYINT(3) | YES |  |  |  |
| OutcomeStatusId | INT(10) | YES |  |  | → lkp_viewingOutcomeStatus.Id |

### Primary Keys

- **Id**

### Foreign Keys

- **FK_Viewings_Agent**
  - Columns: AgentStakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_AluminumWindowsLevel**
  - Columns: AluminumWindowsLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_Apartment**
  - Columns: ApartmentId
  - References: apartments(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_BalconyLevel**
  - Columns: BalconyLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_BuildingLobbyLevel**
  - Columns: BuildingLobbyLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_BuildingMaintenanceLevel**
  - Columns: BuildingMaintenanceLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_MetroStationDistanceLevel**
  - Columns: MetroStationDistanceLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_OutcomeStatus**
  - Columns: OutcomeStatusId
  - References: lkp_viewingOutcomeStatus(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_RenovationBathroomLevel**
  - Columns: RenovationBathroomLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_RenovationKitchenLevel**
  - Columns: RenovationKitchenLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_RenovationLevel**
  - Columns: RenovationLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_ViewedBy**
  - Columns: ViewedByStakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_Viewings_ViewLevel**
  - Columns: ViewLevel
  - References: lkp_qualityLevel(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK__viewings__3214EC0711E36461 | PRIMARY KEY | ✓ | Id |
| IX_Viewings_AgentStakeholderId | NONCLUSTERED |  | AgentStakeholderId |
| IX_Viewings_ApartmentId | NONCLUSTERED |  | ApartmentId |
| IX_Viewings_OutcomeStatusId | NONCLUSTERED |  | OutcomeStatusId |
| IX_Viewings_ViewedByStakeholderId | NONCLUSTERED |  | ViewedByStakeholderId |
| IX_Viewings_ViewingDate | NONCLUSTERED |  | ViewingDate |

---

## viewingsVisibility

### Columns

| Column | Type | Nullable | Default | Primary Key | Foreign Key |
|--------|------|----------|---------|------------|-------------|
| ViewingId | INT(10) | NO |  | ✓ | → viewings.Id |
| StakeholderId | INT(10) | NO |  | ✓ | → stakeholders.Id |
| CreatedAt | DATETIME2 | NO | sysdatetime( |  |  |

### Primary Keys

- **ViewingId**
- **StakeholderId**

### Foreign Keys

- **FK_ViewingVisibility_Stakeholder**
  - Columns: StakeholderId
  - References: stakeholders(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION
- **FK_ViewingVisibility_Viewing**
  - Columns: ViewingId
  - References: viewings(Id)
  - Update Rule: NO ACTION
  - Delete Rule: NO ACTION

### Indexes

| Index Name | Type | Unique | Columns |
|------------|------|--------|----------|
| PK_viewingsVisibility | PRIMARY KEY | ✓ | ViewingId, StakeholderId |
| IX_ViewingVisibility_StakeholderId | NONCLUSTERED |  | StakeholderId |

---

## Relationships Diagram

```mermaid
erDiagram
    accounts {
        INT Id
        NVARCHAR Name
        BIT IsIncome
        INT DisplayOrder
        SMALLINT IsPurchaseCostDefault
        ... 2 more columns
    }
    activityLog {
        INT Id
        DATETIME2 OccurredAt
        INT ActorStakeholderId
        NVARCHAR EntityType
        INT EntityId
        ... 4 more columns
    }
    apartments {
        INT Id
        NVARCHAR Address
        SMALLINT Status
        DATETIME2 PurchaseDate
        INT Floor
        ... 15 more columns
    }
    bankAccounts {
        INT Id
        NVARCHAR Name
        INT StakeholderId
        VARCHAR Iban
        VARCHAR Bic
        ... 5 more columns
    }
    costEstimates {
        INT Id
        INT ApartmentId
        INT AccountId
        VARCHAR TransactionType
        VARCHAR PaymentOption
        ... 5 more columns
    }
    costEstimateTemplates {
        INT Id
        INT AccountId
        VARCHAR TransactionType
        VARCHAR PaymentOption
        VARCHAR CalculationType
        ... 5 more columns
    }
    discussionMentions {
        INT Id
        INT MessageId
        INT MentionedStakeholderId
        DATETIME2 CreatedAt
    }
    discussionMessages {
        INT Id
        INT ThreadId
        INT AuthorId
        NVARCHAR MessageHtml
        DATETIME2 CreatedAt
        ... 2 more columns
    }
    discussionReads {
        INT MessageId
        INT StakeholderId
        DATETIME2 ReadAt
    }
    discussionThreads {
        INT Id
        NVARCHAR EntityType
        INT EntityId
        INT CreatedBy
        DATETIME2 CreatedAt
        ... 4 more columns
    }
    documents {
        INT Id
        TINYINT EntityType
        INT EntityId
        INT DocumentTypeId
        NVARCHAR Link
        ... 3 more columns
    }
    documentTypes {
        INT Id
        TINYINT EntityType
        NVARCHAR Name
        NVARCHAR Description
        NVARCHAR Name_he
        ... 2 more columns
    }
    insurances {
        INT Id
        INT ApartmentId
        NVARCHAR Company
        DECIMAL Price
        DATETIME2 DateStart
        ... 2 more columns
    }
    investorEveningInvites {
        INT EveningId
        INT StakeholderId
        TINYINT StatusId
        DATETIME2 CreatedAt
        DATETIME2 UpdatedAt
    }
    investorEvenings {
        INT Id
        NVARCHAR Title
        DATETIME2 EventAt
        NVARCHAR Location
        NVARCHAR Comments
        ... 2 more columns
    }
    investorTaxPayments {
        INT Id
        INT StakeholderId
        SMALLINT Year
        DECIMAL ActualAmount
        DATETIME2 PaymentDate
        ... 4 more columns
    }
    leases {
        INT Id
        INT ApartmentId
        NVARCHAR Tenant
        NVARCHAR TenantPhone
        NVARCHAR TenantEmail
        ... 12 more columns
    }
    lkp_apartmentStatus {
        INT Id
        VARCHAR Name
        NVARCHAR Description
    }
    lkp_investmentType {
        INT Id
        VARCHAR Name
        NVARCHAR Description
    }
    lkp_investorEveningInviteStatus {
        TINYINT Id
        NVARCHAR Name
        NVARCHAR Description
    }
    lkp_personalTransTypes {
        INT Id
        VARCHAR Name
        VARCHAR DefaultDirection
        NVARCHAR Name_he
    }
    lkp_qualityLevel {
        TINYINT Id
        VARCHAR Name
        NVARCHAR Description
    }
    lkp_stakeholderTypes {
        INT Id
        VARCHAR Name
        NVARCHAR Description
    }
    lkp_taskResponsibility {
        TINYINT Id
        NVARCHAR Name
        NVARCHAR Name_he
    }
    lkp_viewingExtras {
        INT Id
        VARCHAR Name
        NVARCHAR Description
        DECIMAL Estimation
    }
    lkp_viewingOutcomeStatus {
        INT Id
        NVARCHAR Name
    }
    managementFees {
        INT Id
        INT ApartmentId
        DECIMAL Price
        DATETIME2 DateStart
        DATETIME2 DateEnd
        ... 3 more columns
    }
    permissions {
        INT Id
        NVARCHAR Code
        NVARCHAR Category
        NVARCHAR Description
    }
    personalTransactions {
        INT Id
        DECIMAL Amount
        DATETIME2 Date
        NVARCHAR Comments
        INT StakeholderId
        ... 9 more columns
    }
    portfolios {
        INT Id
        INT StakeholderId
        INT ApartmentId
        DECIMAL Percentage
    }
    rentCharges {
        INT Id
        INT LeaseId
        INT ApartmentId
        DATE ChargeDate
        DATE ChargeMonth
        ... 5 more columns
    }
    reportExceptionSnoozes {
        INT Id
        NVARCHAR ReportKey
        NVARCHAR EntityId
        DATETIME2 SnoozeUntil
        NVARCHAR Reason
        ... 2 more columns
    }
    role_permissions {
        INT RoleId
        INT PermissionId
    }
    roles {
        INT Id
        NVARCHAR Name
        NVARCHAR Description
    }
    sprints {
        INT Id
        NVARCHAR Name
        DATE StartsAt
        DATE EndsAt
        NVARCHAR Status
        ... 1 more columns
    }
    stakeholder_roles {
        INT StakeholderId
        INT RoleId
    }
    stakeholderNotes {
        INT Id
        INT StakeholderId
        NVARCHAR Body
        DATETIME2 CreatedAt
        INT CreatedBy
        ... 1 more columns
    }
    stakeholders {
        INT Id
        NVARCHAR Name
        INT Type
        BIT IsDeleted
        NVARCHAR Name_he
        ... 8 more columns
    }
    stakeholderStageItemChecks {
        INT Id
        INT StakeholderId
        INT ItemId
        NVARCHAR Status
        DATETIME2 CheckedAt
        ... 1 more columns
    }
    stakeholderStageItems {
        INT Id
        INT StageId
        NVARCHAR Title
        NVARCHAR Title_he
        INT DisplayOrder
        ... 2 more columns
    }
    stakeholderStages {
        INT Id
        NVARCHAR Name
        NVARCHAR Name_he
        NVARCHAR Description
        NVARCHAR Description_he
        ... 2 more columns
    }
    stakeholderViewings {
        INT StakeholderId
        INT ViewingId
        DATETIME2 CreatedAt
    }
    taskApartmentStages {
        INT Id
        NVARCHAR Name
        INT DisplayOrder
        NVARCHAR Name_he
    }
    tasksApartment {
        INT Id
        INT ApartmentId
        INT StageId
        NVARCHAR Name
        VARCHAR Status
        ... 16 more columns
    }
    taskTemplates {
        INT Id
        INT StageTemplateId
        NVARCHAR Name
        INT DefaultAssigneeStakeholderId
        INT ParentTemplateId
        ... 6 more columns
    }
    transactions {
        INT Id
        DECIMAL Amount
        DATETIME2 Date
        NVARCHAR Comments
        INT ApartmentId
        ... 14 more columns
    }
    users {
        INT Id
        INT StakeholderId
        NVARCHAR Email
        DATETIME2 CreatedAt
        BIT IsActive
    }
    viewingExtraItems {
        INT Id
        INT ViewingId
        INT ExtraId
        INT Type
        NVARCHAR Description
        ... 3 more columns
    }
    viewings {
        INT Id
        NVARCHAR Address
        DECIMAL Size
        DECIMAL Price
        DECIMAL Bedrooms
        ... 28 more columns
    }
    viewingsVisibility {
        INT ViewingId
        INT StakeholderId
        DATETIME2 CreatedAt
    }
    activityLog }o--o| stakeholders : "ActorStakeholderId -> Id"
    apartments }o--o| taskApartmentStages : "StageId -> Id"
    costEstimates }o--o| accounts : "AccountId -> Id"
    costEstimates }o--o| apartments : "ApartmentId -> Id"
    costEstimates }o--o| costEstimateTemplates : "CostEstimateTemplateId -> Id"
    costEstimateTemplates }o--o| accounts : "AccountId -> Id"
    discussionMentions }o--o| discussionMessages : "MessageId -> Id"
    discussionMentions }o--o| stakeholders : "MentionedStakeholderId -> Id"
    discussionMessages }o--o| stakeholders : "AuthorId -> Id"
    discussionMessages }o--o| discussionThreads : "ThreadId -> Id"
    discussionReads }o--o| stakeholders : "StakeholderId -> Id"
    discussionThreads }o--o| stakeholders : "CreatedBy -> Id"
    discussionThreads }o--o| stakeholders : "ClosedBy -> Id"
    documents }o--o| documentTypes : "DocumentTypeId -> Id"
    investorEveningInvites }o--o| investorEvenings : "EveningId -> Id"
    investorEveningInvites }o--o| stakeholders : "StakeholderId -> Id"
    investorEveningInvites }o--o| lkp_investorEveningInviteStatus : "StatusId -> Id"
    investorTaxPayments }o--o| bankAccounts : "BankAccountId -> Id"
    investorTaxPayments }o--o| stakeholders : "StakeholderId -> Id"
    leases }o--o| apartments : "ApartmentId -> Id"
    managementFees }o--o| apartments : "ApartmentId -> Id"
    managementFees }o--o| transactions : "TransactionId -> Id"
    personalTransactions }o--o| apartments : "ApartmentId -> Id"
    personalTransactions }o--o| bankAccounts : "BankAccountId -> Id"
    personalTransactions }o--o| stakeholders : "StakeholderId -> Id"
    rentCharges }o--o| leases : "LeaseId -> Id"
    rentCharges }o--o| accounts : "AccountId -> Id"
    role_permissions }o--o| permissions : "PermissionId -> Id"
    role_permissions }o--o| roles : "RoleId -> Id"
    stakeholder_roles }o--o| roles : "RoleId -> Id"
    stakeholder_roles }o--o| stakeholders : "StakeholderId -> Id"
    stakeholderNotes }o--o| stakeholders : "CreatedBy -> Id"
    stakeholderNotes }o--o| stakeholders : "StakeholderId -> Id"
    stakeholders }o--o| stakeholderStages : "StageId -> Id"
    stakeholderStageItemChecks }o--o| stakeholders : "CheckedByStakeholderId -> Id"
    stakeholderStageItemChecks }o--o| stakeholderStageItems : "ItemId -> Id"
    stakeholderStageItemChecks }o--o| stakeholders : "StakeholderId -> Id"
    stakeholderStageItems }o--o| lkp_taskResponsibility : "ResponsibilityTypeId -> Id"
    stakeholderStageItems }o--o| stakeholderStages : "StageId -> Id"
    stakeholderViewings }o--o| stakeholders : "StakeholderId -> Id"
    stakeholderViewings }o--o| viewings : "ViewingId -> Id"
    tasksApartment }o--o| apartments : "ApartmentId -> Id"
    tasksApartment }o--o| tasksApartment : "ParentTaskId -> Id"
    tasksApartment }o--o| lkp_taskResponsibility : "ResponsibilityTypeId -> Id"
    tasksApartment }o--o| sprints : "SprintId -> Id"
    tasksApartment }o--o| taskApartmentStages : "StageId -> Id"
    taskTemplates }o--o| taskTemplates : "ParentTemplateId -> Id"
    taskTemplates }o--o| lkp_taskResponsibility : "ResponsibilityTypeId -> Id"
    taskTemplates }o--o| taskApartmentStages : "StageTemplateId -> Id"
    transactions }o--o| accounts : "AccountId -> Id"
    transactions }o--o| apartments : "ApartmentId -> Id"
    transactions }o--o| costEstimates : "CostEstimateId -> Id"
    transactions }o--o| investorTaxPayments : "InvestorTaxPaymentId -> Id"
    transactions }o--o| rentCharges : "RentChargeId -> Id"
    users }o--o| stakeholders : "StakeholderId -> Id"
    viewingExtraItems }o--o| lkp_viewingExtras : "ExtraId -> Id"
    viewingExtraItems }o--o| viewings : "ViewingId -> Id"
    viewings }o--o| stakeholders : "AgentStakeholderId -> Id"
    viewings }o--o| lkp_qualityLevel : "AluminumWindowsLevel -> Id"
    viewings }o--o| apartments : "ApartmentId -> Id"
    viewings }o--o| lkp_qualityLevel : "BalconyLevel -> Id"
    viewings }o--o| lkp_qualityLevel : "BuildingLobbyLevel -> Id"
    viewings }o--o| lkp_qualityLevel : "BuildingMaintenanceLevel -> Id"
    viewings }o--o| lkp_qualityLevel : "MetroStationDistanceLevel -> Id"
    viewings }o--o| lkp_viewingOutcomeStatus : "OutcomeStatusId -> Id"
    viewings }o--o| lkp_qualityLevel : "RenovationBathroomLevel -> Id"
    viewings }o--o| lkp_qualityLevel : "RenovationKitchenLevel -> Id"
    viewings }o--o| lkp_qualityLevel : "RenovationLevel -> Id"
    viewings }o--o| stakeholders : "ViewedByStakeholderId -> Id"
    viewings }o--o| lkp_qualityLevel : "ViewLevel -> Id"
    viewingsVisibility }o--o| stakeholders : "StakeholderId -> Id"
    viewingsVisibility }o--o| viewings : "ViewingId -> Id"
```

## Summary Statistics

- **Total Tables:** 50
- **Total Columns:** 383
- **Total Foreign Keys:** 72
- **Total Indexes:** 100
