const express = require("express");
const app = express();
const PORT = 3000;
const session = require("express-session");
const fs = require("fs");

// set template engine
app.set("view engine", "ejs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

// json is used to parse data coming from ajax requests
app.use(express.json());
// urlencoded is used to parse data coming from html forms
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    if(!req.session.isLoggedin) {
        res.redirect("/login",);
        return;
    }
    fs.readFile(__dirname + "/data/data.json", (err, data) => {
        if(err) {
            console.log(err);
            res.render("dashboard", { username: req.session.username, data:null });
            return;
        }
        const dataObj = JSON.parse(data);
        res.render("dashboard", { username: req.session.username, data: dataObj });
    });
});

app.get("/home", (req, res) => {
    if(!req.session.isLoggedin) {
        res.redirect("/login");
        return;
    }
    res.redirect("/");
});

app.get("/about", (req, res) => {
    if(!req.session.isLoggedin) {
        res.redirect("/login");
        return;
    }
    res.render("about", { username: req.session.username });
});

app.get("/contact", (req, res) => {
    if(!req.session.isLoggedin) {
        res.redirect("/login");
        return;
    }
    res.render("contact", { username: req.session.username });
});

app.get("/login", (req, res) => {
    res.render("login", {error: null});
});

app.get("/signup", (req, res) => {
    res.render("signup", {error: null});
});

app.post("/signup", (req, res) => {
    const { username, email, mobile, password } = req.body;
    // console.log(username, email, mobile, password);
    
    // check if user exists
    // if exists, send error
    // else, create user
    fs.readFile(__dirname + "/data/userBase.json", (err, data) => {
        if(err) {
            console.log(err);
            res.render("signup", {error: "Something went wrong"});
            return;
        }
        const userBase = JSON.parse(data);
        if(userBase[username]) {
            res.render("signup", {error: "User already exists"});
            return;
        }
        userBase[username] = { username, email, mobile, password };
        fs.writeFile(__dirname + "/data/userBase.json", JSON.stringify(userBase), (err) => {
            if(err) {
                console.log(err);
                res.render("signup", {error: "Something went wrong"});
                return;
            }
            res.redirect("/login");
        });
    });

});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    // console.log(username, password);

    // check if user exists
    // if exists, check password
    // if password is correct, redirect to dashboard
    // else, send error
    fs.readFile(__dirname + "/data/userBase.json", (err, data) => {
        if(err) {
            console.log(err);
            res.render("login", {error: "Something went wrong"});
            return;
        }
        const userBase = JSON.parse(data);
        if(!userBase[username]) {
            res.render("login", {error: "User does not exist"});
            return;
        }
        if(userBase[username].password === password) {
            req.session.isLoggedin = true;
            req.session.username = username;
            res.redirect("/");
            return;
        }
        res.render("login", {error: "Incorrect password"});
    });
});

app.get("/logout", (req, res) => {
    // console.log("session destroyed");
    req.session.destroy();
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});