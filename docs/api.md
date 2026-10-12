# NexaBank AI - REST API Reference (v1)

Base URL: `/api/v1`

## 1. Authentication (`/auth`)
- **`POST /api/v1/auth/register`**: Register new customer account and provision default Checking account.
- **`POST /api/v1/auth/login`**: Authenticate using email and password. Returns Bearer token and customer profile.
- **`POST /api/v1/auth/switch-demo-persona`**: Instantly switch roles between `CUSTOMER`, `SUPPORT_AGENT`, `COMPLIANCE_OFFICER`, and `ADMIN`.
- **`GET /api/v1/auth/me`**: Get authenticated user profile and roles.
- **`POST /api/v1/auth/logout`**: Terminate session.

## 2. Accounts (`/accounts`)
- **`GET /api/v1/accounts`**: Retrieve checking and savings accounts for the logged-in user.
- **`GET /api/v1/accounts/:accountId`**: Retrieve detailed account info with ownership validation.
- **`GET /api/v1/accounts/:accountId/summary`**: Get available balance, ledger balance, and pending hold metrics.

## 3. Transactions & Transfers (`/transactions`, `/transfers`)
- **`GET /api/v1/transactions`**: List transactions with query parameters (`search`, `type`, `category`, `status`, `startDate`, `endDate`, `limit`, `page`).
- **`GET /api/v1/transactions/:transactionId`**: Fetch individual transaction.
- **`GET /api/v1/transactions/:transactionId/receipt`**: Official printable receipt data.
- **`GET /api/v1/transactions/export/csv`**: Download reconciled CSV statement.
- **`POST /api/v1/transfers`**: Execute atomic transfer with idempotency key, balance validation, and recipient routing.

## 4. Beneficiaries (`/beneficiaries`)
- **`GET /api/v1/beneficiaries`**: List registered payees.
- **`POST /api/v1/beneficiaries`**: Add new payee with 2-hour security cooling-off window.
- **`DELETE /api/v1/beneficiaries/:beneficiaryId`**: Deactivate beneficiary.

## 5. Analytics (`/analytics`)
- **`GET /api/v1/analytics/spending`**: Breakdown by category with percentage calculations.
- **`GET /api/v1/analytics/monthly-summary`**: Multi-month cash inflow vs. outflow history.

## 6. GenAI Assistant (`/ai`)
- **`POST /api/v1/ai/chat`**: Send prompt to the AI banking assistant. Employs read-only tools:
  - `getAccountSummary()`
  - `getRecentTransactions(limit)`
  - `getSpendingByCategory()`
  - `getMonthlySummary()`
  - `explainTransactionStatus(reference)`
- **`GET /api/v1/ai/conversations`**: Retrieve conversation metadata.

## 7. Admin & Operations (`/admin`)
*(Restricted to `ADMIN`, `COMPLIANCE_OFFICER`, and `SUPPORT_AGENT` roles)*
- **`GET /api/v1/admin/overview`**: Aggregate platform volume, deposits, and active fraud alerts.
- **`GET /api/v1/admin/users`**: Customer registry and account balances.
- **`PATCH /api/v1/admin/users/:userId/status`**: Update user status (`ACTIVE`, `SUSPENDED`, `FLAGGED`).
- **`GET /api/v1/admin/transactions`**: All ledger transactions across the bank.
- **`GET /api/v1/admin/audit-logs`**: Immutable security audit trail.
- **`GET /api/v1/admin/system-health`**: Real-time service uptime, memory, and database diagnostics.

## 8. Real-Time Push (`/events`)
- **`GET /api/v1/events`**: Server-Sent Events (SSE) stream for instant balance refreshes and alert notifications.
