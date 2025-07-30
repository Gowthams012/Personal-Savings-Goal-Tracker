import Jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. Please login again.",
    });
  }
  try {
    const tokenDecode = Jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode) {
      req.body.userId = tokenDecode.id; 
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