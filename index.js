'use strict';

const request = require("request-promise");
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || "9001";
const bodyParser = require("body-parser");
const { Parser } = require("json2csv");

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

      const fields = ['id', 'tcgplayer_id', 'name', 'released_at', 'mana_cost', 'cmc', 'type_line', 'oracle_text', 'colors', 'reserved', 'set', 'set_name', 'set_type', 'scryfall_set_uri', 'rulings_uri', 'collector_number', 'rarity', 'artist', 'flavor_text', 'picURL', 'colorIdentity', 'gatherer', 'affiliate', 'rulings', 'cheapSkate', 'cardNum', 'packID', 'cardOrder', 'power', 'toughness'];

      fields.forEach(function(col) {
        packsCSV += col + ",";
      });
      packsCSV = packsCSV.substring(0, packsCSV.length - 1) + "newline";

      response.forEach(function(card) {

        if (index == 0) {
          packsJSON += "\u0022pack_" + packIndex + "\u0022: [";
        } else if (index == req.body.packSize) {
          packIndex++;
          cardNames[packIndex] = [];
          index = 0;
          packsJSON = packsJSON.substring(0, packsJSON.length - 1);
          packsJSON += "],\u2029"
          packsJSON += "\u0022pack_" + packIndex + "\u0022: [";
        }

        card.flavor_text = "*";
        //card.flavor_text = card.flavor_text.replace(/"/g,"").replace(/(\r\n|\n|\r)/gm," ");

        card.oracle_text = "*";
        //card.oracle_text = card.oracle_text.replace(/"/g,"").replace(/(\r\n|\n|\r)/gm,"");

        card.rulings = "*";
        //card.rulings = card.rulings.replace(/"/g,"").replace(/(\r\n|\n|\r)/gm,"");

        card.toughness = card.toughness;

        fields.forEach(function(col) {
          packsCSV += card[col] + ",";
        });

        packsCSV = packsCSV.substring(0, packsCSV.length - 1) + "newline"

        /*
        try {
          const parser = new Parser(opts);
          packsCSV += parser.parse(card) + "\u2029";
        } catch (err) {
          (err);
        }
        */

        packsJSON += JSON.stringify(card) + ",";
        cardNames[packIndex].push(card.name);
        index++;
      });

      ///packsCSV = packsCSV.substring(0, packsCSV.length - 1).replace(/"/g, "").replace(/(\r\n|\n|\r)/gm,"|||");
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
