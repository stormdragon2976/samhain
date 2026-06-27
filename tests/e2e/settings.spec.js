import { test, expect } from '@playwright/test'
import { seed_state } from './helpers.js'

test.describe('Settings persistence', () => {
  test('changing the theme persists across reloads', async ({ page }) => {
    await seed_state(page, '/settings', {}, { theme: 'system' })

    const themeSelect = page.getByLabel('Theme')
    await expect(themeSelect).toHaveValue('system')
    await themeSelect.selectOption('dark')

    let stored = await page.evaluate(() => window.localStorage.getItem('samhain.settings'))
    expect(JSON.parse(stored).theme).toBe('dark')

    await page.reload()
    await expect(themeSelect).toHaveValue('dark')
  })

  test('toggling reduce motion persists and applies the data attribute', async ({ page }) => {
    await seed_state(page, '/settings', {}, { reduceMotion: false })

    const checkbox = page.getByLabel('Reduce motion')
    await expect(checkbox).not.toBeChecked()
    await checkbox.check()

    const stored = await page.evaluate(() => window.localStorage.getItem('samhain.settings'))
    expect(JSON.parse(stored).reduceMotion).toBe(true)

    await expect(page.locator('.app-shell')).toHaveClass(/reduce-motion/)
  })

  test('changing default post visibility persists', async ({ page }) => {
    await seed_state(page, '/settings', {}, { defaultVisibility: 'public' })
    const visibility = page.getByLabel('Default post visibility')
    await visibility.selectOption('private')
    const stored = await page.evaluate(() => window.localStorage.getItem('samhain.settings'))
    expect(JSON.parse(stored).defaultVisibility).toBe('private')
  })
})
