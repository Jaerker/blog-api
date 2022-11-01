//Validation
const Joi = require('@hapi/joi');

//Register validation
const registerValidation = data =>{
    const schema = Joi.object({
        fName: Joi.string().required(),
        lName: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);
}

const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    });

    return schema.validate(data);

}

module.exports.registerValidation = registerValidation;

module.exports.loginValidation = loginValidation;