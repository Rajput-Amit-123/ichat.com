const jwt = require('jsonwebtoken');
const config = process.env;
let alert = require('alert');


const verifyToken = async (req, res, next) => {
token = req.cookies.token;
        if (!token) {
           alert("Token is Not Found Redirecting to the Login");
                return res.status(403).redirect('/Login');
        }
   
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (error) {
        console.log(5);
        return res.status(401).send(`${error}`);
    }
    return next();
};

module.exports = verifyToken;