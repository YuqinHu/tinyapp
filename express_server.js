const express = require("express");
var cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "abcd",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  for (let i = 0; i < 6; i++) {
    string += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return string;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.cookies["userId"];
  const userEmail = users[id].email;
  const templateVars = {
    email: userEmail,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/register", (req, res) => {
  res.render("register");
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["userId"];
  const userEmail = users[id].email;
  const templateVars = {
    email: userEmail
  };
  res.render("urls_new", templateVars);

});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`/urls/${tinyURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie('email', req.body["email"]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId', req.body["userId"]);
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const userId = Math.random().toString(36).substring(2, 5);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('please provide a username AND password');
  } 

  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send('Email be used');
    }
  }
  const user = {
    id: userId,
    email: email,
    password: password
  };
  users[userId] = user;
  res.cookie('userId', userId);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});