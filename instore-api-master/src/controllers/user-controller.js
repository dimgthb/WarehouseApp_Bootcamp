const uuid = require('uuid')
const bcrypt = require('bcrypt')
const { totp } = require('otplib')
const jwt = require('jsonwebtoken')
const transporter = require('../helpers/transporter')
const database = require('../config').promise()
const { userSetNewPassword } = require('../helpers/validation-schema')

//REGISTER NEW USER
// module.exports.register = async (req, res) => {
//     const { username, email, password, repeat_password } = req.body
//     try {
//         // 1. validate -> match password with repeat password
//         if (password !== repeat_password) {
//             throw new createError(http_status.BAD_REQUEST, `password doesn't match.`)
//         }

//         // 2. validate value of req.body -> according to our schema
//         const { error } = registerSchema.validate(req.body)
//         if (error) {
//             throw new createError(http_status.BAD_REQUEST, error.details[0].message)
//         }

//         // 3. check if username and email is unique?
//         const CHECK_USER = `SELECT id FROM user WHERE username = ?;`
//         const [ USER ] = await database.execute(CHECK_USER, [username])
//         if (USER.length) {
//             throw new createError(http_status.BAD_REQUEST, 'Username already registered.')
//         }
//         const CHECK_CEMAIL = `SELECT id FROM user WHERE email = ?;`
//         const [ CEMAIL ] = await database.execute(CHECK_CEMAIL, [email])
//         if (CEMAIL.length) {
//             throw new createError(http_status.BAD_REQUEST, 'Email already registered.')
//         }

//         // 4. create UID
//         const uid = uuid.v4()
//         console.log('uid : ', uid)

//         // 5. HASH password
//         const salt = await bcrypt.genSalt(10)
//         const hashed_password = await bcrypt.hash(password, salt)
//         console.log('plain : ', password)
//         console.log('hashed :', hashed_password)

//         // 6. store data into our database
//         const INSERT_USER = `
//             INSERT INTO user (uid, username, email, password)
//             VALUES(${database.escape(uid)}, ${database.escape(username)}, ${database.escape(email)}, ${database.escape(hashed_password)});
//         `
//         const [ INFO ] = await database.execute(INSERT_USER)
//         // 6. store data into our database profile
//         const INSERT_PROFILE = `
//             INSERT INTO profile (uid)
//             VALUES(${database.escape(uid)});
//         `
//         const [ INFO_PROFILE ] = await database.execute(INSERT_PROFILE)

//         // 7. geneate TOKEN -> OTP
//         // totp.options = { epoch : 0, step : 300 }
//         const OTP = totp.generate(uid)
//         console.log('OTP : ', OTP)
        
//         // store otp to database
//         const INSERT_TOKEN = `INSERT INTO token (uid, token) VALUES (${database.escape(uid)}, ${database.escape(OTP)});`
//         const [ INFO_TOKEN ] = await database.execute(INSERT_TOKEN) 

//         // 8. send otp to client -> via email        
//         const TRANSPORTER_INFO = await transporter.sendMail({
//             from : 'Admin Dimasocial <bowotp@gmail.com>',
//             to : `${email}`,
//             subject : 'OTP Verification',
//             html: 
//             `
//                 <p>Your Verification Code is ${OTP}, do not share to others.</p>
//                 <a href='http://localhost:5000/api/auth/verify/${OTP}'>Click here to proceed verify</a>
//             `
//         })

//         // create respond
//         const respond = new createRespond(
//             http_status.CREATED, 'register', true, 1, 1, 
//             // { id: INFO.insertId, uid : uid, username : username, email : email }
//             // TRANSPORTER_INFO
//             'register success and please verify your account.'
//         )   
//         res.header('uid', uid).status(respond.status).send(respond)
//     } catch (error) {
//         const isTrusted = error instanceof createError
//         if (!isTrusted) {
//             error = new createError(http_status.INTERNAL_SERVER_ERROR, error.sqlMessage)
//         }
//         res.status(error.status).send(error)
//     }
// }

// // verify account
// module.exports.verifyAccount = async (req, res) => {
//     // const uid = req.header('uid')
//     const token = req.params.token
//     console.log(token)
//     try {        
//         const CHECK_TOKEN = `SELECT token, createdAt FROM token WHERE token = ?;`
//         const [ TOKEN ] = await database.execute(CHECK_TOKEN, [token])
//         if (!TOKEN.length) {
//             throw new createError(http_status.BAD_REQUEST, 'token invalid.')
//         }
//         const created = new Date(TOKEN[0].createdAt).getTime()
//         const now = new Date().getTime()
//         console.log('created : ', created)
//         console.log('now : ', now)

//         // validate token
//         const step = now - created // miliseconds
//         if (step >= 60000) { // 60 seconds
//             throw new createError(http_status.BAD_REQUEST, 'token expired.')
//         }
        
//         const CHECK_UID = `SELECT uid FROM token WHERE token = ?;`
//         const [cuid] = await database.execute(CHECK_UID, [token])
//         const arruid = cuid[0]
//         const uid = arruid.uid
//         console.log('uid :', uid);

//         // change status
//         const UPDATE_STATUS = `UPDATE user SET status = 1 WHERE uid = ?;`
//         const [ INFO ] = await database.execute(UPDATE_STATUS, [uid])

//         // delete token
//         const DELETE_TOKEN = `DELETE FROM token WHERE uid = ?;`
//         const [ INFO_DELETE ] = await database.execute(DELETE_TOKEN, [uid])

//         // create respond
//         const respond = new createRespond(http_status.OK, 'verify', true, 1, 1, INFO.info)
//         res.status(respond.status).redirect(301, 'http://localhost:3000/verified')

//     } catch (error) {
//         const isTrusted = error instanceof createError
//         if (!isTrusted) {
//             error = new createError(http_status.INTERNAL_SERVER_ERROR, error.sqlMessage)
//         }
//         res.status(error.status).send(error) 
//     }
// }

// module.exports.refreshToken = async (req, res) => {
//     const token = req.body.token
//     try {
//         // validate token 
//         const CHECK_TOKEN = `SELECT token, createdAt FROM token WHERE token = ?;`
//         const [ TOKEN ] = await database.execute(CHECK_TOKEN, [token])
//         if (!TOKEN.length) {
//             throw new createError(http_status.BAD_REQUEST, 'invalid token.')
//         }

//         // if token exist -> check if token still valid or not
//         const created = new Date(TOKEN[0].createdAt).getTime()
//         const now = new Date().getTime()
//         const step = now - created
//         const remaining_time = Math.floor((60000 - step) / 1000)
//         // if token still valid and not yet expired
//         if (step <= 60000) {
//             throw new createError(http_status.BAD_REQUEST, `please wait for ${remaining_time}s to refresh your token.`)
//         }

//         const CHECK_UID = `SELECT uid FROM token WHERE token = ?;`
//         const [cuid] = await database.execute(CHECK_UID, [token])
//         const arruid = cuid[0]
//         const UID = arruid.uid
//         console.log('uid :', UID);

//         // get email
//         const GET_EMAIL = `SELECT email FROM user WHERE uid = ?;`
//         const [ EMAIL ] = await database.execute(GET_EMAIL, [UID])
//         const arrmail = EMAIL[0]
//         const mail = arrmail.email
//         console.log(mail);

//         // if token has been expired -> update token
//         const OTP = totp.generate(UID)
//         const UPDATE_TOKEN = `UPDATE token SET token = ?, createdAt = ? WHERE uid = ?;`
//         const [ INFO ] = await database.execute(UPDATE_TOKEN, [OTP, new Date(), UID])

//         // send token to client email
//         const TRANSPORTER_INFO = await transporter.sendMail({
//             from : 'Admin Dimasocial <bowotp@gmail.com>',
//             to : `${mail}`,
//             subject : 'OTP Verification',
//             html: 
//             `
//                 <p>Your Verification Code is ${OTP}, do not share to others.</p>
//                 <a href='http://localhost:5000/api/auth/verify/${OTP}'>Click here to proceed verify</a>
//             `
//         })

//         // create respond
//         const respond = new createRespond(http_status.OK, 'refresh token', true, 1, 1, INFO.info)
//         res.status(respond.status).send(respond)
//     } catch (error) {
//         const isTrusted = error instanceof createError
//         if (!isTrusted) {
//             error = new createError(http_status.INTERNAL_SERVER_ERROR, error.sqlMessage)
//         }
//         res.status(error.status).send(error) 
//     }
// }


// LOGIN
module.exports.login = async (req, res) => {
    const { usernameOrEmail, password } = req.body
    try {
        if (!usernameOrEmail.length) {
            return res.status(404).send('Username or Email canot be empty')
        }
        if (!password.length) {
            return res.status(404).send('Password canot be empty')
        }
        
        // 2. validate username or email in our database
        const CHECK_USER = `SELECT * FROM user WHERE username=? OR email=?;`
        const [ USER ] = await database.execute(CHECK_USER, [usernameOrEmail, usernameOrEmail])
        if (!USER.length) {
            return res.status(404).send('User or Email has not been registered.')
        }
        
        // 3. if user already resgitered => validate password - OPEN WHEN PASS ALREADY HASH
        const isValid = await bcrypt.compare(password, USER[0].password)
        if(!isValid) {
            return res.status(404).send("Invalid Password!")
        }

        // 4. if password valid, -> create token using JWT
        const token = jwt.sign({ userId : USER[0].user_id }, process.env.JWT_PASS)
        console.log('login token:', token)

        // 5. create respond and sent token to client
        delete USER[0].password
        USER[0].token = token
        logindata = USER[0]
        
        res.header('Auth-Token', `Bearer ${token}`).status(200).send(logindata)
    } catch (error) {
        console.log("error :", error);
        return res.status(500).send("Internal service Error")
    }
}

// KEEPLOGIN -> FRONTEND WANT TO RETRIEVE USER'S DATA AFTER PAGE REFRSHED
module.exports.keepLogin = async (req, res) => {
    const token = req.header('Auth-Token')
    try {
        // check token
        if (!token) {
            return res.status(401).send("Token is required")
        }

        // if token exist -> validate token
        const { userId } = jwt.verify(token, process.env.JWT_PASS)
        if (!userId) {
            return res.status(401).send("Invalid Token")
        }

        // if token valid => retrieve user's data
        const GET_USER = `SELECT * FROM user WHERE user_id = ?;`
        const [ USER ] = await database.execute(GET_USER, [userId])

        // create respond
        delete USER[0].password
        
        res.status(200).send(USER[0]).redirect(301, 'http://localhost:3000/')
    } catch (error) {
        console.log("error :", error);
        return res.status(500).send(error.message);
    }
}

//reset password, 1. check email and password, pass and newpass, to sent token
module.exports.userCheckEmailResPass = async (req, res) => {
    const {email} = req.body;
    try {
        if (email === "") {
            return res.status(404).send("Email cannot be empty")
        }

        //2. Check if Email is registered
        const CHECK_EMAIL = `select * from user where email = ?`;
        const [EMAIL] = await database.execute(CHECK_EMAIL, [email]);
        if (!EMAIL.length) {
            return res.status(404).send("Email is not registered");
        }
        //3. generate token
        const token = jwt.sign(
            { userId: EMAIL[0].user_id },
            process.env.JWT_PASS,
            {
            expiresIn: "180s",
            }
        );
        console.log(token);

        //4. Send Email
        await transporter.sendMail({
            from: "'Instore' <bowotp@gmail.com>",
            to: EMAIL[0].email,
            subject: "Reset Password Confirmation",
            html: `
                <h1 style="text-align: center;">Reset Your Password</h1>
                <p>We have received your request to reset the password for your account</p>
                <a href='http://localhost:3000/user/reset-pass/${token}'>Click here to set new password</a>
                `,
            });
        res.status(200).send("Email has been sent to reset your password");
    } catch (error) {
        console.log("error :", error);
        return res.status(500).send("Internal service Error");
    }
};

// USER FORGET PASSWORD
///// VERIFY RESET PASSWORD LINK

module.exports.userVerifyResetPassword = async (req, res) => {
    const token = req.params.token;

    try {
        try {
        const { userId } = jwt.verify(token, process.env.JWT_PASS);
            return res.json({ status: 200, userId: userId });
        } catch (error) {
        return res.status(400).send(error.message);
    }
    } catch (error) {
        return res.status(500).send("Internal service Error");
    }
};

// USER FORGET PASSWORD
///// SET NEW PASSWORD

module.exports.userSetNewPassword = async (req, res) => {
    const { password, userId, confirm_password } = req.body;
    try {
        // 1. verify password & confirm password
        if (password === "" || confirm_password === "" ) {
            return res.status(400).send("Please fill all the empty box")
        }
        if (password !== confirm_password) {
            return res
            .status(400)
            .send("Password and confirm password doesn't match");
        }

        // 2. Validate New Password
        const { error } = userSetNewPassword.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // 3. Verify userId
        const CHECK_USER = `select * from user WHERE user_id = ?`;
        const [USER] = await database.execute(CHECK_USER, [userId]);
        if (!USER.length) {
            return res.status(404).send("Account is not found");
        }

        // 4. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Update Password
        const UPDATE_PASSWORD = `UPDATE user SET password = ? WHERE user_id = ?`;
        await database.execute(UPDATE_PASSWORD, [hashedPassword, userId]);

        res.status(200).send("Password Has Been Changed");
    } catch (error) {
        return res.status(500).send("Internal service Error");
    }
};
