const config = require("config");
const jwt = require("jsonwebtoken");

const ValidToken = require("../models/ValidToken");

function auth(req, res, next) {

  const token = req.header("auth-token");

  if(!token || token == "null" || token == "" || token == null || token == undefined ) {
      console.log("---token undefined---");
      return res.status(401).json({ 
        status:401,
        msg: "No token, authorization denied" 
    });
  }
  //Check for token

  try {
    // Verify token
    const decodedToken = jwt.verify(token, config.get("jwtSecret"));

    // Check valid token
    ValidToken.findOne({token}).then(validToken => {
      if (validToken) {
        // Add user from payloaf
        req.user = decodedToken;
        next();
      } else {
        console.log("Token is invalid ---------");
        res.status(400).json({ 
            status:400,
            msg: "Token is invalid" 
        });
      }
    })
  } catch (e) {
    console.log("Token is invalid ---------",e);
    res.status(400).json({ 
      status:400,
      msg: "Token is invalid" 
    });
  }
}

module.exports = auth;
