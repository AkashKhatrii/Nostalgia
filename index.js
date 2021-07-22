const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const alert = require('alert')
const path = require('path');

const app = express();


// IMPORTING MODELS
// const Blog = require('./models/blog.js');
const Memory = require('./models/memory.js');
const User = require('./models/user.js')
const Like = require("./models/Like.js")



const blogSchema = mongoose.Schema({
    title: String,
    intro: String,
    body1: String,
    body2: String,
    body3: String,
    conclusion: String
}, {timestamps: true});

const Blog = mongoose.model("Blog", blogSchema);

// IMPORTING ROUTES

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
// app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));

app.use( function( req, res, next ) {

    if ( req.query._method == 'PUT' ) {
        req.method = 'PUT';
        req.url = req.path;
    }       
    next(); 
});


// CONNECTING TO DATABASE
mongoose.connect("mongodb://localhost:27017/NostalgiaDB", {useNewUrlParser: true})




var loggedIn = false
var loggedInUser = ""
var msg = ''
var posts = []
let likedpost = ''


var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req,file,cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname) )
    }
})

var upload = multer({
    storage: storage
}).single('memoryImage');


// ROUTES
app.post("/userBlog", function(req, res){

    console.log("Req body: " + req.body)
    console.log("Req Title: "+ req.body.blogTitle)
    const newBlog = new Blog({
        title: req.body.blogTitle,
        intro: req.body.blogIntro,
        body1: req.body.blogBody1,
        body2: req.body.blogBody2,
        body3: req.body.blogBody3,
        conclusion: req.body.blogConclusion,
        
    })

    console.log("New blog" + newBlog)
 
    newBlog.save(function(err){
     if (!err){
         res.redirect("blogs");
         
     }
   });
 
 
 });

app.post("/register", (req, res) => {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirm
    })

    newUser.save((err) => {
        if(!err){
            res.redirect("/register")
           
        }
    })

    
})

app.post("/login", (req, res) => {
    var userName = req.body.username;
    var password = req.body.userpassword;
   
    User.findOne({ email: userName})
    .then((result) => {
        if(password == result.password){
            res.redirect("/")
            loggedIn = true
            loggedInUser = result.email
            
        }
        else{

            msg = "Incorrect Password."
            res.redirect("/login")
            
        }
    })
    .catch((err) => {

        msg = "Sorry, Couldn't find your account. Please register and log in."
            res.redirect("/login")
        
    })
})

app.get("/register", (req, res) =>{
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login", { message: msg })
})

app.get("/loginProceed", (req, res) => {
    if(!loggedIn){
        
    res.render("loginProceed")
    }
})



app.get("/", function(req, res){

    res.render("home", {user: loggedInUser});
  

})



app.get("/memories", function(req, res){

    if(!loggedIn){
        
        
        res.redirect("/loginProceed")
      
    }
    else{
        
    Memory.find().sort({ createdAt: -1 })
    .then((result) => {
        res.render("memoriesP", {

            displayMemories: result,
            user: loggedInUser
            });
    
        }) 
    .catch((err) => {
        console.log(err);
    })   
}
    
});


app.get("/userMemory", function(req, res){
    if(!loggedIn){
        
        res.redirect("/loginProceed")
      
    }
    else{
    res.render("memoryForm", {user: loggedInUser});
    }
});


app.post("/userMemory", upload, function(req, res){

    console.log("Req body: " + req.body)
   const newMemory = new Memory({
       title: req.body.memoryTitle,
       date: req.body.memoryDate,
       body: req.body.memoryBody,
       author: req.body.memoryAuthor,
       image: req.file.filename
   })

   
   newMemory.save(function(err){
    if (!err){
        res.redirect("/memories");

    }
  });


})




app.get("/userBlog", function(req,res){
    if(!loggedIn){
        
        res.redirect("/loginProceed")
      
    }
    else{
    res.render("blogForm")
    }
});

app.get("/blogs", function(req, res){

    if(!loggedIn){
        
        res.redirect("/loginProceed")
      
    }
    else{
    Blog.find().sort({ createdAt: -1})
    .then((result) => {
        res.render("blogs", {
            displayBlogs: result
            });
        })
    .catch((err) => {
        console.log(err);
    });
}});

app.get("/blogs/:blogId", function(req, res){
    const requestedBlogId = req.params.blogId;
    Blog.findOne({_id: requestedBlogId}, function(err, blog){
        res.render("blog", {
            title: blog.title,
            intro: blog.intro,
            body1: blog.body1,
            body2: blog.body2,
            body3: blog.body3,
            conclusion: blog.conclusion,
        });
      });
});




app.put( '/memories/:memoryId', function ( req, res ) {
    // delete operation stuff
    const likememory = req.params.memoryId
    
    Memory.findOne({_id: likememory})
    .then((result) => {
        likedpost = result
    })
    .catch((err) => {
        console.log(err)
    })

   


    User.findOneAndUpdate({email: loggedInUser},
        {$addToSet: {likedmemories: likedpost}},
        {safe: true, upsert: true},
        function(err, doc) {
            if(err){
            console.log(err);
            }else{
            console.log("Updated")
            }
        }
    );
    
    likedpost = ''
    
    res.redirect("/memories")
  });


app.get('/memories/:memoryviewId', (req, res) => {
    const requestedmemoryId = req.params.memoryviewId;
    Memory.findOne({_id: requestedmemoryId}, function(err, memory){
        res.render("memory", {
            title: memory.title,
            date: memory.date,
            body: memory.body,
            author: memory.author,
            likes: memory.likes,
            image: memory.image
        });
      });
})

app.get("/user/savedmemories", (req, res) => {

    // var userS = req.params.userEmail
    
    User.findOne({email: loggedInUser})
    .then((result) => {
        res.render("savedMemories", {saved: result.likedmemories});
            })
            .catch((err) => {
                console.log(err)
            })
})
        



app.listen(3000, function(){
    
})
