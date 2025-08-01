# Legacy vs New Parity Matrix

## Overview
This document maps each feature from the legacy Nova-Universe platform to its corresponding component in the new architecture. It ensures feature parity and highlights any gaps or deferred features.

---

## Feature Mapping

### Core Modules

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| System Configuration                    | Nova Core                      | Complete     |
| Audit Trail                             | Nova Core                      | Complete     |
| Workflow Engine                         | Nova Core                      | Complete     |
| SLA Management                          | Nova Core                      | Complete     |

### Identity and Access Management

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| SSO (SAML, OIDC)                        | Nova Helix                     | Complete     |
| SCIM Provisioning                       | Nova Helix                     | Complete     |
| Role-Based Access Control (RBAC)        | Nova Helix                     | Complete     |
| Session Control                         | Nova Helix                     | Complete     |

### Technician Portal

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| IT Support                              | Pulse:IT                       | Complete     |
| HR Case Management                      | Pulse:HR                       | Complete     |
| Facilities and Logistics                | Pulse:Ops                      | Complete     |
| Cybersecurity Incidents                 | Pulse:Cyber                    | Complete     |

### End-User Portal

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| Ticket Submission                       | Nova Orbit                     | Complete     |
| Smart Global Search                     | Nova Orbit                     | Complete     |
| Cosmo Assistant Integration             | Nova Orbit                     | Complete     |

### Knowledge Base

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| Public/Private Articles                 | Nova Lore                      | Complete     |
| Feedback and Ratings                    | Nova Lore                      | Complete     |
| AI Recommendations                      | Nova Lore                      | Complete     |

### AI and Automation

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| Ticket Classification                   | Nova Synth                     | Complete     |
| Workflow State Transitions              | Nova Synth                     | Complete     |
| MCP Integration                         | Nova Synth                     | Complete     |

---

## Gaps and Deferred Features

| Legacy Feature                          | New Component                  | Status       |
|-----------------------------------------|---------------------------------|--------------|
| Advanced Reporting and Analytics        | Nova Synth                     | Planned      |
| Workflow Automation                     | Nova Core                      | Planned      |
| Mobile App                              | Nova Orbit                     | Planned      |
| Third-Party Integrations (Slack, Teams) | Nova Comms                     | Planned      |

---

## References
- Feature Inventory Document: `/docs/Feature_Inventory.md`
- Legacy SQLite module (formerly `/nova-api/db-legacy.js`, now removed)
- Documentation: `/docs/IMPLEMENTATION_PROGRESS.md`, `/project_docs/Project_Overview.txt`
