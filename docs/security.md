# NexaBank AI - Security Architecture & Threat Model

## 1. Authentication & Session Security
- **Credential Storage**: Passwords hashed using cryptographically secure hashing algorithms with unique salts.
- **Short-Lived Bearer Sessions**: Stateless authorization tokens with server-side validation and expiration timers.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions enforced at the router middleware layer (`requireRole`) for:
  - `CUSTOMER`: Read/Write access only to personal accounts, payees, and transactions.
  - `SUPPORT_AGENT`: Read-only access to customer profiles and account summaries for customer service inquiries.
  - `COMPLIANCE_OFFICER`: Read/Write access to user flags, audit trails, and anti-fraud monitoring.
  - `ADMIN`: Full operational and system monitoring permissions.

## 2. Financial Ledger Integrity
- **Minor Unit (Cents) Math**: All calculations executed using integers to eliminate floating point truncation.
- **Idempotency Safeguard**: Every transfer supports an `Idempotency-Key` preventing accidental duplicate debits caused by network retries or double clicks.
- **Server-Side Ownership Verification**: Balances and account permissions submitted by the client are strictly ignored; backend queries the transactional store to verify available funds before committing debits.
- **Cooling-Off Cooldowns**: Newly added beneficiaries are placed into a security cooldown window before high-value transfers can be executed.

## 3. Generative AI Safety Architecture
- **Read-Only Enclosure**: The AI assistant only has access to strictly typed, read-only tools. It cannot invoke transfers, modify balances, or delete payees.
- **Prompt Injection Defense**: Untrusted customer descriptions and transaction notes are escaped and stripped before injection into model context.
- **Account Number Masking**: Account numbers are masked (`•••• 4821`) before exposure to the LLM or chat output.
- **Disclaimer Enforcement**: Every AI response is demarcated as simulated banking assistance and disclaimed from guaranteed financial advice.

## 4. Audit Logging
Every sensitive action (login attempts, transfers, beneficiary updates, status alterations, AI queries) is recorded into an append-only `AuditLog` collection with actor ID, IP address, timestamp, resource ID, and outcome status.
