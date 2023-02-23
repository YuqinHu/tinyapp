const express = require("express");
var cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  let templateVars = {};
  if (req.cookies["userId"]) {
    const id = req.cookies["userId"];
    const userEmail = users[id].email;
    templateVars = {
      email: userEmail,
      urls: urlDatabase };
  } else {
    templateVars = {
      email: null,
      urls: urlDatabase };
  }
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {};
  if (req.cookies["userId"]){
    const id = req.cookies["userId"];
    const userEmail = users[id].email;
    templateVars = {
      email: userEmail,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
    return;
  } else {
    templateVars = {
      email: null
    };
  }
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {};
  if (req.cookies["userId"]){
    const id = req.cookies["userId"];
    const userEmail = users[id].email;
    templateVars = {
      email: userEmail,
      urls: urlDatabase
    };
    res.render("urls_new", templateVars);
    return;
  } else {
    templateVars = {
      email: null,
      urls: urlDatabase
    };
    res.render(`login`, templateVars);
  }
});

app.get("/login", (req, res) => {
  let templateVars = {};
  if (req.cookies["userId"]){
    const id = req.cookies["userId"];
    const userEmail = users[id].email;
    templateVars = {
      email: userEmail,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
    return;
  } else {
    templateVars = {
      email: null
    };
  }
  res.render(`login`, templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVar = {};
  if (req.cookies["userId"]) {
    const id = req.cookies["userId"];
    const userEmail = users[id].email;
    templateVar = {
      email: userEmail,
      urls: urlDatabase };
  } else {
    templateVar = {
      email: null,
      urls: urlDatabase };
  }
  const id = req.params.id;
  const longUrl = urlDatabase[id].longURL;
  if (!urlDatabase[id]){
    return res.status(400).send('URL not found');
  }
  const templateVars = { ...templateVar, id, longUrl };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  if (!req.cookies["userId"]){
    return res.status(400).send('please login first');
  }
  let id = generateRandomString();
  let userId = req.cookies["userId"];
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  }
  res.redirect(`/urls/${id}`);
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
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (const userId in users) {
    if (users[userId].email === email && users[userId].password === password) {
      res.cookie('userId', userId);
      res.redirect(`/urls`);
      return;
    }
  }
  return res.status(400).send('email or password not correct!');
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId', req.body["userId"]);
  res.redirect(`/login`);
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
  res.redirect(`/login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});