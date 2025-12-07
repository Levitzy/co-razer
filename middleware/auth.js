/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
}

/**
 * Middleware to check if user is authenticated (for HTML pages)
 * Redirects to login page if not authenticated
 */
function requireAuthPage(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login.html');
  }
  next();
}

/**
 * Middleware to add user info to response locals
 */
function addUserToLocals(req, res, next) {
  if (req.session && req.session.userId) {
    res.locals.user = {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email
    };
    res.locals.isAuthenticated = true;
  } else {
    res.locals.user = null;
    res.locals.isAuthenticated = false;
  }
  next();
}

module.exports = {
  requireAuth,
  requireAuthPage,
  addUserToLocals
};

