const router = require('express').Router();
const sendEmail = require('../utils/email')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { registerValidation, loginValidation } = require('../validation');

const User = require('../model/User');
const Token = require('../model/TokenSchema');


router.post('/login', async (req, res) => {



    //Validating data
    const { error } = loginValidation(req.body)
    if (error) { return res.status(400).send(error.message) }

    //Checking if user is already registered
    let user = await (User.findOne({ email: req.body.email.toLowerCase() }));
    if (!user) return res.status(400).send('Email not found.');

    if (!user.verified) return res.status(400).send('Account is not verified, please request new validation mail.');

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('password is wrong.');

    user = await User.findOne({email: req.body.email.toLowerCase()}, {__v:0, password:0})

    //Create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

    res.header('auth-token', token).send({ token, user });


});

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
                email: req.body.email.toLowerCase(),
                password: hashPassword,
                username: req.body.username
            }).save();

        }
        else {
            if (user.verified === true) return res.status(400).send('Email is already registered on this site.');
            
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if (!validPass) return res.status(400).send('We are waiting for user to verify their account, the mail has been sent!');
        }

        
        


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
        let user = await User.findById(req.params.id);
        if (!user) return res.status(400).send('Sorry, invalid link.');

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        });
        if (!token) return res.status(400).send('Sorry, invalid link.');

        await User.updateOne({ _id: user._id}, {verified: true });
        await Token.findByIdAndRemove(token._id);

        res.status(200).send('You did it, everything went fine!');


    } catch (e) {
        res.status(400).send(`Error occured: ${e}`);
    }
});


router.get('/test', async (req, res) => {

    const post = await Post.findById('635bbfb067d19ff6a1b609e6');

        if (posts) return res.status(200).send(post);
        else return res.status(400).send("No posts found.");
    
    res.status(200).send('Test verified')
});




module.exports = router;