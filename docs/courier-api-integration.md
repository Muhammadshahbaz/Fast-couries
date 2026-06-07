# Courier API Integration Plan

Fast Couriers should expose one internal courier API while each external courier stays behind an adapter.

## Current Providers

- TCS: `TCS`
- FedEx: `FDX`
- Leopards: `LCS`
- M&P: `MNP`
- BlueEx: `BEX`
- Call Courier: `CC`

## Internal Contract

Every provider implements:

- `book(BookingData $booking): BookingResult`
- `track(string $awb): TrackingResult`
- `cancel(string $awb): CancellationResult`

This keeps booking, tracking, labels, cancellations, and future webhooks independent from each courier's payload shape.

## Credential Rules

- Keep all credentials in `.env`.
- Never store raw credentials in database rows.
- Store external AWB, label URL, last raw payload, and sync timestamp on shipments.
- Use sandbox mode until each courier account is approved and tested.

## Real API Rollout Order

1. TCS booking + tracking.
2. Leopards booking + tracking.
3. M&P booking + tracking.
4. BlueEx booking + tracking.
5. Call Courier booking + tracking.
6. FedEx for international shipments and premium routes.

## Next Engineering Step

Collect official API docs and sandbox credentials from each courier, then replace each sandbox adapter with the real payload mapping and HTTP calls.
