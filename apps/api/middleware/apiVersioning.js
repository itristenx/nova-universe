export function deprecateUnversionedRoute({ replacement, sunset = '2026-01-31', version = 'v1' } = {}) {
  return function deprecationHeaderMiddleware(req, res, next) {
    try {
      res.setHeader('Deprecation', 'true');
      // RFC 8594 suggests an IMF-fixdate for Sunset
      const sunsetDate = new Date(sunset);
      if (!Number.isNaN(sunsetDate.getTime())) {
        res.setHeader('Sunset', sunsetDate.toUTCString());
      }
      if (replacement) {
        res.setHeader('Link', `<${replacement}>; rel="successor-version"`);
        res.setHeader('API-Version', version);
      }
      // Provide a hint header without breaking existing clients
      res.setHeader('Warning', `299 - This endpoint is deprecated. Use ${replacement || 'a versioned route'} instead.`);
    } catch (err) {
      // Do not block the request on header issues
    }
    next();
  };
}