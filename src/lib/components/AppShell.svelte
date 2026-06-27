<script>
  import { page } from '$app/state'
  import { account, settings, update_account, is_logged_in } from '$lib/state/app-state.js'

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Compose', href: '/compose' },
    { label: 'Settings', href: '/settings' }
  ]

  let { children } = $props()
  let currentPath = $derived(page.url.pathname)
  let loggedIn = $derived(is_logged_in($account))

  function logout() {
    update_account({
      accessToken: '',
      username: '',
      accountId: '',
      displayName: ''
    })
  }
</script>

<svelte:head>
  <title>Samhain</title>
</svelte:head>

<div
  class:reduce-motion={$settings.reduceMotion}
  class="app-shell"
  data-theme={$settings.theme}
>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <nav class="primary-nav" aria-label="Primary">
    <a class="brand" href="/">
      <img src="/icon-72.png" alt="" width="32" height="32">
      <span>Samhain</span>
    </a>

    <ul>
      {#each navItems as item (item.href)}
        <li>
          <a
            href={item.href}
            aria-current={currentPath === item.href ? 'page' : undefined}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>

    <section class="account-summary" aria-labelledby="account-summary-heading">
      <h2 id="account-summary-heading">Account</h2>
      {#if loggedIn}
        <p>{$account.displayName || $account.username || 'Connected'}<br>
          <span class="account-handle">@{$account.username}@{new URL($account.instanceUrl).hostname}</span>
        </p>
        <button type="button" class="link-button" onclick={logout}>Log out</button>
      {:else if $account.instanceUrl}
        <p>Instance: {$account.instanceUrl}</p>
        <p><a class="text-link" href="/login">Log in</a></p>
      {:else}
        <p>No instance connected.</p>
        <a class="text-link" href="/login">Add instance</a>
      {/if}
    </section>
  </nav>

  <main id="main-content" tabindex="-1" class="main-panel">
    {@render children()}
  </main>
</div>
