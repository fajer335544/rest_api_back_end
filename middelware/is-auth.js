const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{

    const token=req.get('Authorizations').split(' ')[1];
    let decodedtoken;
    try{
        decodedtoken=jwt.verify(token,'somesupersecretsecret');

    }
    catch(err){
        err.statusCode=500;
        throw err
    }
    if(!decodedtoken)
    {
        const error =new Error('Not authenticated .')
        err.statusCode=401;
        throw err
    }
    req.userId=decodedtoken.userId;
    console.log("req.userId in is-auth :"+req.userId);
    next(); 
}