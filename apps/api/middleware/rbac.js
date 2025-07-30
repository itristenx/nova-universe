// Simple RBAC middleware for Express
module.exports.requireRole = function(roles) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    if (roles.some(r => userRoles.includes(r))) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  };
};
