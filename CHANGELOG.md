# Changelog

All notable changes to the Simply Cashflow project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-11-20

### 🚀 Major Product Evolution — Financial Operating System

Simply Cashflow 2.0.0 transforms the application from a standalone cashflow tracker into a 100% local, privacy-first **Financial Operating System** for Android, engineered with Apple Design craft standards adapted for Android ergonomics.

### Added

#### 1. Smart Capture (Android Native Notification Listener)
- **Local Notification Processing:** Fully private `SmartCaptureService` (Android `NotificationListenerService`) capturing transaction alerts on-device.
- **Supported Financial Apps:** DANA, GoPay, OVO, ShopeePay, BCA (BCA mobile & myBCA), BRI (BRImo), and Mandiri (Livin' by Mandiri).
- **Zero Cloud & Zero Telemetry:** Pure on-device regex parsing, amount extraction, and merchant extraction with zero network calls.
- **5-Minute Fingerprint Hashing:** Deterministic deduplication using SHA-256 signatures bucketed in 5-minute windows.
- **Review Queue:** Pending transaction queue allowing users to approve, edit category/merchant, or discard captured transactions.
- **Config Plugin:** `plugins/withSmartCapture.js` seamlessly injects the native service and permissions during Expo Prebuild.

#### 2. Local Financial Intelligence
- **Safe to Spend Engine:** Transparent formula (`Balance - Pending Bills - Reserve Fund - Planned Savings`) giving users actionable daily spending confidence without double counting.
- **Smart Budget Pace:** Calendar velocity calculator (`Spent / Ideal Daily Spend`) providing real-time pace status (`under_pace`, `on_track`, `fast_pace`, `overspent`) and recommended daily allowance.
- **Savings Planner 2.0:** Milestone tracking (25%, 50%, 75%, 100%), pace projections, and quick deposit logging.
- **Recurring Transactions Engine:** Support for weekly, bi-weekly, monthly, quarterly, and annual commitments with next due date calculation, manual confirmation, and skip capabilities.
- **Interactive Financial Calendar:** Day-by-day cashflow breakdown with net indicators and transaction itemization.
- **Monthly Financial Recap:** Interactive end-of-month review with total inflow/outflow, net savings, top spending categories, and instant CSV export.

#### 3. Complete Design System Overhaul
- **Dual-Theme Support (Light & Dark):**
  - **Light Palette:** Background `#F5F7F3`, Surface `#FFFFFF`, Primary `#168653`, Income `#168653`, Expense `#D96D70`, Warning `#D9A441`.
  - **Dark Palette:** Background `#080F0C`, Surface `#111D17`, Primary `#39D98A`, Income `#39D98A`, Expense `#E87575`, Warning `#F4C76B`.
  - Seamless system theme following with manual override stored in local SQLite settings.
- **Apple Design & Android Ergonomics:**
  - 4 core tabs: **Home**, **Activity**, **Insights**, **Goals**.
  - Top-level **Settings** header action to declutter main navigation.
  - Tabular numerals (`fontVariant: ['tabular-nums']`) for all IDR financial amounts preventing layout jitter.
  - Native gesture bottom sheets with drag handles and touch-friendly targets (minimum 44x44 dp).
  - High-contrast visual hierarchy and WCAG AAA compliance.

#### 4. Architecture & Data Portability
- **Non-Destructive Database Migration (V2):** Dynamic schema upgrade preserving 100% of existing user data and adding `time`, `merchant`, `source`, `payment_method`, and `reference_id` fields.
- **Indonesian Default Schema:** Standardized Indonesian category names and icons.
- **V2 JSON Backup & Restore:** Complete offline backup capturing transactions, categories, budgets, savings goals, recurring rules, and app settings with validation.
- **Enhanced CSV Export/Import:** Extended CSV format with merchant and payment source metadata.

### Changed
- Re-architected navigation from 5 legacy tabs to 4 primary tabs with sub-routes for Settings, Smart Capture, Recurring, Calendar, Recap, and Privacy.
- Upgraded build configuration to target Android SDK 35 with Hermes JS engine and R8 minification.

---

## [1.0.0] - 2026-11-15

### Initial Release
- Basic offline transaction tracking in IDR.
- Simple budget limit warnings.
- Local SQLite database with export/import capabilities.
