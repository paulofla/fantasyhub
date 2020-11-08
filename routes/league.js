var express = require('express');
var fantasy = require('@paulofla/fantasy-data/lib/api/index');
var router = express.Router();

/* GET league listing. */
router.get('/', function(req, res, next) {
  var leagueId = 185285;
  fantasy.default.fpl.League.getStandings(leagueId).then(result => {
    res.send(result);
  })
});

module.exports = router;
