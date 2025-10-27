exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
  });
};

exports.get500 = (error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Internal Error',
    path: '/500',
    errorMessage: error,
    isAuthenticated: false, 
  });
};

exports.getNotReadyYet = (req, res, next) => {
  res.render("notready", {
    pageTitle: "Not ready",
    path: "/",
  });
};

