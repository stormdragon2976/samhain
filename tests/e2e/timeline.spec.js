import { test, expect } from '@playwright/test'
import { seed_state, mock_mastodon_api, statusFixture, notificationFixture } from './helpers.js'

test.describe('Home timeline', () => {
  test('renders mocked statuses as cards with links to detail', async ({ page }) => {
    mock_mastodon_api(page, { statuses: [statusFixture] })
    await seed_state(page)

    await expect(page.getByRole('heading', { name: 'Home timeline' })).toBeVisible()
    const article = page.locator('.status-card').first()
    await expect(article.getByRole('heading', { name: 'Alice' })).toBeVisible()
    await expect(article.getByText(/Hello world from the timeline/)).toBeVisible()
    await expect(article.getByRole('link', { name: 'Alice' })).toHaveAttribute('href', '/statuses/100')
  })

  test('does not make an unauthenticated API call when logged out', async ({ page }) => {
    let apiCalled = false
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/timelines/home')) apiCalled = true
    })
    await page.goto('/')
    await expect(page.getByText('No account connected')).toBeVisible()
    expect(apiCalled).toBe(false)
  })
})

test.describe('Notifications', () => {
  test('renders mocked notifications with type labels and sanitized content', async ({ page }) => {
    mock_mastodon_api(page, { notifications: [notificationFixture] })
    await seed_state(page, '/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Favorited your status' })).toBeVisible()
    await expect(page.getByText(/Hello world from the timeline/)).toBeVisible()
  })

  test('shows a connect prompt when no account is connected', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('link', { name: 'Connect an instance' })).toBeVisible()
  })
})
