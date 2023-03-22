const fs=require('fs');
const path=require('path');

const {validationResult}=require('express-validator/check')


const io=require('socket.io')


const Post=require('../models/post');
const User=require('../models/user');
exports.getPosts=(req, res, next)=>{
  const currentPage=req.query.page||1;
  const perPage=2;
  let totalItems;
Post.find().countDocuments().populate('creator').sort({createdAt:-1}  )
.then(count=>{
  totalItems=count

  return  Post.find().skip((currentPage-1)*perPage).limit(perPage)
 

})
.then(posts =>{
  res.status(200).json({message:'Successfully ',posts:posts,totalItems:totalItems});
}).catch(err=>{  if(!err.statusCode)
  {
      err.statusCode =500;
  }
  next(err);})




}

exports.createPost=(req, res, next)=>{
    const errors=validationResult(req);
    //there is error!
    if( ! errors.isEmpty()){
        const error=new Error('Validation Failed ');
        console.log('error message'+error.message);
        error.statusCode=422;
        throw error 
      /*  console.log(errors.array())
        return res.status(422).json({message:'Validation Failed',
      errors:errors.array()
    })*/

    }
  
if(!req.file)
{
  const error = new Error('missing required -> image not founDed');
   error.statusCode=422;
   throw error
}
    // const imageUrl="req.file.path";
    const title=req.body.title;
    const content =req.body.content; 
     
    let creator;
    const post=new Post({
        title: title,
        content: content, 
        imageUrl:"imageUrl",
        creator:req.userId
          

    })     
 post
 .save()
 .then(resulte=>{
console.log(resulte);
return User.findById(req.userId)
 }).then(user=>{
  creator=user;
    user.posts.push(post)
    io.emit('posts',{post:{...post._doc,creator:{_id:req.userId,name:user.name}}})
  return user.save()
    

 })
 .then(result=>{ 
  
    res.status(201).json({
  message:'Post created successfully',
   post:post,
   creator:{_id:creator._id,name:creator.name }
})})
 .catch(err => {

    if(!err.statusCode)
    {
        err.statusCode =500;
    }
    next(err);
  });
    

    
}

exports.getPost=(req,res,next)=>{
  const postId=req.params.postId;
    Post.findById(postId).then(post=>{
if(!post)
{
  const error=new Error('Could not Find post')
  error.statusCode=404;
  throw error
 
}
res.status(200).json({message:'',post:post})

}).catch((err)=>{if(!err.statusCode){err.statusCode =500;}next(err);})
}



exports.UpdatePost=(req, res, next)=>{
 
  const errors=validationResult(req);
  
  if( ! errors.isEmpty()){
      const error=new Error('Validation Failed ');
      console.log('error message'+error.message);
      error.statusCode=422;
      throw error 
  }

  const postId=req.params.postId;

  let imageUrl=req.body.image;//  body هي في حالة عدم تحديث الصورة فالفرونت رح يرد الصورة ك 
  //console.log(imageUrl+"**************************************************")
    const title=req.body.title;
    const content =req.body.content;
    if(req.file)
    {
       imageUrl=req.file.path;
       console.log(imageUrl+"**************************************************")
    }
    if(!imageUrl)
    {
      const error = new Error('No Photo Picked');
      error.statusCode=422;
      throw error;
    }

Post.findById(postId)
.then(post=>{
  if(!post)
  {
    const error = new Error('un catched Feed');
    error.statusCode=404;
    throw error
  }

 if(post.creator.toString()!==req.userId)
 {
  console.log("post.creator.toString()"+post.creator.toString() +"\nreq.userId "+req.userId)
const error = new Error('Not Authorizations');
error.statusCode=403;
throw error
 }

  if(imageUrl!==post.imageUrl)
  {
    imageClear(post.imageUrl)
  }
  post.title=title;
  post.content=content;
  post.imageUrl=imageUrl;
  return post.save();
})
.then(resData=>{
  res.status(200).json({message: 'Post Updated successfully',post:resData})
})
.catch(err=>{
  if(!err.statusCode){err.statusCode =500;}next(err);
})
}




exports.deletePost=(req,res,next)=>{
  
  const postId=req.params.postId;
  Post.findById(postId).then(post=>{
    if(!post)
    {
      const error = new Error('un catched Feed');
      error.statusCode=404;
      throw error
    }
    //check looged in user 

    if(post.creator.toString()!==req.userId)
    {
     console.log("post.creator.toString()"+post.creator.toString() +"\nreq.userId "+req.userId)
   const error = new Error('Not Authorizations');
   error.statusCode=403;
   throw error
    }

   



    imageClear(post.imageUrl);
    return Post.findByIdAndRemove(postId)

  }

  )
  .then(resData=>{
    return User.findById(req.userId)
    
  })
  .then(result=>{
    result.posts.pull(postId)
    return result.save()
  })
  .then(done=>{
    console.log(done);
     res.status(200).json({message:'Deleted image'})
  })
  .catch(err=>{
    if(!err.statusCode){err.statusCode =500;}next(err);
  })

}


const imageClear =filePath=>{
  filePath=path.join(__dirname,'..',filePath);
  fs.unlink(filePath,err=>console.log(err))
}


exports.setAvatar=async(req,res,next)=>{
 res.send("SET Avatar")
  try{
  const userId=req.params.id;
  const avatarImage=req.body.image;
  const userData=await User.findByIdAndUpdate(userId,{
    isAvatarImageSet:true,
    avatarImage
  })
  res.status(201).json({isSet:userData,isAvatarImageSet,image:userData.avatarImage})
}
catch(err){
  console.log(err)

next(err)}
}


exports.allusers=async(req,res,next)=>{
try{
  const userId=req.params.id
  const allusers= await User.find({}).select([
    "email",
    "name",
    "_id",
    
  ]);
  res.send(allusers)

}catch(err){
  console.log(err)
  next(err)
}

}