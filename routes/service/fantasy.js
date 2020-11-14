const fetch = require('node-fetch')
const CookieJar = require('tough-cookie').CookieJar
const FormData = require('form-data')
const fetchCookie = require('fetch-cookie/node-fetch')


const HEADERS = {
  'Accept-Language': 'en-US,en;q=0.9',
  'User-Agent': 'PostmanRuntime/7.22.0',
  'Accept': '*/*',
  'Cache-Control': 'no-cache',
  'Postman-Token': 'ac413ca0-6b98-4809-970e-efa291ac279c',
  'Connection': 'keep-alive',
  'Accept-Encoding': 'gzip, deflate, br'
}

/**
 * Validates a response from https://fantasy.premierleague.com.
 * @param response Fetch Response object.
 */
function validateResponse(response) {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
}

const playerCache = {}
async function footballPlayers() {
  if (Object.keys(playerCache).length === 0) {
    return fetch('https://fantasy.premierleague.com/api/bootstrap-static/',
        {
          method: 'GET',
          headers: HEADERS,
        }).then(res => {
          return res.json()})
          .then(context => {
            context.elements.forEach(player => {
              playerCache[player.id] = player
            })

            return playerCache
        })
    } else {
      return Promise.resolve(playerCache)
    }
}

async function fetchSession(
  login,
  password,
) {
  try {
    const cookieJar = new CookieJar()
    const fetchWithCookieJar = fetchCookie(fetch, cookieJar)
    const formData = new FormData()

    formData.append('login', login)
    formData.append('password', password)
    formData.append('app', 'plfpl-web')
    formData.append('redirect_uri', 'https://fantasy.premierleague.com/')


    const response = await fetchWithCookieJar(
      'https://users.premierleague.com/accounts/login/',
      {
        method: 'POST',
        body: formData,
        headers: HEADERS,
      },
    )
    validateResponse(response)

    if (
      cookieJar
        .getCookieStringSync('https://premierleague.com')
        .includes('pl_profile')
    ) {
      return cookieJar
    } else {
      throw new Error('Wrong credentials')
    }
  } catch (error) {
    throw error
  }
}

/**
 * Fetch H2H league standings page.
 * @param session Logged in user session.
 * @param leagueId ID of a H2H league.
 * @param options Page options.
 * @param options.pageStandings Page number of standings.
 * @param options.pageNewEntries Page number of new entries.
 */
async function fetchH2HLeagueStandings(
  session,
  leagueId,
  { pageStandings, pageNewEntries } = {
    pageStandings: 1,
    pageNewEntries: 1,
  },
) {
  try {
    const fetchWithCookieJar = fetchCookie(fetch, session)
    return fetchWithCookieJar(
      // tslint:disable-next-line
      `https://fantasy.premierleague.com/api/leagues-h2h/${leagueId}/standings/?page_new_entries=${pageNewEntries}&page_standings=${pageStandings}`,
      {
        method: 'GET',
        headers: HEADERS,
      }
      ).then(response => {
        validateResponse(response)
        return response.json()
      })
  } catch (error) {
    throw error
  }
}

/**
 * Fetch the logged in user.
 */
async function fetchCurrentUser(session) {
  try {
    const fetchWithCookieJar = fetchCookie(fetch, session)
    const response = await fetchWithCookieJar(
      'https://fantasy.premierleague.com/api/me/',
      {
        method: 'GET',
        headers: HEADERS,
      }
    )

    validateResponse(response)

    return response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Fetch the team of the logged in user.
 * @param entryId ID of an entry team.
 */
async function fetchMyTeam(
  session,
  entryId,
) {
  try {
    const fetchWithCookieJar = fetchCookie(fetch, session)
    const response = await fetchWithCookieJar(
      `https://fantasy.premierleague.com/api/my-team/${entryId}/`,
    )

    validateResponse(response)

    return response.json()
      .then(team => {
        return footballPlayers().then(players => {
          team.picks = team.picks.map(pick => Object.assign({}, pick, players[pick.element]))
          console.log(team)
          return team
        })
      })

  } catch (error) {
    throw error
  }
}

module.exports = exports = {
  fetchSession: fetchSession,
  fetchH2HLeagueStandings: fetchH2HLeagueStandings,
  fetchCurrentUser: fetchCurrentUser,
  fetchMyTeam: fetchMyTeam,
  footballPlayers: footballPlayers
}