const express = require("express");
const session = require("express-session");
const app = express();
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");

const port = process.env.PORT || 3009;

const users = [
    { id: 1, name: "Alex", email: "alex@gmail.com", password: "secret" },
    { id: 2, name: "max", email: "max@gmail.com", password: "secret" },
    { id: 3, name: "tax", email: "tax@gmail.com", password: "secret" },
];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        name: process.env.SESS_NAME,
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESS_SECRET,
        cookie: {
            maxAge: 7200000,
            sameSite: true,
            secure: false,
        },
    })
);

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else next();
};

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/home");
    } else next();
};

app.get("/", (req, res) => {
    const { userId } = req.session;
    // const userId = 1;
    console.log(userId);
    res.send(`
        <h1>Welcome!</h1>
        ${
            userId
                ? `
        <a href='/home'>Home</a>
        <form method='post' action='/logout'>
            <button>Logout</button>
        </form>
        `
                : `
        <a href="/login"> Login </a>
        <a href='/register'>Register</a>`
        }
    `);
});

app.get("/home", redirectLogin, (req, res) => {
    const user = users.find((user) => user.id == req.session.userId);

    res.send(`
        <h1>Home</h1>
        <a href="/">Main</a>
        <ul>
            <li>Name: ${user.name} </li>
            <li>Email: ${user.email} </li>
        </ul>
    `);
});

app.get("/login", redirectHome, (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type='email' name='email' palceholder='Email' required/>
            <input type='password' name='password' palceholder='Password' required/>
            <input type='submit' />
        </form>
        <a href='/register'> Register</a>
    `);
});

app.get("/register", redirectHome, (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form method='post' action='/register'>
            <input name='name' placeholder='Name' required/>
            <input type='email' name='emal' palceholder='Email' required/>
            <input type='password' name='password' palceholder='Password' required/>
            <input type='submit' />
        </form>
        <a href='/login'> Login</a>
    `);
});

app.post("/login", redirectHome, (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);

    if (email && password) {
        const user = users.find(
            (user) => user.email == email && user.password == password
        );

        if (user) {
            req.session.userId = user.id;
            return res.redirect("/home");
        }
    }

    res.redirect("/login");
});

app.post("/register", redirectHome, (req, res) => {
    const { name, email, password } = req.body;

    if (name && email && password) {
        const exists = users.some((user) => user.email == email);

        if (!exists) {
            const user = {
                id: users.length + 1,
                name,
                email,
                password,
            };
            users.push(user);

            req.session.userId = user.id;

            return res.redirect("/home");
        }
    }

    res.redirect("/register"); // query string  /register?error=error.auth.userExits
});

app.post("/logout", redirectLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/home");
        }
        res.clearCookie(process.env.SESS_NAME);
        res.redirect("/login");
    });
});

app.listen(port, () => console.log(`Server running at port : ${port}`));
