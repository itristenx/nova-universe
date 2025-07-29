export function checkQueueAccess(queueGetter) {
  return (req, res, next) => {
    const queue = typeof queueGetter === 'function' ? queueGetter(req) : queueGetter
    const user = req.user || {}
    const { queues = [], roles = [] } = user

    if (roles.includes('admin') || roles.includes('superadmin') || queues.includes(queue)) {
      return next()
    }
    return res.status(403).json({
      error: 'Insufficient queue permissions',
      errorCode: 'QUEUE_ACCESS_DENIED'
    })
  }
}
