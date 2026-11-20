# Simply Cashflow 2.0.0

<p align="center">
  <b>100% Local Financial Operating System for Android</b><br>
  <i>Crafted with Apple Design Precision and Android Material Ergonomics</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-168653?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Android-39D98A?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Offline--First-100%25%20Local-168653?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-111D17?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-SQLite-39D98A?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-168653?style=for-the-badge" />
</p>

---

## 🌟 Overview

**Simply Cashflow 2.0.0** is an offline-first personal financial operating system engineered specifically for Android. Operating 100% locally on your smartphone, Simply Cashflow eliminates cloud dependencies, accounts, tracking SDKs, and subscription paywalls.

All data—transactions, budgets, savings goals, recurring bills, and notification logs—remains strictly inside your device's encrypted sandbox SQLite database.

---

## 🚀 What's New in 2.0.0

### 1. 🛡️ Smart Capture (Local Android Notification Listener)
- **Zero-Cloud Transaction Ingestion:** Directly hooks into Android's native `NotificationListenerService` to capture financial transaction alerts.
- **Indonesian Ecosystem Support:** Out-of-the-box native parsers for **DANA**, **GoPay**, **OVO**, **ShopeePay**, **BCA** (BCA mobile & myBCA), **BRI** (BRImo), and **Mandiri** (Livin' by Mandiri).
- **Intelligent Category Inference:** Automatically detects merchants and tags expenses (e.g. Indomaret/Alfamart to Groceries, PLN to Bills, McDonald's to Food).
- **Bucketed SHA-256 Deduplication:** 5-minute cryptographic fingerprinting prevents duplicate entries from repeated app banners.
- **Review Queue:** An intuitive staging area to inspect, edit, approve, or discard captured transactions.

### 2. 🧠 Local Financial Intelligence
- **Safe to Spend Engine:** Know exactly what you can spend today without jeopardizing bills or savings:
  $$\text{Safe to Spend} = \text{Available Balance} - \text{Pending Bills} - \text{Reserve Fund} - \text{Planned Savings}$$
- **Smart Budget Pace:** Measures your spending velocity against the monthly calendar. Identifies whether you are `under_pace`, `on_track`, or `fast_pace`, and calculates a recommended daily allowance for the rest of the month.
- **Savings Planner 2.0:** Milestone celebrations (25%, 50%, 75%, 100%), pace projections, and quick deposit workflows.
- **Recurring Transactions Engine:** Auto-advancing schedules for bills, subscriptions, and recurring income with pay and skip actions.
- **Financial Calendar:** Full visual day-by-day cashflow matrix highlighting income inflows, bill due dates, and daily net flow.
- **Monthly Financial Recap:** Comprehensive end-of-month review highlighting top spending drivers, net savings rate, and one-tap CSV export.

### 3. 🎨 Design System & Dual-Theme Architecture
Engineered in accordance with the **Apple Design Craft Guidelines** harmonized with **Android Material Ergonomics**:
- **Dual Themes:**
  - **Light Mode:** Canvas `#F5F7F3`, Cards `#FFFFFF`, Primary `#168653`, Income `#168653`, Expense `#D96D70`, Warning `#D9A441`.
  - **Dark Mode:** Canvas `#080F0C`, Cards `#111D17`, Primary `#39D98A`, Income `#39D98A`, Expense `#E87575`, Warning `#F4C76B`.
- **4 Core Tabs:** Clean, uncluttered bottom navigation (**Home**, **Activity**, **Insights**, **Goals**), with **Settings** elevated to top-level navigation.
- **Tabular Numerals:** All Indonesian Rupiah amounts use monospaced tabular numerals (`fontVariant: ['tabular-nums']`) to eliminate layout jump.
- **Ergonomic Sheets:** Drag-handle bottom sheets with fluid touch targets (minimum 44x44 dp) positioned within natural thumb reach.

### 4. 🔒 100% Offline-First Architecture & Privacy
- **Zero Network Traffic:** Simply Cashflow has no backend servers, no analytics beacons, and no crash reporters.
- **Local SQLite Engine:** Embedded relational database with dynamic v2 non-destructive migration.
- **Comprehensive Backup:** Single-tap JSON snapshot export and restore, plus clean CSV transaction reports.

---

## 📱 Supported Android Versions

- **Minimum SDK:** Android 7.0 (Nougat, API level 24)
- **Target SDK:** Android 15 (Vanilla Ice Cream, API level 35)
- **Architectures:** `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`

---

## 📦 Download & Installation

1. Grab the release APK (`simply-cashflow-2.0.0.apk`) from [Releases](https://github.com/Hiro778/simply-cashflow/releases).
2. Install the APK on your Android smartphone.
3. (Optional) For automatic transaction logging, navigate to **Settings > Smart Capture** and grant Notification Listener access.

---

## 🛠️ Build from Source

### Prerequisites
- Node.js 20+
- JDK 17 (Eclipse Temurin recommended)
- Android SDK 34/35 & NDK 26.1+

### Build Commands

```bash
# 1. Clone repository
git clone https://github.com/Hiro778/simply-cashflow.git
cd simply-cashflow

# 2. Install dependencies
npm ci

# 3. Run typecheck and tests
npm run typecheck
npm test

# 4. Assemble Android Release APK
cd android
./gradlew assembleRelease --no-daemon -x lint -x test
```

The resulting standalone APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 📄 License

Simply Cashflow is released under the [MIT License](LICENSE).
