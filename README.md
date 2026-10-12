# NexaBank AI - Enterprise Digital Banking & GenAI Financial Platform

NexaBank AI is an enterprise-grade digital banking web application featuring transactional checking & savings accounts, atomic money transfers, Server-Sent Events (SSE) real-time data sync, multi-role RBAC access control, financial analytics, and a secure Generative AI banking assistant built with Gemini 3.8 Flash.

---

## 🌟 Key Capabilities

### 1. Customer Banking Core
- **Multi-Account Portfolios**: Real-time checking and high-yield savings (4.75% APY) accounts with masked account numbers (`•••• 4821`).
- **Dual Balance Ledger**: Strict segregation between **Available Balance** (immediate spendable liquidity) and **Ledger Balance** (posted settlement total).
- **Atomic Money Transfers**: Instant wire transfers with idempotency key caching, balance protection (preventing negative balances), and counter-party ledger credits.
- **Beneficiary Directory**: Authorized payee directory with 2-hour security cooling-off periods to mitigate account takeover risk.
- **Statement & Receipt Engine**: Real-time transaction filtering, sorting, pagination, reconciled CSV statement export, and printable official receipts with verification codes.

### 2. Generative AI Financial Assistant
- **Gemini 3.8 Flash Core**: Integrated with the `@google/genai` TypeScript SDK.
- **Strict Read-Only Tool Execution**:
  1. `getAccountSummary()`
  2. `getRecentTransactions(limit, dateRange)`
  3. `searchTransactions(filters)`
  4. `getSpendingByCategory(dateRange)`
  5. `compareMonthlySpending(monthA, monthB)`
  6. `explainTransactionStatus(reference)`
  7. `generateStatementSummary(dateRange)`
- **Customer Context Isolation**: Queries are bounded strictly to the authenticated customer session; zero cross-tenant data leakage.
- **Safe Prompt Enclosure**: The AI cannot independently execute money transfers, edit balances, or delete payees. Includes deterministic financial engine fallback.

### 3. Operations, AML & Compliance Portal
- **Role-Based Access Control (RBAC)**: Support for `CUSTOMER`, `SUPPORT_AGENT`, `COMPLIANCE_OFFICER`, and `ADMIN` roles.
- **Anti-Fraud Surveillance**: Automated velocity checks and geographic anomaly detection with Suspicious Activity Report (SAR) case management.
- **Customer Status Management**: Toggle customer accounts between `ACTIVE` and `SUSPENDED`.
- **Cryptographic Audit Trail**: Immutable log of sensitive operations (logins, transfers, payee modifications, admin actions).
- **System Health & Latency Diagnostics**: Real-time database uptime, memory RSS, and API gateway response latency.

### 4. Real-Time Streaming Architecture
- **Server-Sent Events (SSE)**: Dedicated `/api/v1/events` stream pushing live transaction events, ledger balance updates, and security alerts directly to the client with sub-second latency.

---

## 🛠 Tech Stack

- **Frontend**: React 19 / Angular Standalone Architecture with Reactive Signals, RxJS event streams, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js LTS, Express.js REST API (`/api/v1`), TypeScript with strict typing.
- **Data Integrity**: In-memory + persistent transactional Mongo/Mongoose-compatible engine using **integer minor units (cents)** to avoid floating-point errors.
- **AI Core**: Google Gemini 3.8 Flash via `@google/genai` with deterministic banking engine fallback.
- **API Spec**: OpenAPI 3.0 / Swagger specification explorer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run

1. Clone or navigate to the repository:
   ```bash
   cd nexabank-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the complete application in development mode:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

4. Run the automated verification test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## 👥 Demo Personas (One-Click RBAC Switcher)

Use the Role Switcher in the top header to evaluate permissions across personas:
1. **Alex Morgan** (`CUSTOMER`): Everyday checking, transfers, payees, statements, and AI assistant.
2. **Sarah Jenkins** (`SUPPORT_AGENT`): Customer service portal and read-only customer account lookup.
3. **Elena Rostova** (`COMPLIANCE_OFFICER`): Anti-money laundering (AML) monitoring, velocity alert reviews, user suspensions.
4. **Marcus Vance** (`ADMIN`): Full administrative permissions, system health diagnostics, and audit logs.

---

## 📚 Architectural Documentation
- [`docs/architecture.md`](docs/architecture.md) - System architecture, reactive data flows, and ledger design.
- [`docs/api.md`](docs/api.md) - REST API endpoint specification.
- [`docs/security.md`](docs/security.md) - Security threat model, minor unit arithmetic, and AI boundaries.
