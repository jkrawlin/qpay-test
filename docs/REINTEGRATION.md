# Firebase Reintegration Guide (Phase 2)

This document maps the current in-memory + localStorage stubs back to their former (removed) Firestore/Firebase responsibilities and outlines a safe, flag‑driven path to reintroduce Firebase.

## 1. Feature Flag Control
- Flag file: `src/featureFlags.ts`
- Boolean: `ENABLE_FIREBASE` (derived from `VITE_ENABLE_FIREBASE` env var)
- Current state: All Firebase exports are null stubs. Reintegration must be wrapped in `if (FIREBASE_ENABLED)` guards.

Example pattern:
```ts
import { FIREBASE_ENABLED } from '@/firebase/config'
if (FIREBASE_ENABLED) {
  // Perform real Firestore query
} else {
  // Fall back to in-memory / local persistence
}
```

## 2. Existing Stubs & Intended Firestore Collections
| Service / File | Current Storage | Future Firestore Collection(s) | Notes |
| -------------- | --------------- | ------------------------------ | ----- |
| `payrollService.ts` | Memory + localStorage (`payroll:*`) | `payroll`, `salary_transactions`, `advance_loans`, `advance_payments` | Consider composite indexes on (employeeId, month, year) & (status). |
| `invoiceService.ts` | Memory + localStorage (`invoices:*`) | `invoices`, `payments` | Index on (customerId, issueDate desc), (status). |
| `customerService.ts` | Memory only | `customers` | Unique constraint on license / tax number (enforce app-side + security rules). |
| `documentService.ts` | Memory only | `documents` + Storage bucket | Add metadata subcollection if versioning required. |
| `notificationService.ts` | Memory only | `notifications`, `user_devices` (for FCM tokens) | Messaging requires FCM + permission UX. |
| `reportService.ts` | Aggregates from other services | Derived / On-demand queries | Some aggregates may become Cloud Functions. |
| `storage.ts` | Synthetic URLs | Firebase Storage buckets | Use security rules to restrict by user/company. |

## 3. Data Model Reconstruction
Reintroduce Firestore by defining converters or schemas (optional) to ensure consistent typing.

Example converter template:
```ts
import { Timestamp } from 'firebase/firestore'

export const invoiceConverter = {
  toFirestore(data: Invoice) { return { ...data, issueDate: Timestamp.fromDate(data.issueDate) } },
  fromFirestore(snap: any): Invoice { const d = snap.data(); return { ...d, issueDate: d.issueDate.toDate() } }
}
```

## 4. Migration Strategy
1. Keep stubs as default (flag off) until parity tests pass.
2. Implement dual-write (optional transitional): when flag enabled, write to Firestore AND local in-memory arrays; read primarily from Firestore.
3. Once stable, remove local dual-write path (retain localStorage only as offline cache if desired).
4. Add background sync to reconcile differences (if offline mode needed).

## 5. Security Rules Outline (Conceptual)
- `invoices`: allow read/write where `request.auth.uid == resource.data.createdBy` or user role includes `admin`.
- `payroll`: restrict salary details to HR roles and the employee (limited fields).
- `advance_loans`: only HR/admin can approve; employee can read own loans.
- `notifications`: user can read their own; writes restricted to system/cloud functions.
- `documents`: metadata readable by owners, file access via Storage rules using custom claims/company ID.

## 6. Index Recommendations
Add (or in Firebase console auto-generate) indexes for high-selectivity queries:
- Invoices: `(customerId, issueDate desc)`, `(status, dueDate)`
- Payroll: `(employeeId, year, month)`, `(status)`
- Advance Loans: `(employeeId, status)`
- Notifications: `(userId, createdAt desc)`

## 7. Environment Variables
Ensure the following are restored (now optional in `vite-env.d.ts`):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_ENABLE_FIREBASE=false
```

## 8. Step-by-Step Reintegration Checklist
1. Install Firebase SDK: `npm i firebase`.
2. Replace stubs in `firebase/config.ts` with real initialization guarded by `FIREBASE_ENABLED`.
3. Incrementally refactor one service at a time (e.g., invoices) to use Firestore queries behind the flag.
4. Run tests (Vitest) after each service migration ensuring no regression for flag-off mode.
5. Introduce integration tests (future) hitting a local emulator suite before enabling in production.
6. Remove dual writes once confidence established.

## 9. Testing Considerations
- Keep current unit tests to validate logic independent of backend.
- Add new tests that mock Firestore (or use emulator) when flag is on.
- Ensure deterministic ID generation for test mode (optionally inject ID factory).

## 10. Offline / Cache Option (Optional Future)
- Retain localStorage adapter as a write-through cache.
- Add a `lastSync` timestamp per collection key.
- Provide manual `syncNow()` methods per service.

## 11. Rollback Plan
If production issues arise post-reintegration:
1. Toggle `VITE_ENABLE_FIREBASE=false` and redeploy (build will omit Firestore tree shaking if imports gated).
2. Data created during Firestore-active window lives in Firestore; local stub continues unaffected.
3. Investigate logs / emulator locally, patch, retest, re-enable.

## 12. Future Hardening
- Introduce a repository abstraction interface so backing store swap does not touch service logic.
- Implement domain events (e.g., `InvoiceCreated`, `SalaryPaid`) for side effects (notifications, reports) decoupled from persistence.
- Add e2e smoke tests (Playwright or Cypress) validating high-level workflows with flag on/off.

---
Prepared as part of Phase 1 de-integration to ensure smooth Phase 2 reintroduction.
