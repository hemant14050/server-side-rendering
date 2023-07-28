const express = require("express");
const app = express();
const PORT = 3000;
const session = require("express-session");
const fs = require("fs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    if(!req.session.isLoggedin) {
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname + "/views/dashboard.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
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
            res.status(500).send("Something went wrong");
            return;
        }
        const userBase = JSON.parse(data);
        if(userBase[username]) {
            res.status(400).send("User already exists");
            return;
        }
        userBase[username] = { username, email, mobile, password };
        fs.writeFile(__dirname + "/data/userBase.json", JSON.stringify(userBase), (err) => {
            if(err) {
                console.log(err);
                res.status(500).send("Something went wrong");
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
            res.status(500).send("Something went wrong");
            return;
        }
        const userBase = JSON.parse(data);
        if(!userBase[username]) {
            res.status(400).send("User does not exist");
            return;
        }
        if(userBase[username].password === password) {
            req.session.isLoggedin = true;
            req.session.username = username;
            res.redirect("/");
            return;
        }
        res.status(400).send("Invalid credentials");
    });
});

app.get("/logout", (req, res) => {
    console.log("session destroyed");
    req.session.destroy();
    res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});