# Swagger v1 Grouping

- Group all v1 routes under a single spec served at `/api-docs/swagger.json` with tags per module (Core, Pulse, Orbit, Lore, CMDB, Inventory, Configuration)
- Ensure servers list includes `/api/v1` base for REST where appropriate
- Add deprecation notices to unversioned routes in spec
- Include examples for each operation used by the unified app pages