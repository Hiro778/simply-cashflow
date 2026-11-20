# Simply Cashflow — Installation & Setup Guide

**Product:** Simply Cashflow 2.0.0  
**Target Platform:** Android (API 24 to 35)  

---

## 1. Sideloading the Standalone Android APK

Simply Cashflow distributes a production standalone Android APK that does not require Expo Go or Google Play Services.

### Installation Steps
1. Download the release APK (`simply-cashflow-2.0.0.apk`) from the official GitHub Releases page:
   ```
   https://github.com/Hiro778/simply-cashflow/releases/tag/v2.0.0
   ```
2. Open the downloaded `.apk` file on your Android smartphone.
3. If prompted by Android, grant **Install Unknown Apps** permission for your browser or file manager (*Settings > Apps > Special app access > Install unknown apps*).
4. Tap **Install** and launch **Simply Cashflow**.

---

## 2. Setting Up Smart Capture (Notification Listener)

To allow Simply Cashflow to automatically recognize financial transactions from DANA, GoPay, OVO, ShopeePay, BCA mobile, BRImo, and Livin' by Mandiri:

1. Launch Simply Cashflow and tap the **Settings** icon (top right of Beranda).
2. Select **Smart Capture**.
3. Under *Status Akses Notifikasi*, tap **Buka Pengaturan Android**.
4. In Android's **Device & App Notifications** (*Akses Notifikasi*) settings list, locate **Simply Cashflow** and switch the toggle **ON**.
5. Tap **Allow** on the Android system confirmation dialog.
6. Return to Simply Cashflow; the status will now indicate **Aktif**.

---

## 3. OEM Battery Optimization Guidelines

Some Android manufacturers (notably Xiaomi/Redmi, Oppo/Realme, Vivo, and Huawei) utilize aggressive background process management that may terminate notification listeners after prolonged screen-off periods.

To ensure uninterrupted Smart Capture operation:

### Xiaomi / Redmi / POCO (MIUI / HyperOS)
1. Go to **Settings > Apps > Manage Apps > Simply Cashflow**.
2. Enable **Autostart** (*Mulai Otomatis*).
3. Under **Battery Saver**, select **No Restrictions** (*Tidak ada pembatasan*).

### OPPO / Realme (ColorOS / Realme UI)
1. Go to **Settings > Battery > App Battery Management > Simply Cashflow**.
2. Enable **Allow foreground activity** and **Allow background activity**.
3. Disable **Auto-freeze** for Simply Cashflow.

### Samsung (One UI)
1. Go to **Settings > Apps > Simply Cashflow > Battery**.
2. Select **Unrestricted** (instead of *Optimized* or *Restricted*).
3. Ensure Simply Cashflow is NOT added to the *Deep Sleeping Apps* list.

### Vivo (Funtouch OS)
1. Go to **Settings > Battery > Background power consumption management > Simply Cashflow**.
2. Select **High background power usage**.

---

## 4. Building from Source (Developer Setup)

### Prerequisites
- **Node.js:** v20.x or v22.x LTS
- **JDK:** Java 17 (Eclipse Temurin recommended)
- **Android SDK:** Command-line tools, Build-Tools 35.0.0, Android SDK Platform 35
- **Git**

### Step-by-Step Build Instructions

```bash
# 1. Clone the repository
git clone https://github.com/Hiro778/simply-cashflow.git
cd simply-cashflow

# 2. Checkout the v2.0 release branch
git checkout feature/v2.0-redesign-and-release

# 3. Install NPM dependencies
npm ci

# 4. Run TypeScript checks
npm run typecheck

# 5. Run the full unit test suite
npm test

# 6. Generate the native Android project (if modifying native Kotlin code)
npx expo prebuild --platform android --no-install

# 7. Compile the standalone release APK
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon -x lint -x test

# The output APK will be located at:
# android/app/build/outputs/apk/release/app-release.apk
```
