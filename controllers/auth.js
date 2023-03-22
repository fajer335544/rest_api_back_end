const User=require('../models/user');
const {validationResult}=require('express-validator/check')

const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs');
exports.signUp=(req,res,next)=>{
    console.log(req.body);
    
    const errors=validationResult(req);
    //there is error!
    if( ! errors.isEmpty()){
        const error=new Error('Validation Failed ');
        console.log ('error message'+error.message);
        error.statusCode=422;
        error.data=errors.array()
        throw error 
    }
    const email =req.body.email;
    const name=req.body.name;
    const password=req.body.password;
    
    bcrypt.hash(password,12)
    .then(hashedPassword=>{
        const user=new User(
            {
                email:email,
                password:hashedPassword,
                name:name
            }
        )
        return user.save()

    })
    .then(user=>{

        res.status(201).json({message:'Welcome! You have successfully Signup',all_data_stored:user}
        )
    })
    .catch((err)=>{if(!err.statusCode){err.statusCode =500;}next(err);}

    )

}


exports.login=(req,res,next)=>{
    console.log(req.body);
const email=req.body.email;
const password=req.body.password;
let loadUser;
User.findOne({email:email})
.then(user=>{
    if(!user)
    {
        const error =new Error('Invalid E-mail Address');
        error.statusCode=401;
        throw error
    }
    loadUser=user;
    return  bcrypt.compare(password,user.password)

    

})
.then(resultOfBcrypt=>{
   if(!resultOfBcrypt)
   {
    const error =new Error('Wrong Passwodrd');
        error.statusCode=401;
        throw error
    }
    const token=jwt.sign({email:loadUser.email,userId:loadUser._id.toString()},'somesupersecretsecret',  {expiresIn:'1h'})

              console.log("this is token for this user \n:"+token +"\n loadUser._id.toString():\n"+ loadUser._id.toString())

         res.status(200).json({token:token,userId:loadUser._id.toString(),status:true})
})
.catch((err)=>{if(!err.statusCode){err.statusCode =500;}next(err)})



}