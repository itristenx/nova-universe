# Nova Zoom and Slack Extensions Implementation Plan

## Overview
This document presents a complete implementation strategy for adding a communication
extensions framework to Nova. The framework will initially support Zoom and Slack,
allowing agents to link their accounts, collaborate on priority alerts, and archive
context for later review. The plan follows industry standards for OAuth security,
user experience, and maintainable system design.

## Architecture
1. **Extension Service** – Node.js module exposing a common interface for all
   communication providers (linking, messaging, meeting creation, and history
   retrieval).
2. **Integration Database Tables** – `integrations` stores provider metadata,
   encrypted OAuth tokens, refresh tokens, scopes, and expiry. `integration_links`
   associates tickets with Zoom meetings or Slack threads/channels.
3. **Background Workers** – Handle token refresh, call log synchronization, meeting
   recording retrieval, and Slack conversation archiving.
4. **Alerting Hooks** – Existing alerting system publishes P1 breaches to an event
   bus consumed by the extension service to start war‑room meetings and Slack
   notifications.

## Zoom Extension
### Capabilities
- **OAuth 2.0 Account Linking** – Implement Zoom’s authorization code flow with
  scopes `meeting:read`, `meeting:write`, `phone:read`, and `user:read`. Tokens are
  stored encrypted and refreshed automatically.
- **Shared Number Call Retrieval** – Use Zoom Phone API (`/phone/users/{userId}/call_logs`)
  to sync call logs for IT and Operations numbers. Agents can pull call details from
  Nova’s UI.
- **Automated War‑Rooms** – On P1 alert breach, create a meeting via
  `POST /users/{userId}/meetings` with waiting room disabled, host video enabled,
  and participant list pre‑filled from the alert team. Meeting ID and join URL are
  saved to the ticket and broadcast to Slack and email.
- **Recording Links** – Subscribe to Zoom webhooks to capture meeting end events and
  recording availability. Store recording URLs and pass them to ticket history.

### Implementation Steps
1. Build OAuth redirect endpoint and token exchange logic.
2. Create database migrations for `integrations` and `integration_links` tables.
3. Add background job to poll Zoom call logs every five minutes for linked shared
   numbers.
4. Extend alerting system to publish P1 breach events and consume them in the
   extension service to schedule meetings.
5. Implement webhook receiver to process meeting recordings and attach them to
   tickets.

## Slack Extension
### Capabilities
- **Granular Bot OAuth** – Use Slack’s OAuth 2.0 with granular permissions:
  `commands`, `chat:write`, `im:history`, `channels:manage`, `channels:history`,
  `users:read`, and `app_home:read`. Tokens are stored encrypted with automatic
  refresh.
- **Ticket Creation From Messages** – Provide a message shortcut and `/nova-ticket`
  slash command. The handler captures the full thread using `conversations.replies`
  and posts confirmation with deep links back to Nova.
- **Follow‑Up Notifications** – Nova sends status updates to the original Slack
  thread using `chat.postMessage` and maintains thread IDs in `integration_links`.
- **App Home Dashboard** – Render a dynamic Home tab listing assigned tickets and
  Cosmo recommendations using the Slack Views API.
- **Split View for Cosmo** – When an agent opens a ticket from Slack, use
  `view.open` with `tab = "modal"` to show Cosmo in a modal while keeping the
  conversation thread visible.
- **Interactive Modals and Messages** – Use block kit components for ticket fields,
  updates, and approvals, matching UX quality of leading apps such as PagerDuty and
  Zendesk.
- **Private Review Channels** – For sensitive conversations, allow agents to move a
  thread into a temporary private channel via `conversations.create` with
  `is_private=true`. The channel ID is recorded, participants are invited, and the
  channel is archived when the ticket closes with transcript stored in Nova.

### Implementation Steps
1. Implement Slack OAuth flow and persist workspace/user tokens.
2. Build App Home view renderer and register `app_home_opened` event handler.
3. Register message shortcut and slash command handlers for ticket creation.
4. Add follow‑up notification service to post updates and link back to Nova.
5. Develop conversation capture job that retrieves thread history nightly and saves
   it to ticket archives.
6. Provide API endpoint to move threads to private channels and archive them at
   resolution.

## Admin UI and Onboarding
- Integrate Slack and Zoom setup into Nova's Setup Wizard with clear connection status.
- Generate OAuth authorization URLs from backend routes and store encrypted tokens after callbacks.
- Offer reconnect options and visibility of linked accounts in the admin dashboard for ongoing management.

## Unified Deep Linking
- Tickets contain arrays of Zoom meeting IDs, recording URLs, Slack thread IDs, and
  private channel IDs. Nova’s UI renders these as actionable links.
- A helper generates reciprocal links: clicking a Zoom meeting opens the related
  ticket; Slack message buttons open the Zoom war‑room if one exists.

## Security and Compliance
- Encrypt all tokens using AES‑256 with keys managed by the existing secrets
  service.
- Apply the principle of least privilege when requesting OAuth scopes.
- Log OAuth events and admin actions for auditing. Retain conversation and meeting
  records according to Nova’s data retention policy.
- Implement unit and integration tests for all OAuth flows, API wrappers, and event
  handlers.

## Roadmap
1. Create extension service skeleton and database migrations.
2. Implement Zoom OAuth, call log sync, and war‑room meeting creation.
3. Implement Slack OAuth, ticket creation, App Home, and notification features.
4. Add conversation capture, private channel archival, and Zoom recording links.
5. Expose extension management in the Nova UI for agents to link accounts and view
   associated conversations.
6. Conduct security review and penetration testing before production rollout.

## Testing and Monitoring
- Add unit tests for OAuth handlers, API clients, and event processors.
- Run integration tests using mocked Zoom and Slack endpoints.
- Monitor job queues, API latency, and error rates with the existing monitoring
  stack. Alert on failed token refreshes or webhook deliveries.

This plan provides a complete, ordered blueprint for building world‑class Zoom and
Slack extensions in Nova without placeholders or unresolved tasks.

## Implementation Progress
- [x] Zoom connector exposes war-room creation and shared number call retrieval
- [x] Slack connector supports ticket creation from messages and moving messages to private review channels
