const express = require("express");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require("./helpers.js");

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

//
function urlsForUser(id){
  let urlData = {};
  for (data in urlDatabase) {
    if (urlDatabase[data]["userID"] === id){
      urlData[data] = urlDatabase[data];
    }
  }
  return urlData;
}

//geneate random string (url id)
function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';

  for (let i = 0; i < 6; i++) {
    string += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return string;
}

//JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const userId = req.session["userId"];

  //if user is not logged in return with a relevant error message
  if (!userId){
    return res.status(400).send('please login first');
  }

  //if user is logged in, jump to home page
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
  //if user is logged in redirects to home page
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
  //if user is not logged in render to register page
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {};
  //check login or not
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
  //check login or not
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

app.get("/u/:id", (req, res) => {
  //short link to longurl
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID].longURL;
  if (!longURL) {
    res.status(404).send("URL not found");
    return;
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  //check url found or not
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

  //check login or not
  if (!req.session["userId"]){
    return res.status(400).send('please login first');
  }


  //check has right to go to url page or not
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
  //check if not login
  if (!req.session["userId"]){
    return res.status(400).send('please login first');
  }

  //if already login
  let id = generateRandomString();
  let userId = req.session["userId"];
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: userId
  }
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  //check url has been created or not
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

  //check has right to delete url page or not
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
  //check url has been created or not
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

  //check has right to edit url page or not
  if(urlDatabase[id]["userID"] !== req.session["userId"]){
    return res.status(400).send('You cannot edit this URL');
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  //check email has been register or not
  if (!user){
    return res.status(400).send('email not found!');
  }

  //check password
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('password not correct');
  }
  req.session.userId = user.id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  //create user id
  const userId = Math.random().toString(36).substring(2, 5);

  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  //secure password
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check does user fullied email and password
  if (!email || !password) {
    return res.status(400).send('please provide a username AND password');
  } 

  //check email has been register or not
  if (user){
    return res.status(400).send('email has been register, pls use other email');
  }

  
  req.session.userId = userId;
  const userInfo = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  users[userId] = userInfo;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});