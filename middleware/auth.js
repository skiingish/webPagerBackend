const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No Token, Auth denied' });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.get('jwtToken') || process.env.JWT_TOKEN
    );

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not vaild' });
  }
};
