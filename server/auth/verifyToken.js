// middleware to check if jwt is valid

const jwt = require("jsonwebtoken");
const { getOneUserByUsername } = require("../queries");

const auth = async function (req, res, next) {
    // get token from header
    const token = req.header("auth-token");

    // no token provided
    if (!token) {
        res.status(401).json({
            message: "Please provide an auth-token in header.",
        });
        return;
    }

    // validate token
    try {
        // validate token and extract user information
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);

        // add user data to req object
        req.user = verified;

        // check if account was confirmed
        const userDB = await getOneUserByUsername(verified.username);
        if (!userDB.rows[0].confirmed) {
            res.status(401).json({
                message: "Please confirm your account.",
            });
        }

        // call next to successfully redirect to route
        next();
    } catch (error) {
        res.status(401).json({
            message: "Authentication error, invalid auth-token",
        });
        return;
    }
};

module.exports = auth;
