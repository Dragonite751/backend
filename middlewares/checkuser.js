const jwt = require("jsonwebtoken");

const requiredLogin = async (req, res, next) => {
  try {
    // Ensure the secret token is available
    if (!process.env.SECRET_TOKEN) {
      throw new Error("Secret token not configured in environment variables");
    }



    // Get token from headers or cookies
    
    const wait=await req.headers.authorization;
    console.log("wait:",wait);
    const token =  wait || req.cookies.authCookie;
    const tok=await token;
    console.log("token:",tok);
    // Check if token is present
    if (!tok) {
      return res.status(401).json({ error: "No auth token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(tok, process.env.SECRET_TOKEN);
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Log the error and send an unauthorized response
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid auth token" });
  }
};

module.exports = requiredLogin;
