# Fast Couriers Production Deployment Checklist

## Environment

- Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://fastcouriers.pk`.
- Generate and store a production `APP_KEY`.
- Configure database, cache, queue, session, mail, and filesystem drivers.
- Set company identity values: `COMPANY_NAME`, `COMPANY_DOMAIN`, `COMPANY_SUPPORT_EMAIL`, `COMPANY_SUPPORT_PHONE`, `COMPANY_WHATSAPP`, `COMPANY_OFFICE`, and `COMPANY_HOURS`.
- Add courier API credentials and webhook secrets for every live partner.

## Infrastructure

- Enable HTTPS/SSL.
- Configure queue workers and Laravel scheduler.
- Enable log rotation and failed job monitoring.
- Configure daily database backups and storage backups.
- Restrict server, database, and backup access to approved admins.

## Application

- Change default admin password and remove demo-only accounts.
- Confirm seller registration, KYC upload, login, booking, tracking, return proof, and payout invoice flows.
- Run courier health checks before enabling production traffic.
- Confirm contact form and transactional mail delivery.
- Review the admin operations SOP for seller approval, courier API failure, returned parcel proof, payout disputes, claims, and support escalation.

## Launch

- Verify robots.txt, sitemap.xml, OpenGraph image, page titles, and metadata.
- Confirm support email, WhatsApp, phone, office address, and operating hours.
- Review COD policy, privacy policy, terms, and claims content.
- Take a final database backup immediately before launch.
