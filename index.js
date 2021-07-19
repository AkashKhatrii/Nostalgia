const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const alert = require('alert')
const path = require('path');

const app = express();


// IMPORTING MODELS
const Blog = require('./models/blog.js');
const Memory = require('./models/memory.js');
const User = require('./models/user.js')

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


// CONNECTING TO DATABASE
mongoose.connect("mongodb://localhost:27017/NostalgiaDB", {useNewUrlParser: true})




var loggedIn = false
var loggedInUser = ""


var storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req,file,cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname) )
    }
})

var upload = multer({
    storage: storage
}).single('memoryImage');



app.get("/", function(req, res){

        res.render("home");
      
    
})

app.get("/memories", function(req, res){

    Memory.find().sort({ createdAt: -1 })
    .then((result) => {
        res.render("memoriesP", {

            displayMemories: result
            });
    
        }) 
    .catch((err) => {
        console.log(err);
    })   
    // Memory.find({}, function(err, foundMemories){
    //     res.render("memoriesP", {
    //       displayMemories: foundMemories
    //       });
    //   });
    
});


app.get("/userBlog", function(req,res){
    res.render("blogForm")
})

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
}


    // })
    // Blog.find({}, function(err, foundBlogs){
    //     res.render("blogs", {
    //       displayBlogs: foundBlogs
    //       });
    //   });
    
});


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
})

app.get("/userMemory", function(req, res){
    res.render("memoryForm");
});


app.post("/userMemory", upload, function(req, res){
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
        console.log("Data saved to database")
    }
  });


})


app.post("/userBlog", upload, function(req, res){
    const newBlog = new Blog({
        title: req.body.blogTitle,
        intro: req.body.blogIntro,
        body1: req.body.blogBody1,
        body2: req.body.blogBody2,
        body3: req.body.blogBody3,
        conclusion: req.body.blogConclusion,
        
    })
 
    newBlog.save(function(err){
     if (!err){
         res.redirect("/blogs");
         console.log("Data saved to database")
     }
   });
 
 
 })


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
            console.log("Added")
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
            console.log(loggedInUser)
        console.log(result)
        }
        else{
            res.redirect("/login")
            console.log("Bhaag")
        }
    })
    .catch((err) => {
        console.log("No user");
    })
})

app.get("/register", (req, res) =>{
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/loginProceed", (req, res) => {
    res.render("loginProceed")
})

app.listen(3000, function(){
    
})
