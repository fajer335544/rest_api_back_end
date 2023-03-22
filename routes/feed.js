const express =require('express');


const feedController=require('../controllers/feed') 
const isAuth=require('../middelware/is-auth');
const {body}=require('express-validator/check')


const Router=express.Router();


// GET /feed/posts
Router.get('/posts',isAuth, feedController.getPosts);

// POST /feed/post
Router.post('/post',isAuth,[
    body('title').trim().isLength({min:7}),
    body('content').trim().isLength({min:5})
], feedController.createPost);

Router.get('/post/:postId',isAuth,feedController.getPost);
Router.put('/post/:postId',isAuth,
[
    body('title').trim().isLength({min:7}),
    body('content').trim().isLength({min:5})
],feedController.UpdatePost);


Router.delete('/post/:postId',isAuth,feedController.deletePost);




////////new for chat
 
Router.post('/setavatar/:id',feedController.setAvatar);

Router.get('/allusers',feedController.allusers);

module.exports=Router;