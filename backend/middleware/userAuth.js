import Jwt from 'jsonwebtoken';


const userAuth = (req, res, next) => {
  let token = req.cookies.token;
  // Also check Authorization header for Bearer token
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. Please login again.",
    });
  }
  try {
    const tokenDecode = Jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode) {
      req.userId = tokenDecode.id; // set on req, not req.body
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default userAuth;