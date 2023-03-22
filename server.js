if(process.env.NODE_ENV !== 'production') {
require('dotenv').config()
}

const express= require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const multer=require('multer');
const path=require('path');
const  cors=require('cors');

const feedRouter=require('./routes/feed');
const authRouter=require('./routes/auth');

const app=express();



const fileStorage=multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, 'images/')
  },
  
  filename:(req,file,cb)=>{

    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))

  },
  
});
const fileFilter=(req, file, cb)=>{
  if(file.mimetype === 'image/png'||
  file.mimetype==='image/jpeg'||
  file.mimetype==='image/jpg') 
  {
    cb(null,true) 
  } 
  else{
  cb(null,false);
  }
}

app.use(bodyParser.json())

app.use(cors());


app.use(
  multer({storage:fileStorage,fileFilter:fileFilter}).single('image')
);

app.use('/images',express.static(path.join(__dirname, 'images'))
);

app.use((req, res, next) => {
res.setHeader('Access-Control-Allow-Origin', '*');

res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS,DELETE,PATCH');
res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorizations');
next();



})



app.use('/feed',feedRouter);
const isAuth=require('./middelware/is-auth');
app.use('/hello',isAuth)
app.use('/auth',authRouter);

app.use('*',(req,res,next)=>{
  res.status(404).json({message:"this route is not founded"})
})

app.use((error,req, res, next)=>{
const status=error.statusCode || 500;
const message = error.message;
const data=error.data

console.log('///////////////////////////status'+status +'///////////message'+message)

res.status(status).json({message: message,data:data});
})





const url='';

try{
      mongoose.connect(process.env.MONGO_URL)
     //mongoose.connect(url);
     const server=   app.listen(process.env.PORT)
    
  const io=require('socket.io')(server,
{
    cors: {
      origin: "http://localhost:3000"
    }}
  );
    io.on('connection',(socket)=>{
      console.log("Connect client Successfully")
    })
  }
      catch(err){console.log(err)}
     





