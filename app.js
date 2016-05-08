var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var app = express();


// connect database
mongoose.connect('mongodb://localhost/restful_blog_app');

// set ejs as view engine
app.set('view engine', 'ejs');

// enable use of express
app.use(express.static('public'));

// enable use of body-parser
app.use(bodyParser.urlencoded({extended: true}));

// enable use of method-override
app.use(methodOverride('_method'));

// enable use of express-sanitizer - must go after body-parser!
app.use(expressSanitizer());

// create mongoose Schema
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

// create mongoose Model
var Blog = mongoose.model('Blog', blogSchema);

// RESTful routes

// Home(Root) Route
app.get('/', function(req, res) {
   res.redirect('/blogs'); 
});

// BLOGS route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: []}); 
        }
    })
});

// NEW route
app.get('/blogs/new', function(req, res) {
   res.render('new'); 
});

// CREATE route
app.post('/blogs', function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    var formData = req.body.blog;
    Blog.create(formData, function(err, newBlog) {
       if(err) {
           res.render('new');
       } else {
           res.redirect('/blogs');
       }
   }); 
});

// SHOW route
app.get('/blogs/:id', function(req, res) {
   Blog.findById(req.params.id, function(err, blog) {
       if(err) {
           res.redirect('/');
       } else {
           res.render('show', {blog: blog});
       }
   });
});

// EDIT route
app.get('/blogs/:id/edit', function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
        if(err) {
            res.redirect('/');
        } else {
            res.render('edit', {blog: blog});
        }
    });
});

// UPDATE route
app.put('/blogs/:id', function(req, res) {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog) {
        if(err) {
            console.log(err);
        } else {
           var showUrl = '/blogs/' + blog._id;
           res.redirect(showUrl);
        }
    });
});

// DELETE route
app.delete('/blogs/:id', function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
        if(err) {
            console.log(err);
        } else {
            blog.remove();
            res.redirect('/blogs');
        }
    });
});

// connect express listen
app.listen(process.env.PORT, process.env.IP, function () {
    console.log('Server is running!!');
});