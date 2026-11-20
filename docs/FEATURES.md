# Simply Cashflow — Feature Reference Guide

**Version:** 2.0.0  
**Design Identity:** *"Your Money. Clearly."*  

Simply Cashflow 2.0 is divided into four primary navigation destinations and dedicated support workflows designed for speed, clarity, and control.

---

## 1. Beranda (Home Financial Dashboard)

The home dashboard delivers a calm, high-hierarchy view of your financial state:

- **Available Balance:** Real-time net available funds (`Total Income - Total Expenses`).
- **Monthly Inflow & Outflow:** Quick summary of earnings and expenditures for the current active month.
- **Safe to Spend Card:** Actionable daily spending guidance accounting for upcoming unpaid bills, reserve money, and planned savings allocations.
- **Smart Budget Pace Card:** Real-time velocity indicator comparing current spending against calendar progression, displaying current pace status (`under_pace`, `on_track`, `fast_pace`, or `overspent`) and a recommended daily spending allowance.
- **Quick Action Drawer:** Instant triggers to record an expense, record income, or contribute to an active savings goal.
- **Smart Capture Notice Badge:** Appears in the top header when unreviewed e-wallet or banking transactions are waiting in the review queue.
- **Recent Transactions Ledger:** Quick glance at the latest 5 transactions for the month with one-tap entry to the full Activity screen.

---

## 2. Aktivitas (Activity & Transaction Ledger)

A unified financial ledger designed for fast searching, filtering, and reconciliation:

- **Instant Search:** Dynamic full-text search matching transaction descriptions, categories, merchant names, and reference IDs.
- **Multi-Filter Chips:** Filter by transaction direction (`Semua`, `Pemasukan`, `Pengeluaran`), category, and payment source (`DANA`, `GoPay`, `OVO`, `ShopeePay`, `BCA`, `BRI`, `Mandiri`, `QRIS`, `Manual`).
- **Flexible Sorting:** Sort by Date (newest to oldest, or oldest to newest) or Amount (highest to lowest, or lowest to highest).
- **Calendar vs. List View Toggle:** Switch seamlessly between a chronological scroll list and a date-picked calendar ledger.
- **Adaptive Bottom Sheet Modal:** Ergonomic Android drag-sheet for adding or modifying transactions, complete with tabular IDR input formatting, category picker, date/time inputs, merchant tags, and delete confirmation with safeguards.

---

## 3. Wawasan (Financial Insights & Analytics)

A comprehensive visual analytics module powered by deterministic local calculations:

- **Financial Health Score:** An objective 0–100 score assessing your savings rate, budget discipline, and spending health, with actionable health badges (`Sangat Baik`, `Sehat`, `Perlu Perhatian`, `Kritis`).
- **Category Expense Breakdown:** Circular distribution and ranked spending list indicating exact Rupiah totals and percentage shares.
- **Weekly Spending Velocity Trends:** Bar chart visual comparing expenditure across Week 1, Week 2, Week 3, and Week 4 of the month.
- **Month-over-Month Comparison:** Compares current spending velocity against the previous calendar month.
- **Direct Recap Access:** Launch the Monthly Financial Recap directly from the analytics header.

---

## 4. Target Impian (Goals & Savings Planner 2.0)

Turn savings ambitions into manageable, milestone-tracked realities:

- **Milestone Progress Badges:** Automatic milestone markers celebrating 25%, 50%, 75%, and 100% completion.
- **Time & Velocity Estimates:** Dynamic projection of remaining days and estimated completion date based on historical contribution pace.
- **Contribution History Ledger:** Dedicated drawer inspecting each deposit made toward a savings goal, complete with dates and optional notes.
- **Quick Contribution Workflow:** Make instant deposits toward any goal with automatic calculation updates.
- **Goal Status Management:** Switch goals between `Aktif`, `Selesai`, `Jeda`, and `Arsip`.

---

## 5. Smart Transaction Capture Hub

Android notification-based transaction ingestion engine:

- **Supported Indonesian Services:** DANA, GoPay, OVO, ShopeePay, BCA mobile, BRImo, and Livin' by Mandiri.
- **Permission Monitor:** Real-time display of Android Notification Listener permission with one-tap navigation to system settings.
- **Source Toggles:** Enable or disable capture on a per-app basis.
- **Auto-Save Mode:** Automatically save high-confidence transactions ($\ge 85\%$) directly into SQLite, or route all transactions to the staging queue.
- **Pending Review Queue:** Review ambiguous or unverified transactions, edit suggested categories or merchants, and approve or discard with a single tap.
- **Diagnostics & Capture Log:** Detailed audit log showing package names, detected amounts, confidence scores, and timestamps.

---

## 6. Financial Calendar & Recurring Transactions

- **Financial Calendar (`/calendar`):** Interactive day-by-day matrix visualizing incoming income, outgoing expenses, bill due dates, and daily net cashflow.
- **Recurring Transactions (`/recurring`):** Schedule regular bills (utilities, subscriptions, internet, rent) or income (salary, allowance) with daily, weekly, monthly, or yearly frequencies. Supports manual pay confirmation and skip actions.

---

## 7. Monthly Recap & Data Portability

- **Monthly Recap (`/recap`):** An executive end-of-month financial report summarizing total income, total expenses, net savings rate, top spending category, and largest single expense. Includes one-tap CSV export.
- **Data Management (`/settings`):**
  - **Full JSON Backup & Restore:** Complete offline backup capturing transactions, categories, budgets, savings goals, recurring rules, and app settings.
  - **CSV Export & Import:** Interoperable spreadsheet export and import with duplicate prevention and validation.
  - **Factory Reset:** One-tap local database wipe.
