# Nova API: Microsoft 365 Email Integration

## Setup Steps

1. **Azure App Registration**
   - Register an app in Azure AD.
   - Grant Application Permissions:
     - `Mail.Send`
     - `Mail.ReadWrite`
     - `MailboxSettings.Read`
     - `User.Read.All`
   - Record the Client ID, Tenant ID, and Client Secret.

2. **Mailbox Access**
   - Assign full mailbox access for each M365 account:
     ```powershell
     Add-MailboxPermission -Identity "ops@domain.com" -User "APP_ID@TENANT.onmicrosoft.com" -AccessRights FullAccess
     ```

3. **Environment Variables**
   - Add the following to your `.env`:
     - `M365_CLIENT_ID`
     - `M365_CLIENT_SECRET`
     - `M365_TENANT_ID`
     - `M365_GRAPH_SCOPES` (default: `Mail.ReadWrite Mail.Send MailboxSettings.Read User.Read.All`)
     - `M365_WEBHOOK_SECRET` (random string for clientState validation)
     - `M365_POLL_INTERVAL_MS` (optional, default: 60000)

4. **Database Migration**
   - Run migrations to create the `email_accounts` table.

5. **Configure Email Accounts**
   - Use the admin API endpoints to add M365 accounts:
     - `POST /core/email-accounts`
     - `PUT /core/email-accounts/{id}`
     - `DELETE /core/email-accounts/{id}`

6. **Start the Email Service**
   - The service will poll or subscribe to webhooks for enabled accounts.
   - Incoming emails will be processed and tickets created via Synth.

7. **Send Outbound Email**
   - Use `POST /email/send` with `{ from, to, subject, html, queue }`.

## Security Notes

- Store secrets securely (do not commit to source control).
- Use HTTPS for all endpoints.
- Monitor and renew webhook subscriptions regularly.

## References

- [Microsoft Graph API Docs](https://learn.microsoft.com/en-us/graph/overview)
- [Change Notifications/Webhooks](https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks)
- [Delta Query](https://learn.microsoft.com/en-us/graph/delta-query-overview)
