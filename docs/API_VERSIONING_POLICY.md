# API Versioning Policy

- Version in URL: `/api/v1/...`, `/api/v2/...`
- Additive changes allowed within a major version
- Breaking changes require a new major version path
- Deprecation signals on old routes:
  - `Deprecation: true`
  - `Sunset: <IMF-fixdate>`
  - `Link: <successor>; rel="successor-version"`
  - `API-Version: vN`
- Minimum 6-month deprecation window; publish timelines in changelog
- Swagger per version; examples updated alongside releases