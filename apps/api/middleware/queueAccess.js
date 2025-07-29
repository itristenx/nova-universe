export function checkQueueAccess(queueGetter) {
  return (req, res, next) => {
    const queue = typeof queueGetter === 'function' ? queueGetter(req) : queueGetter
    if (typeof queue !== 'string') {
      return res.status(400).json({
        error: 'Queue parameter must be a string',
        errorCode: 'INVALID_QUEUE_TYPE'
      })
    }
    const sanitizedQueue = queue.trim()

    if (sanitizedQueue === '') {
      return res.status(400).json({
        error: 'Invalid queue parameter',
        errorCode: 'INVALID_QUEUE'
      })
    }
// Define a regex pattern for valid queue identifiers
const VALID_QUEUE_IDENTIFIER_REGEX = /^[A-Za-z0-9_-]+$/;

    if (!VALID_QUEUE_IDENTIFIER_REGEX.test(sanitizedQueue)) {
      return res.status(400).json({
        error: 'Invalid queue parameter',
        errorCode: 'INVALID_QUEUE'
      })
    }

    const user = req.user || {}
    const { queues = [], roles = [] } = user

    if (roles.includes('admin') || roles.includes('superadmin')) {
      return next()
    }
    if (queues.includes(sanitizedQueue)) {
      return next()
    }
    return res.status(403).json({
      error: 'Insufficient queue permissions',
      errorCode: 'QUEUE_ACCESS_DENIED'
    })
  }
}
