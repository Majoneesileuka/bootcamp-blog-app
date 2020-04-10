var express = require("express"),
  methodOverride = require("method-override"),
  app = express(),
  bodyParser = require("body-parser"),
  expressSanitizer = require("express-sanitizer"),
  mongoose = require("mongoose");

// Connect mongodb and use bodyparser and set ejs as view enginer
// NOTE: Remember to run mongod at ~/data before launching this (node app.js)
// App config
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose/model config
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now },
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTful routes
app.get("/", function (req, res) {
  res.redirect("/blogs");
});

// Index router
app.get("/blogs", function (req, res) {
  Blog.find({}, function (err, blogs) {
    if (err) {
      console.log("Error!");
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

// New route
app.get("/blogs/new", function (req, res) {
  Blog.find({}, function (err, blogs) {
    res.render("new");
  });
});

// Create route
app.post("/blogs", function (req, res) {
  // create blog
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitizes scripts for example
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      // then redirect to index
      res.redirect("/blogs");
    }
  });
});

// Show route
app.get("/blogs/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// Edit route
app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// Update route
app.put("/blogs/:id", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body); // sanitizes scripts for example
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// Destroy route
app.delete("/blogs/:id", function (req, res) {
  // Destroy blog
  Blog.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

// Start server
app.listen(process.env.PORT || 3000, process.env.IP, function () {
  console.log("The Blog Server Has Started");
});
