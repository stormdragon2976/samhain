<script>
  import { account, update_account } from '$lib/state/app-state.js'
  import { error_message } from '$lib/util/errors.js'
  import {
    normalize_instance_url,
    build_oauth_authorize_url,
    register_app,
    get_redirect_uri
  } from '$lib/mastodon/instance.js'
  import PageHeader from '$lib/components/PageHeader.svelte'

  let instanceInput = $state($account.instanceUrl)
  let error = $state('')
  let working = $state(false)

  /**
   * @param {SubmitEvent} event
   */
  async function start_login(event) {
    event.preventDefault()
    error = ''
    working = true

    let instanceUrl
    try {
      instanceUrl = normalize_instance_url(instanceInput)
    } catch {
      error = 'Enter a valid Mastodon instance domain or URL.'
      working = false
      return
    }

    try {
      const redirectUri = get_redirect_uri()
      const registration = await register_app(instanceUrl, {
        clientName: 'Samhain',
        redirectUri,
        website: window.location.origin
      })

      const state = crypto.randomUUID()
      window.sessionStorage.setItem('samhain.oauth.state', state)

      update_account({
        instanceUrl,
        clientId: registration.clientId,
        clientSecret: registration.clientSecret,
        accessToken: '',
        username: '',
        accountId: '',
        displayName: ''
      })

      const authorizeUrl = build_oauth_authorize_url({
        instanceUrl,
        clientId: registration.clientId,
        redirectUri,
        scopes: registration.scopes,
        state
      })

      window.location.assign(authorizeUrl)
    } catch (err) {
      error = error_message(err) || 'Could not start login with that instance.'
      working = false
    }
  }

  /**
   * @param {Event} event
   */
  function save_instance_only(event) {
    event.preventDefault()
    error = ''

    try {
      update_account({ instanceUrl: normalize_instance_url(instanceInput) })
    } catch {
      error = 'Enter a valid Mastodon instance domain or URL.'
    }
  }
</script>

<svelte:head>
  <title>Login | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Login"
  title="Connect an instance"
  description="Register Samhain with a Mastodon instance and start the OAuth login flow."
/>

<form class="form-panel" onsubmit={start_login}>
  <label for="instance-url">Mastodon instance</label>
  <input
    id="instance-url"
    bind:value={instanceInput}
    autocomplete="url"
    placeholder="mastodon.social"
    required
  >
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  <button type="submit" disabled={working}>
    {working ? 'Connecting…' : 'Connect and log in'}
  </button>
  <p class="form-hint">
    Need to save the instance without logging in?
    <button type="button" class="link-button" onclick={save_instance_only}>Save instance only</button>
  </p>
</form>
