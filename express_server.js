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
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/register", (req, res) => {
  res.render("register");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    };
  res.render("urls_new", templateVars)

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
  res.cookie('username', req.body["username"]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body["username"]);
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});