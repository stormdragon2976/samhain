<script>
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { account, update_account, to_credentials } from '$lib/state/app-state.js'
  import { exchange_oauth_code, get_redirect_uri } from '$lib/mastodon/instance.js'
  import { get_account_credentials } from '$lib/mastodon/api.js'
  import { error_message } from '$lib/util/errors.js'
  import PageHeader from '$lib/components/PageHeader.svelte'

  let status = $state('Exchanging authorization code for an access token…')
  let error = $state('')

  onMount(async () => {
    const code = page.url.searchParams.get('code')
    const stateParam = page.url.searchParams.get('state')

    if (!code) {
      error = 'No authorization code was returned by the instance.'
      status = ''
      return
    }

    const expectedState = window.sessionStorage.getItem('samhain.oauth.state')
    if (expectedState && stateParam && stateParam !== expectedState) {
      error = 'OAuth state mismatch. The login was interrupted or tampered with.'
      status = ''
      return
    }

    const current = $account
    if (!current.instanceUrl || !current.clientId || !current.clientSecret) {
      error = 'Missing app registration for this instance. Start login again from the Login page.'
      status = ''
      return
    }

    try {
      const { accessToken } = await exchange_oauth_code(current.instanceUrl, {
        clientId: current.clientId,
        clientSecret: current.clientSecret,
        code,
        redirectUri: get_redirect_uri()
      })

      update_account({ accessToken })
      const credentials = to_credentials({ ...current, accessToken })
      const profile = await get_account_credentials(credentials)
      update_account({
        username: profile.username ?? '',
        accountId: String(profile.id ?? ''),
        displayName: profile.display_name ?? ''
      })

      window.sessionStorage.removeItem('samhain.oauth.state')
      status = `Logged in as @${profile.username}@${new URL(current.instanceUrl).hostname}.`
    } catch (err) {
      error = error_message(err) || 'Token exchange failed.'
      status = ''
    }
  })
</script>

<svelte:head>
  <title>Authorizing | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Login"
  title="Finishing login"
  description="Exchanging the authorization code returned by your Mastodon instance."
/>

<section class="content-stack" aria-live="polite">
  {#if status}
    <p>{status}</p>
  {/if}
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  {#if !error && !status}
    <p>Redirecting…</p>
  {/if}
  {#if !error}
    <p><a class="text-link" href="/">Go to home timeline</a></p>
  {/if}
</section>
