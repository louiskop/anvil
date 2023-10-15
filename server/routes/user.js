const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../auth/verifyToken");
const bcrypt = require("bcrypt");
const {
    getAllUsers,
    getOneUserByUsername,
    getOneUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    deleteAllNotesByUser,
    deleteShared,
    updateUserPassword,
    confirmUser,
} = require("../queries");
const {
    sendResetPasswordEmail,
    sendAccountActivationEmail,
} = require("../auth/emails");

// get all users
router.get("/", auth, async (req, res) => {
    const allUsers = await getAllUsers();
    res.status(200).json({ message: allUsers.rows });
});

// DONE: log in
router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await getOneUserByUsername(username);
    if (user.rows.length > 0) {
        // check if user is confirmed
        if (!user.rows[0].confirmed) {
            res.status(403).json({
                message: "Please confirm your account before logging in ",
            });
        }

        // check user password (hashed)
        const correctPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (correctPassword) {
            // token expires in 24hours
            var token = jwt.sign(
                { id: user.rows[0].id, username: user.rows[0].username },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: "24h",
                }
            );

            // token never expires
            if (req.body.remember_me) {
                token = jwt.sign(
                    { id: user.rows[0].id, username: user.rows[0].username },
                    process.env.TOKEN_SECRET
                );
            }

            res.status(200).json({ message: "Logged in", token: token });
        } else {
            res.status(401).json({ message: "Wrong password" });
        }
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

//DONE:sign up
router.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const avatar = req.body.avatar;
    const userCheck = await getOneUserByUsername(username);
    const emailCheck = await getOneUserByEmail(email);
    if (userCheck.rows.length > 0 || emailCheck.rows.length > 0) {
        res.status(403).json({ message: "User already exists" });
    } else {
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        await createUser({
            username: username,
            email: email,
            password: hashedPassword,
            avatar: avatar,
            confirmed: false,
        });

        // get the new user
        var user = await getOneUserByUsername(username);
        user = user.rows[0];

        // generate token with new secret and expiry
        var tokenString = jwt.sign(
            { id: user.id, username: user.username },
            process.env.TOKEN_SECRET_CONFIRMATIONS,
            {
                expiresIn: "24h",
            }
        );

        // generate link
        var link = `https://anvil-frontend.onrender.com/confirm?token=${tokenString}`;

        // send email with link
        sendAccountActivationEmail(user.email, link);

        res.status(200).json({
            message: "Success, check your email to activate your account!",
        });
    }
});

// confirm user
router.post("/account/confirm", async (req, res) => {
    const token = req.body.token;

    // verify token
    try {
        const data = jwt.verify(token, process.env.TOKEN_SECRET_CONFIRMATIONS);
        const userId = data.id;

        // confirm user in database
        await confirmUser(userId);

        res.status(200).json({ message: "Success, try to login now" });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({ message: "error, token has expired" });
        } else {
            res.status(401).json({ message: "error, wrong token" });
        }
    }
});

//DONE: Update user
router.put("/profile/update", auth, async (req, res) => {
    const id = req.user.id;
    const user = await getOneUserByUsername(req.user.username);

    console.log(user.rows[0]);

    // password MUST be provided for updating
    if (!req.body.oldpassword) {
        res.status(403).json({
            message: "Error, provide old password to update user",
        });
        return;
    }
    // check if correct old password was given
    const correctPassword = await bcrypt.compare(
        req.body.oldpassword,
        user.rows[0].password
    );

    if (!correctPassword) {
        res.status(403).json({
            message: "Error, provide correct old password to update user",
        });
        return;
    }

    // check if new password was given
    if (req.body.password) {
        // hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        var password = hashedPassword;
    } else {
        var password = user.rows[0].password;
    }

    const email = req.body.email ? req.body.email : user.rows[0].email;
    const avatar = req.body.avatar ? req.body.avatar : user.rows[0].avatar;
    const username = req.body.username
        ? req.body.username
        : user.rows[0].username;

    if (user.rows.length > 0) {
        // check for username duplicates
        if (req.body.username != user.rows[0].username) {
            const usernameCheck = await getOneUserByUsername(req.body.username);
            if (usernameCheck.rows.length > 0) {
                res.status(403).json({ message: "Username already exists" });
                return;
            }
        }

        const token = jwt.sign(
            { id: user.rows[0].id, username: username },
            process.env.TOKEN_SECRET
        );

        await updateUser({ id, password, email, avatar, username });
        res.status(200).json({
            message: "Successful update",
            authToken: token,
        });
    }
});

//DONE: delete
router.delete("/profile/delete", auth, async (req, res) => {
    const username = req.user.username;
    const user = await getOneUserByUsername(username);
    if (user.rows.length > 0) {
        //TODO: TRY catch for if user doesnt have notes od shared notes

        try {
            await deleteShared(req.user.id);
        } catch (error) {
            //console.log(error);
        }

        try {
            await deleteAllNotesByUser(req.user.id);
        } catch (error) {
            //console.log(error);
        }

        await deleteUser(username);
        res.status(200).json({ message: "Successful Delete" });
    }
});

// get specific user
router.get("/profile/details", auth, async (req, res) => {
    const username = req.user.username;
    const user = await getOneUserByUsername(username);

    if (user.rows.length > 0) {
        const userData = {
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            avatar: user.rows[0].avatar,
        };
        res.status(200).json({ message: userData });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

// send forgot password email
router.post("/password/forgot", async (req, res) => {
    const username = req.body.username;
    const user = await getOneUserByUsername(username);
    if (user.rows.length > 0) {
        // generate a jwt token with 10min expiry
        var tokenString = jwt.sign(
            { id: user.rows[0].id, username: user.rows[0].username },
            process.env.TOKEN_SECRET_PASSWORDS,
            {
                expiresIn: "10m",
            }
        );

        const generatedLink =
            "https://anvil-frontend.onrender.com/forgotPassword?token=" +
            tokenString;

        // email this link to user
        sendResetPasswordEmail(user.rows[0].email, generatedLink);

        // send success
        res.status(200).json({ message: "success" });
    } else {
        res.status(404).json({ message: "No such user found" });
    }
});

// update forgot password
router.post("/password/update", async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    try {
        // verify token and get user id
        const data = jwt.verify(token, process.env.TOKEN_SECRET_PASSWORDS);

        // hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // update password
        await updateUserPassword(data.id, hashedPassword);

        res.status(200).json({ message: "Successful" });
    } catch (e) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({ message: "error, token has expired" });
        } else {
            res.status(401).json({ message: "error, wrong token" });
        }
    }
});

module.exports = router;
