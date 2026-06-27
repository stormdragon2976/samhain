<script>
  import { settings, account, to_credentials } from '$lib/state/app-state.js'
  import { post_status } from '$lib/mastodon/api.js'
  import { error_message } from '$lib/util/errors.js'
  import PageHeader from '$lib/components/PageHeader.svelte'

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'unlisted', label: 'Unlisted' },
    { value: 'private', label: 'Followers only' },
    { value: 'direct', label: 'Mentioned people only' }
  ]

  let statusText = $state('')
  let contentWarning = $state('')
  let visibility = $state($settings.defaultVisibility)
  let useContentWarning = $state(false)
  let posting = $state(false)
  let result = $state('')
  let error = $state('')

  const characterLimit = 500
  let remaining = $derived(characterLimit - statusText.length)

  /**
   * @param {SubmitEvent} event
   */
  async function submit_status(event) {
    event.preventDefault()
    error = ''
    result = ''

    if (!$account.instanceUrl || !$account.accessToken) {
      error = 'No account connected. Connect an instance before posting.'
      return
    }

    if (!statusText.trim()) {
      error = 'Status text cannot be empty.'
      return
    }

    if ($settings.confirmBeforePosting && !confirm('Post this status?')) {
      return
    }

    posting = true
    try {
      const posted = await post_status(to_credentials($account), {
        status: statusText,
        visibility,
        spoilerText: useContentWarning && contentWarning ? contentWarning : ''
      })
      result = `Posted as status ${posted.id}.`
      statusText = ''
      contentWarning = ''
      useContentWarning = false
      visibility = $settings.defaultVisibility
    } catch (err) {
      error = error_message(err) || 'Posting failed.'
    } finally {
      posting = false
    }
  }
</script>

<svelte:head>
  <title>Compose | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Compose"
  title="Compose status"
  description="Draft and post a new status to your connected instance."
/>

<form class="compose-panel" onsubmit={submit_status}>
  <label class="check-row">
    <input
      type="checkbox"
      checked={useContentWarning}
      onchange={(event) => (useContentWarning = event.currentTarget.checked)}
    >
    Add content warning
  </label>

  {#if useContentWarning}
    <label for="content-warning">Content warning</label>
    <input id="content-warning" bind:value={contentWarning} placeholder="Content warning text">
  {/if}

  <label for="status-text">Status text</label>
  <textarea
    id="status-text"
    bind:value={statusText}
    rows="8"
    maxlength={characterLimit}
  ></textarea>

  <div class="field-row">
    <label for="visibility">Visibility</label>
    <select id="visibility" bind:value={visibility}>
      {#each visibilityOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  {#if result}
    <p aria-live="polite">{result}</p>
  {/if}

  <div class="compose-actions">
    <p aria-live="polite">{remaining} characters remaining</p>
    <button type="submit" disabled={!statusText.trim() || posting}>
      {posting ? 'Posting…' : `Post (${visibility})`}
    </button>
  </div>
</form>
