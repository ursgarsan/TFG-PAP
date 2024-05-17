const requireAdmin = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

module.exports = { requireAdmin };
