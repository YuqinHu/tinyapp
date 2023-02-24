const express = require("express");
const cookieSession = require('cookie-session');


const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['bootcamp'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

function urlsForUser(id){
  let urlData = {};
  for (data in urlDatabase) {
    if (urlDatabase[data]["userID"] === id){
      urlData[data] = urlDatabase[data];
    }
  }
  return urlData;
}

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  for (let i = 0; i < 6; i++) {
    string += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return string;
}

const getUserByEmail = function(email, database) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return false;
}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session["userId"];
  if (!userId){
    return res.status(400).send('please login first');
  }
  let templateVars = {};
  const userEmail = users[userId].email;
  templateVars = {
      email: userEmail,
      urls: urlsForUser(userId) 
  };

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {};
  if (req.session["userId"]){
    const id = req.session["userId"];
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
  if (req.session["userId"]){
    const id = req.session["userId"];
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
  if (req.session["userId"]){
    res.redirect('/urls');
    return;
  } else {
    templateVars = {
      email: null
    };
  }
  res.render(`login`, templateVars);
});

app.get("/urls/:id", (req, res) => {
  let check = 0;
  const id = req.params.id;
  for (data in urlDatabase) {
    if (data === id){
      check += 1;
    }
  }

  if (check === 0) {
    return res.status(400).send('url not found');
  }

  if (!req.session["userId"]){
    return res.status(400).send('please login first');
  }

  if(urlDatabase[id]["userID"] !== req.session["userId"]){
    return res.status(400).send('You cannot access this URL');
  }

  let templateVar = {};
  if (req.session["userId"]) {
    const id = req.session["userId"];
    const userEmail = users[id].email;
    templateVar = {
      email: userEmail,
      urls: urlDatabase };
  } else {
    templateVar = {
      email: null,
      urls: urlDatabase };
  }
  const longUrl = urlDatabase[id].longURL;

  if (!urlDatabase[id]){
    return res.status(400).send('URL not found');
  }
  const templateVars = { ...templateVar, id, longUrl };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  if (!req.session["userId"]){
    return res.status(400).send('please login first');
  }
  let id = generateRandomString();
  let userId = req.session["userId"];
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  }
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let check = 0;
  const id = req.params.id;
  for (data in urlDatabase) {
    if (data === id){
      check += 1;
    }
  }

  if (check === 0) {
    return res.status(400).send('url not found');
  }

  if(urlDatabase[id]["userID"] !== req.session["userId"]){
    return res.status(400).send('You cannot delete this URL');
  }
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/edit", (req, res) => {
  let check = 0;
  const id = req.params.id;
  for (data in urlDatabase) {
    if (data === id){
      check += 1;
    }
  }

  if (check === 0) {
    return res.status(400).send('url not found');
  }

  if(urlDatabase[id]["userID"] !== req.session["userId"]){
    return res.status(400).send('You cannot edit this URL');
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (const userId in users) {
    if (users[userId].email === email && bcrypt.compareSync(password, users[userId].password)) {
      req.session.userId = userId;
      res.redirect(`/urls`);
      return;
    }
  }
  
  return res.status(400).send('email or password not correct!');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  const userId = Math.random().toString(36).substring(2, 5);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('please provide a username AND password');
  } 

  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send('Email be used');
    }
  }
  req.session.userId = userId;
  const user = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  users[userId] = user;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});