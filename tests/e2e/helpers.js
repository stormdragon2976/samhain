// Shared fixtures and Mastodon API mock helpers for Playwright e2e tests.

export const instanceUrl = 'https://example.social'

export const accountFixture = {
  instanceUrl,
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  accessToken: 'test-access-token',
  username: 'username',
  accountId: '12345',
  displayName: 'Display Name'
}

export const settingsFixture = {
  theme: 'system',
  reduceMotion: false,
  defaultVisibility: 'public',
  confirmBeforePosting: true
}

export const statusFixture = {
  id: '100',
  created_at: '2026-06-27T00:00:00.000Z',
  content: '<p>Hello <strong>world</strong> from the timeline.</p>',
  text: null,
  account: {
    id: '1',
    username: 'alice',
    acct: 'alice@example.social',
    display_name: 'Alice'
  }
}

export const notificationFixture = {
  id: '50',
  type: 'favourite',
  created_at: '2026-06-27T00:00:00.000Z',
  account: {
    id: '2',
    username: 'bob',
    acct: 'bob@example.social',
    display_name: 'Bob'
  },
  status: statusFixture
}

const contextFixture = {
  ancestors: [
    {
      id: '99',
      created_at: '2026-06-26T23:00:00.000Z',
      content: '<p>Earlier in the thread.</p>',
      account: { username: 'alice', acct: 'alice@example.social', display_name: 'Alice' }
    }
  ],
  descendants: [
    {
      id: '101',
      created_at: '2026-06-27T01:00:00.000Z',
      content: '<p>A reply.</p>',
      account: { username: 'carol', acct: 'carol@example.social', display_name: 'Carol' }
    }
  ]
}

const credentialsFixture = {
  id: '12345',
  username: 'username',
  acct: 'username@example.social',
  display_name: 'Display Name'
}

/**
 * Seed localStorage so the persistent Svelte stores load with a logged-in
 * account and known settings, then reload so the client store reads them.
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 * @param {Partial<typeof accountFixture>} [accountOverrides]
 * @param {Partial<typeof settingsFixture>} [settingsOverrides]
 */
export async function seed_state(page, path = '/', accountOverrides = {}, settingsOverrides = {}) {
  const account = { ...accountFixture, ...accountOverrides }
  const settings = { ...settingsFixture, ...settingsOverrides }
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.evaluate(({ account, settings }) => {
    window.localStorage.setItem('samhain.account', JSON.stringify(account))
    window.localStorage.setItem('samhain.settings', JSON.stringify(settings))
  }, { account, settings })
  await page.reload()
  await page.waitForLoadState('networkidle')
}

/**
 * Intercept every Mastodon instance request with canned responses so tests
 * never touch a real instance or the network.
 * @param {import('@playwright/test').Page} page
 * @param {{ statuses?: any[], notifications?: any[], status?: any, context?: any, postedStatus?: any }} [data]
 */
export function mock_mastodon_api(page, data = {}) {
  const statuses = data.statuses ?? [statusFixture]
  const notifications = data.notifications ?? [notificationFixture]
  const status = data.status ?? statusFixture
  const context = data.context ?? contextFixture
  const postedStatus = data.postedStatus ?? { id: '999', content: '<p>posted</p>' }

  // Register the fallback first. Playwright gives later matching routes first
  // chance, so specific mocks below can override this broad guard.
  page.route(/\/api\/v1\//, (route) =>
    route.fulfill({ status: 404, body: 'mocked endpoint not configured' })
  )

  page.route(/\/api\/v1\/timelines\/home(?:\?|$)/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(statuses) })
  )

  page.route(/\/api\/v1\/notifications(?:\?|$)/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(notifications) })
  )

  page.route(/\/api\/v1\/statuses(?:\?|$)/, (route) => {
    if (route.request().method() !== 'POST') {
      return route.fulfill({ status: 404, body: 'mocked endpoint not configured' })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(postedStatus)
    })
  })

  page.route(/\/api\/v1\/statuses\/[^/]+\/context(?:\?|$)/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(context) })
  )

  page.route(/\/api\/v1\/statuses\/[^/]+(?:\?|$)/, (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(postedStatus)
      })
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(status)
    })
  })

  page.route(/\/api\/v1\/accounts\/verify_credentials(?:\?|$)/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(credentialsFixture)
    })
  )
}

/**
 * Mock the OAuth app registration endpoint and the authorize redirect target.
 * @param {import('@playwright/test').Page} page
 */
export function mock_oauth_registration(page) {
  page.route(/\/api\/v1\/apps(?:\?|$)/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        client_id: 'test-client-id',
        client_secret: 'test-client-secret',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        name: 'Samhain'
      })
    })
  )

  page.route(/\/oauth\/authorize(?:\?|$)/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body><h1 id="authorize-mock">Authorize mock</h1></body></html>'
    })
  )
}

/**
 * Mock the OAuth token exchange endpoint used by the /auth/callback page.
 * @param {import('@playwright/test').Page} page
 * @param {string} [accessToken]
 */
export function mock_oauth_token(page, accessToken = 'new-access-token') {
  page.route(/\/oauth\/token(?:\?|$)/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        scope: 'read write follow',
        created_at: 0
      })
    })
  )
}
