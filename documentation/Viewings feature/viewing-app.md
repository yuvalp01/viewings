## Viewings – Full Business Improvement Plan

This document explains how to fully use the new DB structures to improve the viewing workflow, reduce mistakes, and make more accurate investment decisions. All stages are integrated with the new tables: `viewings`, `viewingCostItems`, and `auth.viewingsVisibility`.

---

### ⭐ Stage 1 — Remote Analysis (Before Visiting)

When receiving ad links from agents, record only the basic information.

### **Fields recorded:**

* Address

* Size

* Price

* Bedrooms

* Floor

* IsElevator

* ConstructionYear

* LinkAd

* AgentStakeholderId

### **System behavior:**

* Creates a new viewing record in “Options to Consider”.

* No visit scheduled yet.

### **Business benefits:**

* Nothing gets lost in WhatsApp.

* You can compare ads side‑by‑side.

* Helps decide which apartments deserve a viewing.

---

### ⭐ Stage 2 — Decision to Visit & Scheduling

Once an apartment is approved for a visit.

### **Fields recorded:**

* ViewingDate

* ViewedByStakeholderId

### **System behavior:**

* Moves viewing to “Scheduled”.

* Notifies or displays tasks for the assigned visitor.

### **Business benefits:**

* Full visibility of upcoming visits.

* Clear responsibility over who goes where.

* Zero missed visits.

---

### ⭐ Stage 3 — During the Visit (On-Site Assessment)

Capture all details observable only on-site.

### **Fields recorded:**

* IsSecurityDoor

* BuildingSecurityDoorsPercent

* AluminumWindowsLevel

* RenovationKitchenLevel

* RenovationBathroomLevel

* RenovationLevel

* ViewLevel

* BalconyLevel

* BuildingLobbyLevel

* BuildingMaintenanceLevel

### **System behavior:**

* Mobile-friendly checklist.

* Visitor fills items directly during the visit.

### **Business benefits:**

* Standardized evaluation across all visits.

* No forgotten details.

* Enables quality scoring and comparison.

---

### ⭐ Stage 4 — After the Visit (Office Work)

Add information requiring office analysis.

### **Fields recorded:**

* MetroStationDistanceLevel

* LinkAddress

* LinkToPhotos

* Transportation

* Comments

* ExpectedMinimalRent

### **System behavior:**

* Highlights unfilled fields from previous stages.

* Provides a clean space for analysis.

### **Business benefits:**

* Complete dataset for each viewing.

* All photos, maps, and notes are centralized.

---

### ⭐ Stage 5 — Expected Additional Expenses (Critical for Comparison)

Use `viewingCostItems` to estimate real cost differences between the potential apartments.

### **Table fields:**

* AccountId (FK to accounts)

* Description

* Amount (positive \= cost, negative \= savings)

### **Examples:**

| Description | Amount |
| ----- | ----- |
| Paint kitchen | \+300 € |
| Install 2 AC units | \+500 € |
| Tenant already in place (save commission) | –400 € |

### **System behavior:**

* Shows **Total Estimated Cost Impact**.

* Can combine with ExpectedMinimalRent for yield analysis.

### **Business benefits:**

* True comparison between apartments.

* Identifies hidden costs early.

* Helps explain ROI to investors with clarity.

---

### ⭐ Stage 6 — Stakeholder Visibility Assignment

Control who can access each viewing.

### **Table: `auth.viewingsVisibility`**

* ViewingId

* StakeholderId

### **System behavior:**

* Multi-select of stakeholders.

* Only selected stakeholders see the viewing.

### **Business benefits:**

* Secure sharing.

* Internal roles clearly defined.

* Cleaner collaboration.

---

# **📊 Summary by Stage**

### **Remote analysis (before visiting)**

* Address

* Size

* Price

* Bedrooms

* Floor

* IsElevator

* ConstructionYear

* LinkAd

* AgentStakeholderId

### **Just before the visit**

* ViewingDate

* ViewedByStakeholderId

### **During the visit (on-site)**

* IsSecurityDoor

* BuildingSecurityDoorsPercent

* AluminumWindowsLevel

* RenovationKitchenLevel

* RenovationBathroomLevel

* RenovationLevel

* ViewLevel

* BalconyLevel

* BuildingLobbyLevel

* BuildingMaintenanceLevel

### **After the visit (office)**

* MetroStationDistanceLevel

* LinkAddress

* LinkToPhotos

* Transportation

* Comments

* ExpectedMinimalRent

### **Additional expenses**

* Add rows to viewingCostItems

### **Visibility**

* Assign which stakeholders can view the record

---

# **🚀 Overall Business Improvements**

* End‑to‑end structured workflow.

* Better pre‑visit filtering.

* Stronger on‑site documentation.

* Accurate cost & ROI estimation.

* Smart comparison between viewings.

* Professional process for investors.

* Centralized photos, notes, quality, and cost data.

---

