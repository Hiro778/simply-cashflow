# FAST TRACK CHALLENGE — SIMPLY CASHFLOW
## Autonomous E2E Development, Testing & GitHub Release

You are an autonomous senior mobile engineer, software architect, UI/UX designer, QA engineer, and DevOps engineer.

Your mission is to BUILD, TEST, DEBUG, PACKAGE, AND RELEASE a complete Android financial management application named:

**SIMPLY CASHFLOW**

GitHub owner: Hiro778  
Target repository: `simply-cashflow`

This is an execution task, not a planning-only task.

Do not stop after creating mockups, writing documentation, or generating initial source code. Continue until the application is functional, tested, built into an installable APK, and published through GitHub Releases.

---

# 1. AUTONOMOUS EXECUTION RULES

- Inspect the current workspace, Git configuration, installed SDKs, Android environment, and existing GitHub repositories first.
- Inspect the existing GitHub profile and repositories belonging to Hiro778.
- Preserve all unrelated existing repositories and projects.
- Never overwrite or delete existing work without authorization.
- Use Context7 to retrieve current official documentation before selecting or implementing libraries.
- Resolve the latest compatible versions instead of blindly using outdated tutorials.
- Verify every important dependency against the actual installed SDK.
- Work autonomously through implementation, testing, and debugging.
- Do not claim a feature works without testing it.
- Never fabricate successful test results.
- Fix errors before moving to the next stage.
- Maintain a clean Git history and professional repository structure.

If an external service requires authentication or permission, explain the exact action needed rather than pretending it succeeded.

# 2. TECHNOLOGY STACK

Preferred architecture:

- React Native
- Expo
- TypeScript (strict mode)
- Expo Router
- SQLite for persistent local storage
- Zustand for lightweight state management, if appropriate
- React Hook Form + Zod for form validation, if compatible
- React Native Reanimated for smooth animations
- React Native SVG for circular charts
- Lucide React Native for icons
- Context7 for up-to-date library documentation

Use the latest mutually compatible stable versions.

Architecture requirements:

- Offline-first.
- Local database.
- No mandatory account registration.
- No mandatory internet connection for core functionality.
- Proper Android navigation and safe-area handling.
- Modular and maintainable code.
- Strong TypeScript typing.
- No unnecessary dependencies.

# 3. UNIVERSAL ANDROID COMPATIBILITY

The application must target a broad range of Android smartphones.

Requirements:

- Support different screen sizes and aspect ratios.
- Responsive layouts for small and large phones.
- Support portrait orientation.
- Handle Android system navigation and status bars.
- Support different pixel densities.
- Avoid hardcoded screen dimensions.
- Avoid manufacturer-specific APIs.
- Avoid dependence on a particular Android kernel.
- Use Android-compatible native dependencies.
- Build a universal APK when technically supported.

Target a broad Android API range, preferably Android 7.0+ (API 24+) if all selected dependencies support it.

Verify actual compatibility before choosing the minimum SDK.

Build an APK that can be installed directly without requiring Expo Go.

# 4. DESIGN SYSTEM — FINANCIAL OS

Create a premium financial dashboard inspired by modern operating systems and high-end fintech applications.

Visual direction:

- Dark-first interface.
- Premium glassmorphism.
- Soft translucent cards.
- Subtle background blur.
- Smooth transitions.
- Carefully controlled glow effects.
- Rounded corners.
- Minimalist typography.
- Excellent visual hierarchy.
- Consistent spacing system.

Color palette:

- Primary background: #080D0B
- Secondary background: #101915
- Glass surface: rgba(255,255,255,0.06)
- Primary green: #35D07F
- Secondary green: #80E6AC
- Text primary: #F3F7F4
- Text secondary: #899A90
- Negative transaction: #FF7272
- Warning: #F4C76B

IMPORTANT:
Green represents positive financial performance and income.
Red represents expenses and negative financial conditions.

Do not use excessive gradients, excessive glow, or cluttered layouts.

The application should feel like a carefully designed financial operating system, not a generic template.

# 5. CORE APPLICATION MODULES

Implement all modules below with real functionality.

## A. HOME DASHBOARD

Display:

- Total available balance.
- Total income this month.
- Total expenses this month.
- Monthly savings.
- Financial health overview.
- Recent transactions.
- Monthly spending summary.
- Savings goal progress.

Create an attractive circular percentage visualization.

The dashboard must dynamically update whenever transactions are added, edited, or deleted.

## B. TRANSACTION MANAGEMENT

Users must be able to:

- Add income.
- Add expenses.
- Edit transactions.
- Delete transactions.
- Select transaction categories.
- Add descriptions.
- Select dates.
- Enter amounts.
- View transaction history.
- Filter by date.
- Filter by category.
- Search transactions.

Default categories:

Income:
- Salary
- Freelance
- Business
- Investment
- Other income

Expenses:
- Food
- Transportation
- Shopping
- Education
- Entertainment
- Bills
- Health
- Other expenses

Currency:
IDR (Indonesian Rupiah).

Display amounts using Indonesian currency formatting.

## C. FINANCIAL ANALYTICS

Create a financial analytics screen with:

- Circular income vs expense visualization.
- Monthly expense breakdown.
- Category percentage distribution.
- Weekly spending trends.
- Monthly financial comparison.
- Total savings percentage.
- Income and expense charts.

All charts must use actual database data.

Never use fabricated values as production analytics.

Provide empty states when users have no transactions.

## D. BUDGET MANAGEMENT

Allow users to:

- Set monthly spending limits.
- Set category-specific budgets.
- Monitor budget consumption.
- View remaining budget.
- Receive warnings when approaching budget limits.
- Identify overspending categories.

Use green, yellow, and red indicators according to spending thresholds.

## E. SAVINGS PLANNER

This module is essential.

Allow users to create savings goals.

Each goal must support:

- Goal name.
- Target amount.
- Current saved amount.
- Target date.
- Optional description.
- Progress percentage.
- Remaining amount.

Example:

Goal: Buy a laptop
Target: Rp8,000,000
Current: Rp1,500,000
Progress: 18.75%

Provide:

- Circular progress indicator.
- Estimated monthly savings required.
- Estimated completion date.
- Add savings contribution.
- Edit and delete goals.

Create a savings calculator that estimates how much users need to save daily, weekly, or monthly.

## F. FINANCIAL REPORT

Provide:

- Daily financial summary.
- Weekly report.
- Monthly report.
- Income report.
- Expense report.
- Savings report.

Allow export to CSV and JSON.

Allow backup and restoration of local application data.

Validate imported data before replacing existing records.

# 6. DATABASE AND DATA INTEGRITY

Use SQLite with a well-defined schema.

Suggested entities:

- transactions
- categories
- budgets
- savings_goals
- savings_contributions
- app_settings

Requirements:

- Proper database migrations.
- Transaction-safe database operations.
- Persistent data after app restart.
- Consistent calculations.
- Input validation.
- Handle empty databases.
- Handle invalid amounts.
- Prevent accidental duplicate submissions.
- Use integer rupiah values to avoid floating-point financial calculation errors.

The app must work without a backend.

Do not upload personal financial information to external servers.

# 7. USER EXPERIENCE

Implement:

- Onboarding screen.
- Home dashboard.
- Transaction screen.
- Analytics screen.
- Savings screen.
- Settings screen.
- Bottom navigation.
- Floating add transaction button.
- Confirmation dialogs.
- Loading states.
- Empty states.
- Error states.
- Success feedback.

Navigation must work correctly.

Animations should be smooth without sacrificing performance.

Avoid unnecessary animations that consume battery or slow down older devices.

# 8. SETTINGS AND PRIVACY

Implement:

- Currency settings.
- Dark/light theme if practical.
- Export data.
- Import backup.
- Clear data with confirmation.
- App version.
- Privacy information.

Do not request unnecessary Android permissions.

Do not require contacts, location, SMS, or accessibility permissions.

# 9. TESTING — MANDATORY

Do not consider the application finished merely because it compiles.

Perform:

1. TypeScript checks.
2. ESLint checks.
3. Unit tests for financial calculations.
4. Database tests.
5. Transaction CRUD tests.
6. Savings calculations tests.
7. Budget calculation tests.
8. Navigation tests.
9. Production build verification.
10. APK installation verification when an Android device or emulator is available.

Test important scenarios:

- Adding income.
- Adding expenses.
- Editing transactions.
- Deleting transactions.
- Calculating balance.
- Calculating savings percentages.
- Creating savings goals.
- Adding savings contributions.
- Restarting the app and checking persistence.
- Exporting and restoring data.
- Handling empty data.

Fix all discovered bugs.

Never disable tests or weaken assertions just to obtain a green CI result.

# 10. APK BUILD AND DISTRIBUTION

Build a standalone Android APK.

Preferred output:

`dist/simply-cashflow.apk`

Requirements:

- Release build.
- Installable without Expo Go.
- Correct application identifier.
- Correct application name: Simply Cashflow.
- Application icon.
- Splash screen.
- Proper version number.
- Universal APK if supported by the selected build configuration.

Verify the APK artifact exists and is valid.

If local Android build tools are unavailable, investigate Expo EAS Build as an alternative.

Do not claim an APK has been produced until the artifact is actually available.

# 11. GITHUB INTEGRATION AND RELEASE

GitHub account owner: Hiro778.

First inspect existing repositories.

Create a separate repository named:

`simply-cashflow`

Do not replace or damage the existing `simply-ppt` repository.

Repository structure should be professional:

- app/
- src/
- assets/
- components/
- database/
- hooks/
- services/
- utils/
- tests/
- .github/workflows/
- README.md
- LICENSE
- package.json
- app.json or app.config.ts

Add:

- Comprehensive README.
- Application screenshots when available.
- Installation instructions.
- Feature documentation.
- Tech stack.
- Development instructions.
- Build instructions.
- Privacy information.
- GitHub Actions workflow.

Configure GitHub Actions to run:

- Dependency installation.
- TypeScript validation.
- Linting.
- Unit tests.
- Build verification where feasible.

Create a GitHub Release with:

Tag: v1.0.0

Release title: Simply Cashflow v1.0.0

Attach the actual installable APK.

Also update the existing GitHub profile README or project showcase, if one exists, to include a link to the new Simply Cashflow repository.

Do not modify unrelated repository contents.

# 12. GREEN CI/CD REQUIREMENT

The target is a clean GitHub repository with all required CI checks passing.

Requirements:

- No unresolved TypeScript errors.
- No failing tests.
- No broken imports.
- No missing assets.
- No broken build scripts.
- No hardcoded secrets.
- No accidentally committed credentials.
- No unnecessary dependencies.
- No fake CI success.
- No red failed checks left unresolved.

Use appropriate GitHub Actions permissions and secure secrets handling.

Commit changes in logical stages with descriptive commit messages.

# 13. FINAL EXECUTION SEQUENCE

Execute the following stages in order:

STAGE 1 — Environment and repository audit.

STAGE 2 — Context7 documentation research and architecture.

STAGE 3 — UI/UX implementation and design system.

STAGE 4 — Database and core functionality.

STAGE 5 — Analytics, budget, and savings planner.

STAGE 6 — Integration and error fixing.

STAGE 7 — Automated testing.

STAGE 8 — Android production APK build.

STAGE 9 — GitHub repository creation and CI/CD.

STAGE 10 — GitHub Release v1.0.0.

STAGE 11 — Update GitHub profile showcase.

STAGE 12 — Final verification and delivery report.

Do not stop between stages unless an external blocker genuinely prevents further execution.

If a blocker occurs:
- Identify the exact error.
- Investigate its root cause.
- Try reasonable alternative solutions.
- Preserve existing work.
- Report anything that genuinely requires user intervention.

# 14. FINAL DELIVERY REPORT

At completion, report:

1. Repository URL.
2. GitHub Release URL.
3. APK download location.
4. Application version.
5. Supported Android versions.
6. Implemented features.
7. Tests executed and their actual results.
8. Build status.
9. GitHub Actions status.
10. Known limitations, if any.

SUCCESS CRITERIA:

A real, functional, installable Android application named Simply Cashflow, with persistent financial data, working charts, transaction management, budgeting, savings planning, a verified APK, and a properly published GitHub repository.

START EXECUTION NOW.
