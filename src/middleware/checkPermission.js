module.exports = function (requiredPermission) {
  return (req, res, next) => {
    const user = req.user;
    if (
      !user ||
      !user.permissions ||
      !user.permissions.includes(requiredPermission)
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    next();
  };
};
