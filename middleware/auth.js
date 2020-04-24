const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  //Get Token
  const token = req.header('x-auth-token');

  //Check if token is available
  if (!token) {
    return res
      .status(401)
      .json({ msg: 'Access is deneid. Token not recognized' });
  }

  //Verify Token
  try {
    const decode = jwt.decode(token, config.get('jwtSecret'));

    req.user = decode.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
