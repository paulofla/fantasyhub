var express = require('express');
var router = express.Router();
var status = {
  'startUp': new Date()
}
/* GET health listing. */
router.get('/', function(req, res, next) {
  res.send(status);
});

module.exports = router;