const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");
const postModel = require("./models/post");
const nodemailer = require("nodemailer");
const { title } = require("process");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const { profile } = require("console");
const multer = require("multer");
const fs = require("fs");
const { createCanvas } = require("canvas");


const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 10 requests per minute
  handler: (req, res) => {
    res
      .status(429)
      .render("error", { msg: "Too many requests, please try again later." });
  },
});


const path = require("path");

const app = express();

app.use(limiter);
const port = 3000;

const jwtSecret = "secret";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


// Set up multer storage (memory storage for buffers)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.set("view engine", "ejs");

// Configure Nodemailer



function authenticateUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.email = "Guest";
    return next();
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      req.email = "Guest";
      return next();
    }

    req.email = decoded.email;
    return next();
  });
}

function isloggedIn(req, res, next) {
  if (req.cookies.token) {
    return res.redirect("/");
  }
  next();
}
// Home
app.get("/", authenticateUser, async(req, res) => {
  const data = await postModel.find();
  res.render("index", { msg: "", email: req.email, data: data });
});

// Login
app.get("/login", isloggedIn, (req, res) => {
  res.render("login", { msg: "" });
});

// Signup
app.get("/register", isloggedIn, (req, res) => {
  res.render("register", { msg: "" });
});


// login
app.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(req.body);
    email = email.toLowerCase();

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).render("login", { msg: "Invalid email or password" });
    }else{
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        const token = jwt.sign({ email: email}, jwtSecret, {
          expiresIn: "1h",
        });
        res.cookie("token", token, { httpOnly: true });
        return res.redirect("/");
      } else {
        return res.status(401).render("login", { msg: "Invalid email or password" });
        }
    }


  } catch (err) {
    console.log(err);
    return res.status(500).render("login", { msg: "Internal Server Error" });
  }
});

// signup
app.post('/register', async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(req.body);
    email = email.toLowerCase();

    const user = await userModel.findOne({ email: email });

    if (user) {
      return res.status(401).render("register", { msg: "User already exists" });
    }else{
      // password save in coding
      password = await bcrypt.hash(password, 10);
      const newUser = new userModel({ email: email, password: password });
      await newUser.save();
      return res.render("register", { msg: "User registered successfully" });
    }



  } catch (err) {
    console.log(err);
    return res.status(500).render("register", { msg: "Internal Server Error" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});




// detail
app.get("/detail/:id", async (req, res) => {
  try {
    const data = await postModel.findById(req.params.id);
    res.render("detail", { msg: "", email: req.email, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  
});


app.get("/panel", authenticateUser, async(req, res) => {
  res.render("panel", { msg: "", email: req.email });
});

app.get("/products", async (req, res) => {
    try {
        const products = await postModel.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/post", upload.single("userProfile"), async (req, res) => {
  try {
      const { title, desc, price } = req.body;

      if (!req.file) {
          return res.status(400).json({ error: "Image file is required" });
      }

      const post = new postModel({
          title,
          desc,
          price,
          userProfile: {
              data: req.file.buffer,
              contentType: req.file.mimetype,
          },
      });

      await post.save();
      res.redirect("/");
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const { title, desc, price } = req.body;
    await postModel.findByIdAndUpdate(req.params.id, { title, desc, price });
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await postModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  



app.use((req, res, next) => {
  res.status(404).render("error", { msg: "Page Not Found" });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render("error", {
    msg: err.message || "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
