# SIMPLY CASHFLOW 2.0
## MASTER EXECUTION PROMPT — FULL PRODUCT REDESIGN, LOCAL FINANCIAL INTELLIGENCE & ANDROID RELEASE

You are operating as an autonomous Principal Product Designer, Senior Android Engineer, Mobile Software Architect, Financial Systems Engineer, Privacy Engineer, QA Engineer, and Release Engineer.

Your mission is to transform the EXISTING Simply Cashflow application into a premium, highly usable, intelligent personal financial operating system.

This is a complete product evolution, not a new application built from scratch.

PROJECT:
- Product: Simply Cashflow
- Version target: 2.0.0
- GitHub owner: Hiro778
- Repository: simply-cashflow
- Platform: Android
- Core architecture: 100% local-first
- Primary currency: IDR
- Language: Indonesian, with architecture ready for localization.

The supplied screenshots represent the existing Simply Cashflow application. Study them carefully before changing the interface.

The existing application already has:
- Home dashboard.
- Income and expense transactions.
- Transaction categories.
- Financial analytics.
- Circular charts.
- Savings planner.
- Savings calculator.
- Budget functionality.
- CSV export.
- JSON backup and restore.
- CSV transaction import.
- Settings.
- SQLite local storage.
- Offline-first privacy architecture.

PRESERVE existing working functionality and financial records.

Your goal is to make the application substantially more refined, more intelligent, easier to use, and more visually consistent.

==================================================
01. NON-NEGOTIABLE PRODUCT PRINCIPLES
==================================================

The application must follow these principles:

1. 100% local financial data processing.
2. No mandatory account.
3. No backend.
4. No cloud database.
5. No financial data synchronization.
6. No external AI APIs.
7. No analytics or tracking SDKs.
8. No advertisements.
9. No unnecessary Android permissions.
10. All essential features must function offline.

The application must not send:
- Transaction information.
- Account balances.
- Notification content.
- Merchant information.
- Savings goals.
- Financial reports.
- Personal financial metadata.

to external servers.

Internet may be used during development for documentation, dependency installation, GitHub operations, and release distribution. This does NOT authorize the runtime application to transmit personal financial data.

Create a verifiable privacy architecture and inspect the final dependency tree for unnecessary network-capable SDKs.

Do not claim absolute zero network traffic without verifying actual application behavior.

==================================================
02. MANDATORY APPLE DESIGN SKILL
==================================================

The installed design skill is located at:

`.agents/skills/apple-design/`

You MUST study and use this skill before beginning the redesign.

First inspect its actual file structure.

Read its primary skill instructions, including SKILL.md and other required entry files.

Do not assume filenames or reference structures without inspecting the repository.

Read the applicable Human Interface Guidelines references.

Prioritize:
- Layout.
- Typography.
- Color.
- Dark mode.
- Materials.
- Motion.
- Accessibility.
- Navigation.
- Tab bars.
- Sheets.
- Data entry.
- Text fields.
- Charts.
- Settings.
- Feedback.
- Progress indicators.
- Cross-platform design.

Use Context7 to retrieve current documentation for the existing framework and any new libraries.

IMPORTANT:

Apple Design Skill is a design-quality reference, not permission to imitate iOS.

Simply Cashflow is an Android application.

Use:
- Android-native navigation conventions.
- Android-native permission flows.
- Appropriate system bars.
- Android-compatible interaction patterns.
- Native-feeling bottom sheets and dialogs.

Combine Apple's attention to detail with Android usability.

Produce an initial design audit before implementation.

==================================================
03. DESIGN DIRECTION — SIMPLY CASHFLOW 2.0
==================================================

Design identity:

"Your Money. Clearly."

The product must feel like a premium financial operating system.

Design characteristics:
- Minimalist.
- Calm.
- Premium.
- Precise.
- Elegant.
- Modern.
- Highly readable.
- Functional rather than decorative.

Avoid:
- Generic fintech templates.
- Excessive cards.
- Excessive gradients.
- Excessive glow.
- Unnecessary glassmorphism.
- Excessive animations.
- Inconsistent spacing.
- Tiny typography.
- Overloaded dashboards.

GLASSMORPHISM RULE:

Use glass effects selectively for elevated interactive surfaces, overlays, and floating controls.

Do not apply blur to every card.

COLOR SYSTEM

LIGHT MODE:
- Background: #F5F7F3
- Surface: #FFFFFF
- Elevated surface: #FFFFFF
- Primary: #168653
- Primary soft: #E2F4E9
- Main text: #17231D
- Secondary text: #77857C
- Border: #E5EBE6
- Income: #168653
- Expense: #D96D70
- Warning: #D9A441

DARK MODE:
- Background: #080F0C
- Surface: #111D17
- Elevated surface: #182820
- Primary: #39D98A
- Primary soft: #173C2A
- Main text: #F2F7F3
- Secondary text: #8B9B91
- Border: #25352C
- Income: #39D98A
- Expense: #E87575
- Warning: #F4C76B

TYPOGRAPHY:
Use Plus Jakarta Sans or Inter if compatible.

Use a consistent type scale:
- Display.
- Page title.
- Section title.
- Body.
- Supporting text.
- Caption.

Use tabular numerals for financial amounts.

DESIGN TOKENS:

Create a reusable system for:
- Spacing.
- Typography.
- Colors.
- Radius.
- Elevation.
- Borders.
- Icon sizes.
- Animation durations.
- Component dimensions.

Support light and dark themes throughout the entire application.

==================================================
04. INFORMATION ARCHITECTURE
==================================================

Redesign the navigation into four main destinations:

1. Home.
2. Activity.
3. Insights.
4. Goals.

Settings should be accessible from the top-level interface without occupying another primary navigation slot.

Add an accessible global transaction creation action.

Maintain discoverability of existing functionality.

HOME:
Financial overview and actionable financial information.

ACTIVITY:
All financial records, search, filters, and calendar access.

INSIGHTS:
Charts, budget analysis, financial health, and monthly reports.

GOALS:
Savings goals, progress, milestones, and savings simulations.

SETTINGS:
Privacy, Smart Capture, data management, preferences, and application information.

Do not introduce unnecessary navigation levels.

==================================================
05. HOME — REDESIGNED FINANCIAL DASHBOARD
==================================================

Create a dashboard with a strong information hierarchy.

PRIMARY:
- Current available balance.
- Income this month.
- Expenses this month.

SECONDARY:
- Safe to Spend.
- Savings ratio.
- Monthly budget status.

ADDITIONAL:
- Recent transactions.
- Upcoming bills.
- Savings goal progress.
- Financial insights.

Implement a compact dashboard.

Avoid displaying too many cards simultaneously.

Use progressive disclosure for secondary information.

Add a useful quick-action system:
- Add income.
- Add expense.
- Transfer between personal accounts, if account management is implemented.
- Add savings contribution.

Do not fabricate transaction data.

Show clear empty states when no transactions exist.

==================================================
06. TRANSACTION MANAGEMENT 2.0
==================================================

Preserve existing transaction CRUD functionality.

Improve the transaction experience.

Fields:
- Amount.
- Income or expense.
- Category.
- Date.
- Time, when available.
- Merchant or recipient.
- Description.
- Source.
- Payment method.
- Optional reference identifier.

Support:
- Add.
- Edit.
- Delete.
- Search.
- Category filters.
- Date filters.
- Amount filters.
- Income/expense filters.
- Source filters.
- Sorting.

Improve the amount input with clear currency formatting.

Use an adaptive Android bottom sheet.

Avoid unnecessarily tall transaction forms.

Implement:
- Custom categories.
- Category icons.
- Category colors.
- Transaction detail view.
- Undo for accidental deletion where practical.

Support sources such as:
- Manual.
- DANA.
- GoPay.
- OVO.
- ShopeePay.
- Banking.
- QRIS.
- Other.

==================================================
07. SMART TRANSACTION CAPTURE
==================================================

This is a major new feature.

Build a local Android notification-based transaction capture engine.

OBJECTIVE:

When a supported e-wallet or banking application generates a transaction notification, Simply Cashflow should be able to recognize and record the transaction.

ANDROID TECHNOLOGY:

Use Android NotificationListenerService through a properly implemented native Kotlin integration.

First inspect the current framework and build architecture.

If the application uses Expo:
- Determine whether native module integration requires Expo Prebuild.
- Use a local Expo module or a compatible native integration.
- Preserve reproducible Android builds.
- Do not rely on Expo Go for this native feature.
- Verify the production Android build.

Do not migrate the entire application unnecessarily.

PERMISSION:

The user must explicitly enable Notification Access through Android system settings.

Implement:
- Permission status.
- Clear permission explanation.
- Open system settings action.
- Permission revocation detection.
- Service lifecycle management.

Never bypass Android permission controls.

SUPPORTED APPLICATION TARGETS:

Create an extensible parser system for:

- DANA.
- GoPay.
- OVO.
- ShopeePay.
- BCA mobile.
- BRImo.
- Livin' by Mandiri.
- Other supported financial applications in the future.

Do not invent or assume package identifiers.

Verify package identifiers and actual notification structures.

TRANSACTION TYPES:

Recognize when supported:
- QRIS payment.
- Merchant payment.
- Outgoing transfer.
- Incoming transfer.
- Wallet top-up.
- Refund.
- Payment confirmation.

Extract available fields:

- Amount.
- Transaction direction.
- Merchant.
- Recipient.
- Date.
- Time.
- Payment method.
- Source application.
- Transaction identifier.

PARSER ARCHITECTURE:

Implement:

1. Notification source identification.
2. Notification eligibility filtering.
3. Application-specific parsers.
4. Transaction type classification.
5. Amount extraction.
6. Merchant extraction.
7. Category suggestion.
8. Confidence evaluation.
9. Duplicate prevention.
10. Database insertion.
11. Capture event logging.

Use deterministic local parsing.

Do not use external LLMs.

AUTO-SAVE POLICY:

Provide three outcomes:

A. High-confidence transaction:
Automatically save if the user enabled auto-save.

B. Incomplete or ambiguous transaction:
Add to Pending Review.

C. Non-financial notification:
Ignore.

Never turn balance updates, OTPs, promotional messages, or login alerts into transactions.

Never invent missing transaction information.

DEDUPLICATION:

Prevent duplicate records using:
- Transaction identifiers where available.
- Source package.
- Amount.
- Timestamp.
- Notification content fingerprint.

Handle notification updates correctly.

Repeated notifications must not create duplicate transactions.

PRIVACY:

Process eligible notification data locally.

Do not upload notification content.

Do not retain unnecessary raw notification text.

Do not capture unrelated notification content.

Do not implement SMS reading as a workaround.

Do not use AccessibilityService as a workaround.

Do not bypass application security protections.

Do not attempt to access other applications' private databases.

If the source application does not expose transaction details through its notification, explain the limitation.

==================================================
08. SMART CAPTURE INTERFACE
==================================================

Add a dedicated Smart Capture section in Settings.

Display:

- Notification Access status.
- Supported applications.
- Per-application enable/disable controls.
- Auto-save preference.
- Pending Review.
- Captured transaction history.
- Parser diagnostics.
- Privacy information.

Example:

SMART CAPTURE

Status: Active

Connected sources:
- DANA.
- GoPay.
- OVO.
- ShopeePay.
- Mobile Banking.

Captured today: dynamically calculated.

Pending review: dynamically calculated.

Add a capture history screen.

Every captured transaction must show its source.

Provide a clear way to disable Smart Capture.

Do not show a connected status unless permission and actual application configuration have been verified.

==================================================
09. SAFE TO SPEND ENGINE
==================================================

Implement a transparent available-spending calculation.

Inputs:

- Current balance.
- Upcoming unpaid bills.
- User-defined reserved money.
- Remaining planned savings allocations.

Example:

Current balance: Rp1,000,000
Upcoming bills: Rp200,000
Savings allocation: Rp300,000

Safe to Spend: Rp500,000

Use a documented formula.

IMPORTANT:

Do not subtract savings contributions twice.

Distinguish:
- Actual balance.
- Reserved funds.
- Planned savings.
- Available spending.

Let the user customize reserve settings.

Show the calculation details.

If data is incomplete, show an estimate or unavailable state instead of a misleading precise number.

==================================================
10. SMART BUDGET ENGINE
==================================================

Improve existing budget functionality.

Features:

- Monthly budget.
- Category-specific budget.
- Weekly spending limit.
- Daily spending allowance.
- Remaining budget.
- Budget progress.
- Overspending warnings.
- Spending pace.

Use real transaction data.

Example:

Budget: Rp1,000,000
Spent: Rp650,000
Remaining: Rp350,000
Used: 65%

Allow customizable alert thresholds.

Never generate alerts from fabricated data.

==================================================
11. SAVINGS PLANNER 2.0
==================================================

Preserve existing savings goals.

Enhance with:

- Goal milestones.
- Contributions history.
- Daily savings estimate.
- Weekly savings estimate.
- Monthly savings estimate.
- Estimated completion date.
- Target date.
- Remaining amount.
- Progress percentage.
- Pause.
- Complete.
- Archive.
- Edit.

Milestones:
25%, 50%, 75%, 100%.

Implement a contribution history.

Prevent double-counting between savings contributions and ordinary transactions.

Allow the user to decide whether savings are:
- Allocations within an existing balance.
- Money transferred into another tracked account.

Do not silently change the user's accounting model.

==================================================
12. FINANCIAL CALENDAR
==================================================

Add a calendar view.

Display:
- Income dates.
- Expense dates.
- Upcoming bills.
- Recurring transactions.
- Savings contributions.

Allow date selection.

Display that date's transactions.

Use a compact and accessible interface.

All information must be calculated from the local database.

==================================================
13. RECURRING TRANSACTIONS
==================================================

Support:

- Daily.
- Weekly.
- Monthly.
- Yearly.

Examples:
- Internet bills.
- Subscriptions.
- Allowance.
- Salary.
- Regular payments.

Provide:
- Next scheduled date.
- Amount.
- Category.
- Description.
- Active/paused status.
- Edit schedule.
- Delete schedule.

IMPORTANT:

Never assume that a scheduled transaction has actually been paid.

Distinguish:
- Scheduled.
- Due.
- Confirmed.
- Skipped.

If using automatic local generation, clearly mark generated records and provide duplicate prevention.

==================================================
14. FINANCIAL INSIGHTS
==================================================

Redesign the analytics module.

Include:

- Income versus expenses.
- Savings rate.
- Weekly spending.
- Monthly spending.
- Category distribution.
- Biggest expense.
- Spending trend.
- Previous-month comparison.
- Budget performance.
- Net cash flow.

Use attractive but readable visualizations.

Circular charts should communicate actual percentages.

Do not distort chart proportions.

Review the existing Financial Health Score.

Document its calculation.

Ensure the health label agrees with the score.

Provide transparent explanations for financial insights.

Examples:

- Your largest expense category this month.
- Your spending increased compared with last month.
- Your savings rate improved.
- Your food budget is approaching its limit.

All insights must use deterministic local calculations.

==================================================
15. MONTHLY FINANCIAL RECAP
==================================================

Create a monthly recap.

Include:

- Total income.
- Total expenses.
- Net cash flow.
- Savings percentage.
- Largest expense.
- Top spending category.
- Budget performance.
- Monthly comparison.

Provide an attractive shareable report.

Allow local CSV and PDF export if compatible with the existing architecture.

Do not upload reports to external services.

==================================================
16. DATA MANAGEMENT
==================================================

Preserve existing SQLite functionality.

Inspect the existing schema before migrations.

Implement migrations safely.

Maintain backward compatibility.

Support:

- Local JSON backup.
- JSON restore.
- CSV export.
- CSV import.
- Data validation.
- Backup validation.
- Duplicate prevention.
- Recovery from failed imports.

Use Android's document picker and storage mechanisms.

Allow users to choose where to save backup files.

Never silently overwrite existing records during restoration.

Provide clear confirmation and recovery behavior.

Consider optional backup encryption using Android Keystore and a user-controlled passphrase if feasible.

Do not claim a backup is encrypted unless verified.

==================================================
17. PRIVACY AND SECURITY
==================================================

Create a dedicated Privacy & Security screen.

Display:

- Local database information.
- Notification permission status.
- Data storage explanation.
- Backup information.
- Optional application lock.
- Clear-data controls.
- Privacy architecture.

Security requirements:

- No hardcoded secrets.
- No unnecessary permissions.
- No telemetry.
- No advertising identifiers.
- No third-party tracking.
- No external financial-data transmission.
- No automatic cloud backups.
- No background network synchronization.

Inspect Android manifest permissions.

Inspect dependencies for unexpected networking or tracking behavior.

Consider protecting sensitive local data using Android Keystore.

Implement an optional application lock using supported Android security mechanisms.

Do not store passwords or PINs in plaintext.

Do not pretend that a PIN screen alone encrypts the database.

==================================================
18. OPTIONAL CONVENIENCE FEATURES
==================================================

Implement only when they materially improve usability:

- Custom transaction categories.
- Merchant aliases.
- Local bill reminders.
- Quick transaction entry.
- Transaction templates.
- Financial calendar.
- Monthly recap.
- Search improvements.
- Light/dark theme.
- Reduced-motion support.

Do not turn the application into an overloaded financial management suite.

Keep every feature discoverable and understandable.

==================================================
19. PERFORMANCE AND ANDROID COMPATIBILITY
==================================================

Maintain compatibility with a broad range of Android smartphones.

Requirements:

- Responsive layouts.
- Small-screen support.
- Different pixel densities.
- Correct status bar handling.
- Correct navigation bar handling.
- Keyboard-aware forms.
- Efficient SQLite queries.
- Smooth animations.
- Minimal memory consumption.
- Reliable app startup.
- Graceful handling of service interruptions.

Use current compatible Android dependencies.

Verify actual minimum SDK and ABI requirements.

Build an installable standalone APK.

Do not require Expo Go.

Test on real Android hardware where available.

Document NotificationListenerService behavior under battery restrictions and device-specific Android customizations.

Do not promise uninterrupted background operation on every manufacturer.

==================================================
20. QUALITY ASSURANCE
==================================================

Perform complete testing.

UNIT TESTS:
- Balance calculation.
- Income calculation.
- Expense calculation.
- Savings percentage.
- Safe to Spend.
- Budget calculations.
- Recurring transaction schedules.
- Savings milestones.
- Monthly recap.

DATABASE TESTS:
- CRUD.
- Migrations.
- Persistence.
- Backup.
- Restore.
- Import validation.
- Duplicate prevention.

NOTIFICATION TESTS:
- Incoming transfer.
- Outgoing transfer.
- QRIS payment.
- Merchant payment.
- Refund.
- Balance update.
- OTP.
- Promotional notification.
- Missing amount.
- Duplicate notification.
- Updated notification.
- Permission revocation.
- Unsupported source.

Use synthetic fixtures for parser testing.

Never use fabricated test results as evidence of real banking application compatibility.

UI TESTS:
- Navigation.
- Transaction forms.
- Bottom sheets.
- Charts.
- Calendar.
- Settings.
- Smart Capture.
- Theme switching.
- Accessibility.
- Small screens.

SECURITY TESTS:
- Inspect network requests.
- Inspect permissions.
- Verify local database persistence.
- Verify backup behavior.
- Verify absence of financial data transmission.

Fix all critical and high-priority issues.

==================================================
21. GITHUB AND RELEASE
==================================================

Continue using the existing Hiro778 Simply Cashflow repository.

Do not create unnecessary duplicate repositories.

Create a safe feature branch.

Use logical commits.

Update:

- README.md.
- CHANGELOG.md.
- Architecture documentation.
- Privacy documentation.
- Feature documentation.
- Installation instructions.
- Screenshots.

Update the version to 2.0.0 only after the implementation is ready.

Configure GitHub Actions to run relevant:
- TypeScript checks.
- Linting.
- Unit tests.
- Build validation.

Do not weaken tests to obtain green CI.

Produce a verified standalone APK.

Publish GitHub Release:

Tag: v2.0.0

Title: Simply Cashflow 2.0

Attach the actual installable APK.

Never claim that a release or APK exists unless the corresponding operation has succeeded.

Do not upload user financial data, local database files, or personal backups to GitHub.

==================================================
22. IMPLEMENTATION ORDER
==================================================

Work in controlled phases.

PHASE 0 — Existing application audit.
Inspect source code, database, dependencies, Android architecture, and current features.

PHASE 1 — Design research.
Read Apple Design Skill, applicable HIG references, and Context7 documentation.

PHASE 2 — Design system.
Build tokens, typography, reusable components, and theme architecture.

PHASE 3 — Core redesign.
Implement navigation, dashboard, activity, insights, goals, and settings.

PHASE 4 — Financial intelligence.
Implement Safe to Spend, Smart Budget, recurring transactions, and Savings Planner 2.0.

PHASE 5 — Smart Capture.
Implement Kotlin notification listener integration, application parsers, deduplication, review queue, and local persistence.

PHASE 6 — Financial convenience.
Implement calendar, monthly recap, reminders, and data management improvements.

PHASE 7 — Privacy and security audit.
Verify local-only behavior, Android permissions, storage, and dependencies.

PHASE 8 — Complete testing.
Fix bugs and run automated and manual tests.

PHASE 9 — Production build.
Build and verify the standalone APK.

PHASE 10 — GitHub release.
Update documentation, CI, version, and publish the verified release.

Do not skip phases.

Do not stop at a UI mockup.

==================================================
23. FINAL ACCEPTANCE CRITERIA
==================================================

Simply Cashflow 2.0 is considered complete only when:

1. Existing financial records remain intact.
2. Existing functionality is preserved.
3. The redesigned interface is implemented.
4. Light and dark themes work consistently.
5. Navigation works.
6. Financial calculations are tested.
7. Smart Budget works.
8. Safe to Spend works.
9. Savings Planner works.
10. Recurring transactions work.
11. Financial Calendar works.
12. Smart Capture works for individually verified notification formats.
13. Notification permissions are handled correctly.
14. Duplicate transactions are prevented.
15. All core features work offline.
16. No financial data is transmitted externally.
17. Backups and restores work.
18. Automated tests pass.
19. The Android APK is verified.
20. GitHub documentation and release are published.

==================================================
24. FINAL DELIVERY REPORT
==================================================

Provide an honest implementation report.

Include:

A. PRODUCT
- Screens redesigned.
- Features implemented.
- Features preserved.
- Features deferred.

B. DESIGN
- Design system.
- Apple Design Skill references used.
- Accessibility review.
- Before/after screenshots.

C. LOCAL ARCHITECTURE
- Database architecture.
- Notification capture architecture.
- Data flow.
- Network behavior.
- Privacy verification.

D. COMPATIBILITY
- Minimum Android SDK.
- Tested devices.
- Tested notification sources.
- Known OEM limitations.

E. QUALITY
- Tests executed.
- Actual pass/fail results.
- Remaining bugs.

F. DISTRIBUTION
- Repository URL.
- Release URL.
- APK artifact.
- Version number.
- GitHub Actions status.

Do not hide incomplete functionality.

Do not fabricate test results.

Do not claim 100% local operation without supporting verification.

FINAL PRODUCT VISION:

Simply Cashflow should feel like a premium personal financial operating system that quietly helps users understand, record, manage, and improve their financial lives.

It must remain simple, private, fast, reliable, and entirely under the user's control.

START EXECUTION NOW.
