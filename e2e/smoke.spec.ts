import { test, expect } from '@playwright/test'

test.describe('LinkStash smoke', () => {
  let consoleErrors: string[]

  test.beforeEach(({ page }) => {
    consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
  })

  test.afterEach(async () => {
    expect(consoleErrors, `Console errors: ${consoleErrors.join(' | ')}`).toHaveLength(0)
  })

  // ─── 1. Unauthenticated redirect ───────────────────────────────────────────

  test('1 — /dashboard redirects to /login when not authenticated', async ({ browser }) => {
    // Explicit empty storageState — browser.newContext() alone may inherit project-level settings
    const ctx = await browser.newContext({
      baseURL: 'http://localhost:3000',
      storageState: { cookies: [], origins: [] },
    })
    const page = await ctx.newPage()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    await ctx.close()
  })

  // ─── 2. Add link ───────────────────────────────────────────────────────────

  test('2 — add link (example.com)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: '+ Add Link' }).click()

    const urlInput = page.getByPlaceholder('https://example.com')
    await urlInput.fill('https://example.com')
    await urlInput.press('Tab') // triggers onBlur → fetches metadata

    // Title input appears immediately when url is set; Save enabled when fetch completes
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Save' }).click()

    // Bookmark link should appear in the list
    await expect(page.getByRole('link', { name: /example domain/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  // ─── 3. Edit title ─────────────────────────────────────────────────────────

  test('3 — edit title', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: 'Edit' }).first().click()

    const titleInput = page.getByPlaceholder('Title')
    await titleInput.clear()
    await titleInput.fill('E2E Test Bookmark')

    await page.getByRole('button', { name: 'Save' }).first().click()
    await expect(page.getByRole('link', { name: 'E2E Test Bookmark' })).toBeVisible()
  })

  // ─── 4. Delete with confirm ────────────────────────────────────────────────

  test('4 — delete with confirm', async ({ page }) => {
    await page.goto('/dashboard')

    // Add a second bookmark so we can delete it without losing the one from test 2/3
    await page.getByRole('button', { name: '+ Add Link' }).click()
    const urlInput = page.getByPlaceholder('https://example.com')
    await urlInput.fill('https://example.org')
    await urlInput.press('Tab')
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Save' }).click()
    // Wait for add form to close
    await expect(page.getByRole('button', { name: '+ Add Link' })).toBeVisible({ timeout: 5_000 })

    // Delete the last bookmark (most recently added = example.org)
    const deleteButtons = page.getByRole('button', { name: 'Delete' })
    await deleteButtons.last().click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()

    await expect(page.getByRole('button', { name: 'Confirm delete' })).not.toBeVisible({
      timeout: 5_000,
    })
  })

  // ─── 5. Add tag + tag filter ───────────────────────────────────────────────

  test('5 — add tag and filter by tag', async ({ page }) => {
    await page.goto('/dashboard')

    // Target "E2E Test Bookmark" specifically (not ".first()" — avoids leftover-data issues)
    const bookmarkCard = page.locator('li').filter({
      has: page.getByRole('link', { name: 'E2E Test Bookmark' }),
    })
    await bookmarkCard.getByRole('button', { name: '+ Add tag' }).click()
    await page.getByPlaceholder('tag name').fill('e2e-smoke')
    await page.getByPlaceholder('tag name').press('Enter')

    // Wait for the tag chip to appear on that specific card
    await expect(bookmarkCard.locator('span', { hasText: 'e2e-smoke' })).toBeVisible({
      timeout: 5_000,
    })

    // Click the filter-bar link (rendered as <a>, not the card chip)
    await page.getByRole('link', { name: 'e2e-smoke' }).first().click()
    await expect(page).toHaveURL(/tag=e2e-smoke/)

    // The tagged bookmark must still be visible
    await expect(page.getByRole('link', { name: 'E2E Test Bookmark' })).toBeVisible()
  })

  // ─── 6. Search ─────────────────────────────────────────────────────────────

  test('6 — search filters results', async ({ page }) => {
    await page.goto('/dashboard')

    const searchInput = page.getByPlaceholder('Search bookmarks…')
    await searchInput.fill('E2E')

    // URL should update with q param
    await expect(page).toHaveURL(/q=E2E/, { timeout: 5_000 })

    // Tagged bookmark matches
    await expect(page.getByRole('link', { name: 'E2E Test Bookmark' })).toBeVisible()

    // Clear search
    await searchInput.clear()
    await expect(page).toHaveURL(/\/dashboard([^?]|$)/, { timeout: 5_000 })
  })

  // ─── 7. Grid view toggle + refresh ────────────────────────────────────────

  test('7 — grid view toggles and preference persists after refresh', async ({ page }) => {
    await page.goto('/dashboard')

    // Switch to grid
    await page.getByRole('button', { name: 'Grid view' }).click()
    await expect(page.locator('ul.grid')).toBeVisible()

    // Refresh — cookie should restore grid view
    await page.reload()
    await expect(page.locator('ul.grid')).toBeVisible()

    // Switch back to list (leave clean state for next run)
    await page.getByRole('button', { name: 'List view' }).click()
    await expect(page.locator('ul.space-y-2')).toBeVisible()
  })
})
