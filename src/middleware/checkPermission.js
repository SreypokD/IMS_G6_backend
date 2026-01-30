module.exports = function (requiredPermission) {
  return (req, res, next) => {
    const user = req.user;
    const perms =
      user && user.permission && Array.isArray(user.permission.permissions)
        ? user.permission.permissions
        : [];
    if (!user || !perms.includes(requiredPermission)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  };
};
