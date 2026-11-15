# Simply Cashflow

<p align="center">
  <b>Financial OS — Offline-first personal cashflow and savings manager for Android</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-35D07F?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Framework-React%20Native%20%7C%20Expo-35D07F?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-SQLite-35D07F?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-35D07F?style=for-the-badge" />
</p>

---

## 🌟 Overview

**Simply Cashflow** is a modern, privacy-focused financial operating system engineered for Android. Built with an offline-first architecture, it provides complete financial visibility, automated budget tracking, and intelligent savings target calculation without ever uploading your sensitive financial data to any external cloud or server.

---

## 🚀 Key Features

### 1. 📊 Home Financial Dashboard
- **Total Net Balance:** Real-time calculation of overall liquidity.
- **Monthly Inflow & Outflow:** Instant visual comparison of income vs expenses.
- **Circular Savings Gauge:** Dynamic circular percentage tracking for monthly savings rate.
- **Financial Health Diagnostic:** Intelligent score and status assessment based on liquidity ratios.
- **Recent Transactions:** Quick-access transaction feed.

### 2. 💳 Transaction Management
- Categorized income and expense logging with Indonesian Rupiah (`IDR`) currency standard.
- Integer-based financial math preventing floating-point rounding inaccuracies.
- Date, category, and keyword transaction filtering.
- Fast interactive add/edit/delete workflow.

### 3. 📈 Financial Analytics & Visual Trends
- **Income vs Expense Ratio:** Visual breakdown of cashflow distribution.
- **Category Spending Breakdown:** Percentage breakdown and progress indicators per category.
- **Weekly Trends:** Visual bar charts showing spending distribution across weeks.
- **Month-over-Month Comparison:** Growth tracking compared to the previous period.

### 4. 🎯 Budget Management
- Overall monthly spending limits and category-specific budget caps.
- Three-tier alert system: **Safe** (green), **Warning** (yellow), and **Danger/Overspent** (red).
- Real-time remaining budget calculations.

### 5. 💰 Savings Goal Engine
- Target-based goal creation with custom icons, colors, and deadlines.
- Dynamic savings calculator breaking goals down into daily, weekly, and monthly required deposits.
- Contribution logging with progress updates.

### 6. 🛡️ Privacy & Data Portability
- **100% Offline-First:** Stored entirely in local SQLite.
- **Zero Registration:** No account, email, or passwords required.
- **Export & Backup:** Full JSON backup and CSV transaction report exports.
- **Restoration:** Safe import validation for JSON backups and CSV transaction records.

---

## 🛠️ Technology Stack

- **Framework:** [React Native](https://reactnative.dev/) (v0.88+) with [Expo](https://expo.dev/) (SDK 58)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation)
- **Database:** [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (local persistent storage)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Vector Graphics & Charts:** [react-native-svg](https://github.com/software-mansion/react-native-svg)
- **Icons:** [lucide-react-native](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)

---

## 📱 Supported Android Versions

- **Minimum SDK:** Android 7.0 (Nougat, API level 24)
- **Target SDK:** Android 14+ (API level 34+)
- **Architecture:** Universal APK (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`)

---

## 📦 Installation & Download

1. Download the latest standalone release APK (`simply-cashflow.apk`) from the [GitHub Releases](https://github.com/Hiro778/simply-cashflow/releases).
2. Open the `.apk` file on your Android device.
3. If prompted, allow "Install from unknown sources" in settings.
4. Launch **Simply Cashflow** and start managing your finances offline.

---

## 💻 Development & Building

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Hiro778/simply-cashflow.git
cd simply-cashflow

# Install dependencies
npm install

# Run type check and lint
npm run typecheck

# Run unit tests
npm test

# Start the Expo development server
npm start
```

### Building the Standalone APK

```bash
# Generate native Android project files
npx expo prebuild --platform android

# Compile release APK using Gradle
cd android
./gradlew assembleRelease
```
The output APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Hiro778](https://github.com/Hiro778).
