# Nova AI Fabric and MCP Hosting

This document outlines the AI fabric integrated into the API and how to configure providers (OpenAI, Local) and MCP hosting.

## Endpoints
- `POST /api/ai/chat` — unified chat completion with provider routing
- `GET /api/ai/providers` — enumerate defaults and supported providers
- `GET /api/mcp/health` — MCP server health
- `POST /api/mcp/request` — MCP HTTP transport entrypoint

All endpoints require authentication unless `DISABLE_AUTH=true` in non-production.

## Providers
- OpenAI: default (`NOVA_AI_DEFAULT_PROVIDER=openai`)
- Local: `NOVA_AI_DEFAULT_PROVIDER=local` routes to `local-ml.js`

Environment variables:
- `OPENAI_API_KEY` (required for OpenAI)
- `OPENAI_BASE_URL` (optional; supports Azure OpenAI or proxy)
- `OPENAI_ORG` (optional)
- `NOVA_AI_DEFAULT_PROVIDER` (default: openai)
- `NOVA_AI_DEFAULT_MODEL` (default: gpt-oss-20b)

## Security & Compliance
- PII redaction for third‑party providers (emails, phones, CC numbers)
- Audit log table `ai_audit_events` with request/response metadata, token usage, success flags
- Policy table `ai_policies` and feedback table `ai_feedback` for governance

## MCP Hosting
MCP server is initialized in `utils/cosmo.js` and exposed via `/api/mcp/*`. You can connect Nova to external ChatGPT-compatible models through MCP tools and keep internal routing/audit within Nova.

## Local AI/ML
`services/local-ml.js` is a placeholder. Replace with an on‑prem model (e.g., llama.cpp, vLLM) or internal inference server. Set `NOVA_AI_DEFAULT_PROVIDER=local` to avoid sending data to third parties.