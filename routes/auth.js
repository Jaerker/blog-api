const router = require('express').Router();
const User = require('../model/User');
const bodyParser = require('body-parser');
const  { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res)=>{



    //Validating data
    const {error} = registerValidation(req.body)
    if(error){ return res.status(400).send(error.message)}

    //Checking if user is already registered
    const emailExists = await(User.findOne({email:req.body.email}));
    if(emailExists) return res.status(400).send('Email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(11);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new User({
        fName: req.body.fName,
        lName: req.body.lName,
        email: req.body.email,
        password: hashPassword
    });

    try{
        const savedUser = await user.save();
        res.send(user);
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res)=>{
    

    //Validating data
    const {error} = loginValidation(req.body)
    if(error){ return res.status(400).send(error.message)}

    //Checking if user is already registered
    const user = await(User.findOne({email:req.body.email}));
    if(!user) return res.status(400).send('Email not found.');

    //Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('password is wrong.');

    //Create and assign token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);


});

module.exports = router;