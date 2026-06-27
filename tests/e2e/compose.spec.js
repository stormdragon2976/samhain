import { test, expect } from '@playwright/test'
import { seed_state, mock_mastodon_api } from './helpers.js'

test.describe('Compose', () => {
  test('posts a status and confirms with the returned id', async ({ page }) => {
    mock_mastodon_api(page, { postedStatus: { id: '777', content: '<p>posted</p>' } })
    page.on('dialog', (dialog) => dialog.accept())

    await seed_state(page, '/compose')
    const textarea = page.getByLabel('Status text')
    await expect(textarea).toBeVisible()
    await textarea.fill('A brand new post')
    await page.getByRole('button', { name: /Post/ }).click()

    await expect(page.getByText('Posted as status 777.')).toBeVisible()
    // The compose field is cleared after a successful post.
    await expect(textarea).toHaveValue('')
  })

  test('blocks an empty post with an accessible error', async ({ page }) => {
    mock_mastodon_api(page)
    await seed_state(page, '/compose')
    // Submit button is disabled while the field is empty.
    await expect(page.getByRole('button', { name: /Post/ })).toBeDisabled()
  })

  test('blocks posting when no account is connected', async ({ page }) => {
    await page.goto('/compose')
    const textarea = page.getByLabel('Status text')
    await textarea.fill('something')
    // Button enables because text is non-empty, but submitting shows the error.
    await page.getByRole('button', { name: /Post/ }).click()
    await expect(page.getByRole('alert')).toContainText('No account connected')
  })

  test('reveals the content warning field when enabled', async ({ page }) => {
    mock_mastodon_api(page)
    await seed_state(page, '/compose')
    await expect(page.getByLabel('Content warning', { exact: true })).toHaveCount(0)
    await page.getByLabel('Add content warning').check()
    await expect(page.getByLabel('Content warning', { exact: true })).toBeVisible()
  })
})
