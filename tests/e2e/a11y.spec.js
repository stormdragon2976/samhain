import { test, expect } from '@playwright/test'
import { seed_state, mock_mastodon_api, statusFixture } from './helpers.js'

test.describe('Accessibility and keyboard navigation', () => {
  test('primary navigation has an accessible name and labeled links', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    for (const label of ['Home', 'Notifications', 'Compose', 'Settings']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible()
    }
  })

  test('the active page link exposes aria-current="page"', async ({ page }) => {
    await page.goto('/notifications')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Notifications' })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page')
  })

  test('skip link moves focus to the main content', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    await skip.focus()
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })

  test('Tab moves through primary nav links without a keyboard trap', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Home' }).focus()
    await expect(page.getByRole('link', { name: 'Home' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Notifications' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Compose' })).toBeFocused()
  })

  test('status action buttons are present with accessible names', async ({ page }) => {
    mock_mastodon_api(page, { statuses: [statusFixture] })
    await seed_state(page)
    const actions = page.locator('footer[aria-label="Status actions"]')
    await expect(actions).toBeVisible()
    for (const label of ['Reply', 'Boost', 'Favorite', 'More']) {
      await expect(actions.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('compose form controls are labeled and keyboard reachable', async ({ page }) => {
    mock_mastodon_api(page)
    await seed_state(page, '/compose')
    const textarea = page.getByLabel('Status text')
    await textarea.focus()
    await expect(textarea).toBeFocused()
    // Tab should leave the textarea (no keyboard trap), reaching the visibility field.
    await page.keyboard.press('Tab')
    const activeId = await page.evaluate(() => document.activeElement?.id)
    expect(activeId).toBe('visibility')
  })

  test('logged-in account summary exposes a logout control', async ({ page }) => {
    await seed_state(page)
    const summary = page.getByRole('region', { name: 'Account' })
    await expect(summary).toBeVisible()
    await expect(summary.getByText(/Display Name/)).toBeVisible()
    await expect(summary.getByRole('button', { name: 'Log out' })).toBeVisible()
  })

  test('the home timeline region is announced politely', async ({ page }) => {
    mock_mastodon_api(page, { statuses: [statusFixture] })
    await seed_state(page)
    await expect(page.locator('section[aria-label="Timeline"]')).toHaveAttribute('aria-live', 'polite')
  })
})
