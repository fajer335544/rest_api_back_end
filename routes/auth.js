const express=require('express');

const {body}=require('express-validator/check')
const Router=express.Router();

const User=require('../models/user')

const authController=require('../controllers/auth');


Router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid Email ').
    custom((value,{req})=>{
        return User.findOne({email: value})
        .then(userDoc=>{
            if(userDoc)
            {
                return Promise.reject('E-Mail exists already, please pick a different one.')
            }
        })
    })
    .normalizeEmail()
    ,
    body('password').trim().isLength({min:8}),
    body('name').trim().isLength({min:5}).not().isEmpty()

],authController.signUp)


//24/10/2022 for chat 
Router.post('/register',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid Email ').
    custom((value,{req})=>{
        return User.findOne({email: value})
        .then(userDoc=>{
            if(userDoc)
            {
                return Promise.reject('E-Mail exists already, please pick a different one.')
            }
        })
    })
    .normalizeEmail()
     ,
    body('password').trim().isLength({min:8}),
    body('name').trim().isLength({min:5}).not().isEmpty()

],authController.signUp)


Router.post('/login',authController.login);





//logout ,alluserees ,addmsg, getmesg,setavatar
module.exports=Router;