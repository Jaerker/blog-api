const router = require('express').Router();
const sendEmail = require('../utils/email')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { registerValidation, loginValidation } = require('../validation');

const User = require('../model/User');
const Token = require('../model/TokenSchema');



router.post('/verify', async (req, res) => {
    try {

        const { error } = registerValidation(req.body)
        if (error) return res.status(400).send(error.message);

        let user = await User.findOne({ email: req.body.email });
        let token;
        if (!user) {
            const salt = await bcrypt.genSalt(11);
            const hashPassword = await bcrypt.hash(req.body.password, salt);

            user = await new User({
                fName: req.body.fName,
                lName: req.body.lName,
                email: req.body.email,
                password: hashPassword
            }).save();

        }
        else {
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if (!validPass) return res.status(400).send('We are waiting for user to verify their account, the mail has been sent!');
        }

        if (user.verified === true) return res.status(400).send('Email is already registered on this site.');



        await Token.findOneAndRemove({ userId: user._id });

        token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex')
        }).save();






        const message = `<h2>Please verify account with this link:</h2> 
        
        <p>${process.env.VALIDATE_URL}/verify/${user._id}/${token.token} </p>
        
        <strong>If you were not expecting this mail, do not press the link! </strong>

        <p>Have a nice day. //Johan

        ps. Please do not reply to this mail.<p>
        `;
        const mailSent = await sendEmail(user.email, 'Verify Email!', message);

        if (!mailSent) return res.status(400).send("An error has occured, mail not sent");

        res.status(200).send("Email verification is sent succesfully, go and verify!");


    } catch (e) {
        res.status(400).send(`Error: ${e}`);
    }
});


router.get('/verify/:id/:token', async (req, res) => {

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Sorry, invalid link.');

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        });
        if (!token) return res.status(400).send('Sorry, invalid link.');

        await User.updateOne({ _id: user._id, verified: true });
        await Token.findByIdAndRemove(token._id);

        res.status(200).send('You did it, everything went fine!');


    } catch (e) {
        res.status(400).send('Error occured');
    }
});



router.post('/login', async (req, res) => {



    //Validating data
    const { error } = loginValidation(req.body)
    if (error) { return res.status(400).send(error.message) }

    //Checking if user is already registered
    const user = await (User.findOne({ email: req.body.email }));
    if (!user) return res.status(400).send('Email not found.');

    if (!user.verified) return res.status(400).send('Account is not verified, please request new validation mail.');

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('password is wrong.');



    //Create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);


    res.header('auth-token', token).send({ token, 'fName': user.fName });


});

module.exports = router;