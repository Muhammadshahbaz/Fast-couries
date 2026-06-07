# Fast Couriers Admin Operations SOP

## Seller Approval

- Review KYC, business name, pickup city, expected monthly parcels, COD amount range, and product category before enabling live booking.
- Keep incomplete or high-risk sellers in review mode until documents and contact details are verified.
- Record approval notes so future support, finance, and claims decisions have context.

## Courier API Failure

- Use courier health checks before switching a provider from live to degraded mode.
- If booking fails, keep the shipment visible and let operations retry or select another courier.
- Store API response codes, request reference, AWB state, and the operator who took action.

## Returned Parcel Proof

- Require delivery attempt count, rider remarks, buyer response, timestamp, location proof, and courier reference.
- Attach call recording URLs, attempt photos, or geo evidence where the courier provides it.
- Mark proof as verified only after evidence is linked to the shipment record.
- Let sellers open a claim when proof is weak, missing, or contradictory.

## Payout Dispute

- Compare delivered shipments, COD collection, bank charge, COD handling, COD deduction, adjustments, and net payable.
- Keep disputes linked to payout invoices instead of resolving them only in support chat.
- Record adjustment amount, reason, operator, and payment reference before closing.

## Damage Or Loss Claims

- Collect shipment value, seller invoice, parcel photos, courier remarks, delivery/return status, and courier claim reference.
- Do not submit incomplete claims to courier partners.
- Keep claim status visible to seller, support, finance, and operations.

## Support Escalation

- Link tickets to seller, shipment, buyer city, courier, payout invoice, and return proof where possible.
- Prioritize stuck COD, delayed returns, lost parcels, and weak return proof.
- Use saved response templates, but add shipment-specific facts before replying.
