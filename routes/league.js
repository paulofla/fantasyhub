const express = require('express');
const fpl = require('./service/fantasy')
const CookieJar = require('tough-cookie').CookieJar
const router = express.Router();

/* GET league listing. */
router.get('/', function(req, res, next) {
  session = CookieJar.fromJSON(req.cookies.fantasyhub)
  fpl.fetchH2HLeagueStandings(session, 185285)
  .then(league => res.send(league))
  .catch(error => res.status(500).send(error))
});

module.exports = router;
