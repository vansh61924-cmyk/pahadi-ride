# Security Specification for Pahadi Ride

## 1. Data Invariants
- **User Integrity**: Users can only read and write their own profile and saved payment methods.
- **Ride Ownership**: Rides must have a valid `userId` matching the creator's UID.
- **Transaction History**: Users can only see their own transactions.
- **Immutability**: `createdAt` and `userId` fields cannot be changed after creation.
- **Status Transitions**: Rides can only move through specific states (pending -> active -> completed/cancelled).

## 2. The Dirty Dozen Payloads (Target: DENY)
1. Creating a ride with someone else's `userId`.
2. Reading another user's `paymentMethods` subcollection.
3. Updating a completed ride's price.
4. Changing the `createdAt` timestamp of a ride.
5. Deleting a transaction record.
6. Creating a user profile with `isAdmin: true` (if we had such a field, we'll block arbitrary field injection).
7. Listing all rides in the system without a `userId` filter.
8. Updating a ride's `userId` to a different user.
9. Injecting a 2MB string into a location name.
10. Creating a payment method without being verified (optional, but good for hardening).
11. Spoofing `auth.uid` via client-side manipulation (Rules handle this via `request.auth.uid`).
12. Creating a ride for a non-existent destination ID (using basic validation).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these via the Firebase Emulator or unit tests.
