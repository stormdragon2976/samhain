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
    const actions = page.getByRole('group', { name: 'Actions for Alice' })
    await expect(actions).toBeVisible()
    for (const label of ['Reply', 'Boost', 'Favorite', 'More']) {
      await expect(actions.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('status actions stay grouped with their own status in browse layout', async ({ page }) => {
    const secondStatus = {
      ...statusFixture,
      id: '101',
      content: '<p>Second status in the timeline.</p>',
      account: {
        id: '2',
        username: 'bob',
        acct: 'bob@example.social',
        display_name: 'Bob'
      }
    }
    mock_mastodon_api(page, { statuses: [statusFixture, secondStatus] })
    await seed_state(page)

    const timeline = page.getByRole('feed', { name: 'Timeline' })
    const statuses = timeline.locator('[data-status-card]')
    await expect(statuses).toHaveCount(2)
    await expect(page.getByRole('article', { name: 'Alice' })).toBeVisible()
    await expect(page.getByRole('article', { name: 'Bob' })).toBeVisible()
    await expect(statuses.first()).not.toHaveAttribute('aria-label')
    await expect(statuses.first().getByRole('group', { name: 'Actions for Alice' })).toBeVisible()
    await expect(statuses.first()).toHaveAccessibleDescription(/Hello world from the timeline/)
    await expect(statuses.first().locator('.status-separator')).toHaveAttribute('aria-hidden', 'true')
    await expect(timeline).toHaveCSS('margin-top', '12px')

    const firstActionsBox = await statuses.first().locator('footer').boundingBox()
    const secondHeaderBox = await statuses.nth(1).locator('header').boundingBox()
    expect(firstActionsBox).not.toBeNull()
    expect(secondHeaderBox).not.toBeNull()
    expect(firstActionsBox.y + firstActionsBox.height).toBeLessThan(secondHeaderBox.y)
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

  test('Arrow keys move focus between timeline statuses', async ({ page }) => {
    const secondStatus = {
      ...statusFixture,
      id: '101',
      content: '<p>Second status in the timeline.</p>'
    }
    mock_mastodon_api(page, { statuses: [statusFixture, secondStatus] })
    await seed_state(page)

    const timeline = page.getByRole('feed', { name: 'Timeline' })
    const statuses = timeline.locator('[data-status-card]')
    await expect(statuses).toHaveCount(2)
    await expect(statuses.first()).toHaveAttribute('aria-posinset', '1')
    await expect(statuses.nth(1)).toHaveAttribute('aria-posinset', '2')

    await statuses.first().focus()
    await page.keyboard.press('ArrowDown')
    await expect(statuses.nth(1)).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(statuses.first()).toBeFocused()
  })
})
