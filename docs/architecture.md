# NexaBank AI - System Architecture

## 1. System Overview
NexaBank AI is an enterprise-grade digital banking web application architected to showcase modern full-stack development, reactive UI design, banking ledger consistency, role-based access control, and secure Generative AI tool integration.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  [ Angular / React Standalone Frontend with Reactive Signals & RxJS Streams ]   |
|   - Customer Dashboard    - Money Transfer Wizard    - Transaction Explorer      |
|   - Beneficiary Hub       - Analytics & Charts       - GenAI Assistant Dialog    |
|   - Admin Operations      - Real-Time SSE Listener   - Role Switcher / Demo      |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST & SSE Stream
+------------------------------------------v----------------------------------------+
|                               API GATEWAY & MIDDLEWARE                            |
|   - Security Headers (nosniff, frameguard)   - Auth & Role Guards (RBAC)          |
|   - Rate Limiting Middleware                - Centralized Error Handler           |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                                  BACKEND CORE                                     |
|  [ Express.js REST Controllers & Modular Services ]                              |
|   - /api/v1/auth          - /api/v1/accounts         - /api/v1/transfers          |
|   - /api/v1/transactions  - /api/v1/beneficiaries    - /api/v1/analytics          |
|   - /api/v1/notifications - /api/v1/admin            - /api/v1/events (SSE)       |
+----------------------------------+-----------------------+------------------------+
                                   |                       |
               +-------------------+                       +-------------------+
               |                                                               |
+--------------v---------------------------+       +---------------------------v----+
|            TRANSACTIONAL DATA STORE      |       |      GENAI BANKING ENGINE      |
|  - Mongoose-compatible Collections       |       |  - Gemini 3.8 Flash / OpenAI   |
|  - Integer Minor Units (Cents Arithmetic)|       |  - Read-Only Banking Tools     |
|  - Idempotency Cache & Atomic Transfers  |       |  - Strict Prompt Isolation     |
|  - Audit Log Trail & Event Emitter       |       |  - Structured Markdown & Tables|
+------------------------------------------+       +--------------------------------+
```

## 2. Frontend Reactive Architecture
The frontend utilizes modern standalone component architecture with Angular Signals and RxJS reactive streams:
1. **Signal State Primitives**: Local reactive state (active tab, transfer form steps, modal toggles, search filters) are managed using fine-grained reactive signals, guaranteeing zero redundant DOM renders.
2. **RxJS Event Pipeline**: Server-Sent Events (SSE) from `/api/v1/events` stream live updates directly into an observable store, triggering instant UI balance updates and toast notifications without manual polling.
3. **Enterprise UI Guidelines**: Built adhering to strict financial UI standards:
   - Navy Blue (`#0f172a`), Crisp White (`#ffffff`), and subtle Teal accents (`#0d9488`).
   - Zero-pill metadata design (clean unboxed text with subtle typographic separators).
   - High contrast WCAG AA compliant typography and accessible interactive states.

## 3. Data Integrity & Minor Currency Units
All currency calculations across the backend and database use **integer minor units (cents)** instead of floating-point numbers:
- Avoids IEEE 754 floating point precision errors (e.g. `0.1 + 0.2 = 0.30000000000000004`).
- Stored as `amountCents: 1485050` representing `$14,850.50`.
- Formatted gracefully in the UI layer.

## 4. Atomic Simulated Transfer Pipeline
1. Client generates or submits an `Idempotency-Key`.
2. Backend verifies source account ownership and ensures `availableBalanceCents >= amountCents`.
3. Validates recipient account or beneficiary cooldown rules.
4. Executes atomic debit on the source ledger and credit on the destination.
5. Emits audit log entry, records in-app notification, and triggers real-time SSE broadcast.
