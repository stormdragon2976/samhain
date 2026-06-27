import { test, expect } from '@playwright/test'
import {
  mock_mastodon_api,
  mock_oauth_registration,
  mock_oauth_token,
  instanceUrl,
  accountFixture
} from './helpers.js'

test.describe('Login and OAuth flow', () => {
  test('shows a connect prompt on the home timeline when no account is connected', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Connect an instance' })).toBeVisible()
    await expect(page.getByText('No account connected')).toBeVisible()
  })

  test('login form rejects an empty instance and shows an accessible error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const instanceInput = page.getByLabel('Mastodon instance')
    await expect(instanceInput).toBeVisible()
    // Clear the placeholder value and submit to trigger validation.
    await instanceInput.fill('http://[bad')
    await page.getByRole('button', { name: 'Connect and log in' }).click()
    await expect(page.getByRole('alert')).toContainText('valid Mastodon instance')
  })

  test('login registers the app and redirects to the instance authorize endpoint', async ({ page }) => {
    mock_oauth_registration(page)
    // Prevent the authorize redirect from reaching the network once mocked.
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Mastodon instance').fill('example.social')
    await page.getByRole('button', { name: 'Connect and log in' }).click()

    await page.waitForURL('**/oauth/authorize**')
    const url = new URL(page.url())
    expect(url.hostname).toBe('example.social')
    expect(url.pathname).toBe('/oauth/authorize')
    expect(url.searchParams.get('client_id')).toBe('test-client-id')
    expect(url.searchParams.get('response_type')).toBe('code')
    await expect(page.locator('#authorize-mock')).toHaveText('Authorize mock')
  })

  test('Save instance only persists the instance without starting OAuth', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel('Mastodon instance').fill('example.social')
    await page.getByRole('button', { name: 'Save instance only' }).click()
    // No error and we stay on the login page.
    await expect(page.getByRole('alert')).toHaveCount(0)
    const stored = await page.evaluate(() => window.localStorage.getItem('samhain.account'))
    expect(JSON.parse(stored).instanceUrl).toBe(instanceUrl)
  })

  test('OAuth callback exchanges the code and shows the logged-in account', async ({ page }) => {
    // Seed a registration but no access token yet, and set the expected state.
    const accountWithoutToken = {
      ...accountFixture,
      accessToken: '',
      username: '',
      accountId: '',
      displayName: ''
    }
    await page.goto('/')
    await page.evaluate((account) => {
      window.localStorage.setItem('samhain.account', JSON.stringify(account))
      window.sessionStorage.setItem('samhain.oauth.state', 'matching-state')
    }, accountWithoutToken)
    mock_oauth_token(page)
    mock_mastodon_api(page)

    await page.goto('/auth/callback?code=fake-code&state=matching-state')
    await expect(page.getByText('Logged in as @username@example.social.')).toBeVisible()

    const stored = await page.evaluate(() => window.localStorage.getItem('samhain.account'))
    expect(JSON.parse(stored).accessToken).toBe('new-access-token')
  })

  test('OAuth callback reports a state mismatch as an accessible error', async ({ page }) => {
    await page.goto('/')
    await page.evaluate((account) => {
      window.localStorage.setItem('samhain.account', JSON.stringify(account))
      window.sessionStorage.setItem('samhain.oauth.state', 'expected-state')
    }, { ...accountFixture, accessToken: '' })
    await page.goto('/auth/callback?code=fake-code&state=wrong-state')
    await expect(page.getByRole('alert')).toContainText('state mismatch')
  })
})
