const express = require('express');
const router = express.Router();
const CookieJar = require('tough-cookie').CookieJar
const fpl = require('./service/fantasy')


/* POST login page. */
router.post('/', function(req, res, next) {
  if (req.cookies.fantasyhub !== undefined) {
    session = CookieJar.fromJSON(req.cookies.fantasyhub)

    return retrieveUserInformation(res, session)
            .catch(error => {
              console.log(error)
              res.render('index', { title: 'Express' })
            })
  } else {
    fpl.fetchSession(req.body.username, req.body.password)
    .then(session => retrieveUserInformation(res, session))
    .catch(error => {
      console.log(error)
      res.render('index', { title: 'Express' })
    })
  }

})

function retrieveUserInformation(res, session) {
  return fpl.fetchCurrentUser(session)
          .then(user => fpl.fetchMyTeam(session, user.player.entry)
                        .then(team => {
                              res.cookie('fantasyhub', session) 
                              res.render('user', {user: user.player, team: team})
                            }))
}

module.exports = router;
