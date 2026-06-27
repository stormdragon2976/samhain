import { test, expect } from '@playwright/test'
import { seed_state, mock_mastodon_api, statusFixture } from './helpers.js'

test.describe('Status detail', () => {
  test('loads the status and renders thread context (ancestors and replies)', async ({ page }) => {
    mock_mastodon_api(page, { status: statusFixture })

    await seed_state(page, '/statuses/100')

    await expect(page.getByRole('heading', { name: 'Status detail', level: 1 })).toBeVisible()
    // Earlier in thread section with the ancestor card.
    await expect(page.getByRole('heading', { name: 'Earlier in thread' })).toBeVisible()
    await expect(page.getByText('Earlier in the thread.')).toBeVisible()
    // Replies section with the descendant card and a link back to its detail.
    await expect(page.getByRole('heading', { name: 'Replies' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Carol' })).toHaveAttribute('href', '/statuses/101')
  })

  test('shows a connect prompt when no account is connected', async ({ page }) => {
    await page.goto('/statuses/100')
    await expect(page.getByRole('link', { name: 'Connect an instance' })).toBeVisible()
  })
})
