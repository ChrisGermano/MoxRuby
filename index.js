'use strict';

const request = require("request-promise");
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || "9001";
const bodyParser = require("body-parser");

const storedConfig = require('./config.js');

//******************************************************************************

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

app.listen(port);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//******************************************************************************

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/old-school-precons", (req, res) => {
    res.render("precons");
});

app.get("/pack-builder", (req, res) => {
    res.render("packs", { packs : {} });
});

app.post("/pack-builder", (req, res) => {
    console.log(req.body);
    const options = {
        method: 'POST',
        uri: storedConfig.config.apiUrl,
        body: req.body,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }

    request(options).then(function (response) {

      let cardNames = [];
      cardNames[0] = [];

      let index = 0;
      let packIndex = 0;

      let packsCSV = "";
      let packsJSON = "{";

      response.forEach(function(card) {

        if (index == 0) {
          packsJSON += "\u0022pack_" + packIndex + "\u0022: [";
        } else if (index == req.body.packSize) {
          packIndex++;
          cardNames[packIndex] = [];
          index = 0;
          packsCSV = packsCSV.substring(0, packsCSV.length - 1);
          packsCSV += "\u2029";
          packsJSON = packsJSON.substring(0, packsJSON.length - 1);
          packsJSON += "],\u2029"
          packsJSON += "\u0022pack_" + packIndex + "\u0022: [";
        }

        packsCSV += card.name + ",";
        packsJSON += "\u0022" + card.name + "\u0022,";
        cardNames[packIndex].push(card.name);
        index++;
      });

      packsCSV = packsCSV.substring(0, packsCSV.length - 1);
      packsJSON = packsJSON.substring(0, packsJSON.length - 1);
      packsJSON += "]}";

      res.render("packs", { packs : cardNames, packsCSV : packsCSV, packsJSON : packsJSON });

    })
    .catch(function (err) {
        console.log(err);
    })

});

app.get("/pack-images", (req, res) => {
    res.render("images");
});

app.get("/rotisserie-draft", (req, res) => {
    res.render("rotisserie");
});

app.get("/os-mtg-links", (req, res) => {
    res.render("links");
});
