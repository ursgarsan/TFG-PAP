const isAdminLogged = (req, res, next) => {
  if (req.session.adminId) {
    req.isAdminLoggedIn = true;
  } else {
    req.isAdminLoggedIn = false;
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

module.exports = { requireAdmin, isAdminLogged };
