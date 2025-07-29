# Microsoft 365 Email Integration

This module enables Nova Universe to send and receive mail directly via the Microsoft Graph API.

## Setup Steps
1. Create an Azure app registration and grant **Mail.ReadWrite** and **Mail.Send** application permissions.
2. Generate a client secret and exchange it for an access token. Store the token in `M365_TOKEN`.
3. Populate the `email_accounts` table with the addresses you want Nova to manage.
4. Start the API and ensure the polling service is running.

## Environment Variables
- `M365_TOKEN` – OAuth token with access to all managed mailboxes.
- `GRAPH_POLL_INTERVAL` – how often to poll for new messages (ms).

Accounts can be managed via the `/api/v1/email-accounts` endpoints. Outbound emails are sent through `/email/send`.
