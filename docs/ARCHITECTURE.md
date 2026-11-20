# Simply Cashflow — Architecture Documentation

**Version:** 2.0.0  
**Target Platform:** Android (API 24 to 35)  
**Core Model:** 100% Local-First Personal Financial Operating System  

---

## 1. High-Level Architecture Overview

Simply Cashflow 2.0 is architected as an offline-first mobile operating system for personal cashflow management. It operates with zero backend infrastructure, zero cloud database connections, and zero tracking SDKs. All application state, relational models, historical records, and financial intelligence logic reside entirely on the local device.

```
+-----------------------------------------------------------------------------+
|                          PRESENTATION LAYER (UI)                            |
|  Expo Router (File-Based Navigation) + Dual-Theme Design System (Light/Dark) |
|  - Tabs: Beranda (Home), Aktivitas (Activity), Wawasan (Insights), Target   |
|  - Stacks: Settings, Smart Capture Hub, Calendar, Recap, Recurring, Privacy |
|  - Components: Touch targets >= 44x44dp, Tabular Numerals, Glass Sheets     |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                         APPLICATION STATE & HOOKS                           |
|  Zustand Global Store (useAppStore) + Theme Engine (useTheme)               |
|  - Reactive updates across tabs and modals without polling                  |
|  - Transaction CRUD, Safe to Spend calculation, Budget velocity metrics     |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                     LOCAL FINANCIAL INTELLIGENCE LAYER                      |
|  - Safe to Spend Engine (Available Balance - Bills - Reserves - Savings)    |
|  - Smart Budget Pace Engine (Calendar Velocity & Daily Allowance)           |
|  - Savings Planner 2.0 (Milestones: 25%, 50%, 75%, 100%)                    |
|  - Analytics Service (Financial Health Score 0-100, Trends, Breakdowns)     |
+-----------------------------------------------------------------------------+
                                      |
       +------------------------------+------------------------------+
       |                                                             |
       v                                                             v
+---------------------------------------+   +---------------------------------+
|        LOCAL PERSISTENCE LAYER        |   |      SMART CAPTURE ENGINE       |
|  Embedded SQLite (expo-sqlite)        |   |  Android Kotlin Notification    |
|  - Non-destructive V2 schema migration|   |  Listener Service               |
|  - Tables: transactions, categories,  |   |  - Native Kotlin Module         |
|    budgets, savings_goals,            |   |  - SharedPreferences Queue      |
|    savings_contributions,             |   |  - Deterministic Regex Parsers  |
|    recurring_transactions, captures,  |   |  - 5-Min SHA-256 Deduplication  |
|    app_settings                       |   |  - Staging Queue & Auto-Save    |
+---------------------------------------+   +---------------------------------+
```

---

## 2. Technology Stack & Key Dependencies

- **Runtime & Framework:** React Native 0.88.1 on Expo SDK 58 (Target SDK 35, Min SDK 24).
- **Navigation:** Expo Router 58 (nested stack and tab layouts).
- **Database Engine:** Embedded SQLite via `expo-sqlite` (WAL-mode, persistent local SQLite database).
- **State Management:** Zustand 5.1.
- **Native Android Modules:** Custom Kotlin `NotificationListenerService` (`SmartCaptureService`) wired via `SmartCapturePackage` and integrated through Expo Config Plugin (`plugins/withSmartCapture.js`).
- **Icons & Graphics:** `lucide-react-native` and `react-native-svg`.
- **Validation & Forms:** `zod` and `react-hook-form`.
- **Testing:** Jest + `ts-jest` (4 test suites, 36 comprehensive tests).

---

## 3. Database Schema & Migration Strategy

The application manages data through an embedded SQLite database named `simplycashflow.db`.

### V1 to V2 Non-Destructive Migration
When upgrading from v1.0.0 to v2.0.0, `initDatabase()` inspects the `PRAGMA table_info(transactions)` and dynamically appends missing columns via `ALTER TABLE ADD COLUMN`:
- `time` (TEXT, HH:mm format)
- `merchant` (TEXT, merchant or counterparty name)
- `source` (TEXT, e.g. `manual`, `DANA`, `GoPay`, `OVO`, `ShopeePay`, `BCA`, `BRI`, `Mandiri`, `QRIS`, `other`)
- `payment_method` (TEXT, e.g. `cash`, `transfer`, `e-wallet`, `qris`, `debit`, `credit`)
- `reference_id` (TEXT, transaction reference code)

### Schema Tables
1. **`categories`**: Financial income and expense categories (UUID primary key, name, type, icon, hex color, default flag).
2. **`transactions`**: Primary ledger records (UUID, amount integer in IDR, type, category metadata, date, time, merchant, source, payment method, reference ID, timestamps).
3. **`budgets`**: Monthly expenditure limits (UUID, month YYYY-MM, category_id or null for overall limit, amount, timestamp).
4. **`savings_goals`**: Savings targets (UUID, name, target amount, current amount, target date, status `active`/`completed`/`paused`/`archived`).
5. **`savings_contributions`**: Individual savings goal deposit history (UUID, goal_id foreign key, amount, date, note, timestamp).
6. **`recurring_transactions`**: Recurring commitments (UUID, title, amount, frequency `daily`/`weekly`/`monthly`/`yearly`, start date, next due date, active flag, auto record flag, status `scheduled`/`due`/`confirmed`/`skipped`).
7. **`captured_notifications`**: Smart Capture audit trail (ID, package name, app name, title, body, subtext, timestamp, parsed amount, parsed type, parsed merchant, status `auto_saved`/`pending_review`/`ignored`/`duplicate`, confidence score).
8. **`settings`**: Key-value preference store (e.g. `theme_mode`, `safe_to_spend_reserve`, `smart_capture_enabled`, `smart_capture_auto_save`).

---

## 4. Smart Capture Native Engine

### Android Kotlin Integration
1. **`SmartCaptureService.kt`**: Extends Android `NotificationListenerService`. Registered in `AndroidManifest.xml` with `android.permission.BIND_NOTIFICATION_LISTENER_SERVICE`.
2. **Filtering:** Filters status bar notifications matching verified financial package prefixes:
   - `id.dana` (DANA)
   - `com.gojek.app` / `com.telkom.indonesia.gojek` (GoPay)
   - `id.ovo` (OVO)
   - `com.shopee.id` (ShopeePay)
   - `com.bca` (BCA mobile)
   - `id.co.bri.brimo` (BRImo)
   - `id.bmri.livin` (Livin' by Mandiri)
3. **Buffer Queue:** Stores incoming notifications into encrypted app-private `SharedPreferences` to ensure zero loss if the React Native bridge is not yet initialized.
4. **Bridge Module (`SmartCaptureModule.kt`):** Exposes methods to query permission state, trigger system settings, retrieve pending buffered events, and emit live `onSmartCaptureNotification` events over the JavaScript bridge.

### Deterministic Parsing Pipeline
- **Step 1:** Non-financial content detection via `isNonFinancialAlert()` drops OTPs, promotional banners, and login notifications.
- **Step 2:** Package-specific parsers extract amounts, transaction direction (`income` vs `expense`), merchant names, and payment methods.
- **Step 3:** Categorization inference maps recognized merchants (e.g. PLN, Telkomsel, Tokopedia, Alfamart, Indomaret, Starbucks) to standardized categories.
- **Step 4:** 5-minute bucketed SHA-256 fingerprinting prevents duplicates from recurring notification updates.
- **Step 5:** Decisions routing: High confidence ($\ge 0.85$) with auto-save enabled commits directly to SQLite; ambiguous items are staged in the Pending Review queue.

---

## 5. Design System Tokens & Craft Standards

Simply Cashflow follows the Apple Design Craft standards adapted for Android Material ergonomics:
- **Light Theme Canvas:** Background `#F5F7F3`, Cards `#FFFFFF`, Primary `#168653`, Income `#168653`, Expense `#D96D70`, Warning `#D9A441`.
- **Dark Theme Canvas:** Background `#080F0C`, Cards `#111D17`, Primary `#39D98A`, Income `#39D98A`, Expense `#E87575`, Warning `#F4C76B`.
- **Tabular Numerals:** Applied via `fontVariant: ['tabular-nums']` to all currency amounts to eliminate layout shifts.
- **Glassmorphism Constraint:** Liquid Glass backdrop blur is strictly confined to top-level floating functional layers (sheets, headers). Content layers maintain solid, contrast-verified backgrounds to maximize readability.
