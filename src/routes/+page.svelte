<script>
  import { onMount } from 'svelte'
  import { account, to_credentials } from '$lib/state/app-state.js'
  import { get_home_timeline } from '$lib/mastodon/api.js'
  import { error_message } from '$lib/util/errors.js'
  import PageHeader from '$lib/components/PageHeader.svelte'
  import StatusCard from '$lib/components/StatusCard.svelte'

  /** @type {any[]} */
  let statuses = $state([])
  let loading = $state(true)
  let error = $state('')

  onMount(async () => {
    if (!$account.instanceUrl || !$account.accessToken) {
      loading = false
      return
    }

    try {
      statuses = await get_home_timeline(to_credentials($account))
    } catch (err) {
      error = error_message(err) || 'Could not load the home timeline.'
    } finally {
      loading = false
    }
  })
</script>

<svelte:head>
  <title>Home | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Home"
  title="Home timeline"
  description="Latest statuses from accounts you follow."
/>

<section
  class="content-stack"
  role="feed"
  aria-label="Timeline"
  aria-live="polite"
  aria-busy={loading}
  data-status-feed
>
  {#if loading}
    <p>Loading timeline…</p>
  {/if}
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  {#if !loading && !error && (!$account.instanceUrl || !$account.accessToken)}
    <p>No account connected. <a class="text-link" href="/login">Connect an instance</a> to load your timeline.</p>
  {/if}
  {#each statuses as status, index (status.id)}
    <StatusCard
      statusId={status.id}
      {index}
      length={statuses.length}
      author={status.account?.display_name || status.account?.username || 'Unknown'}
      handle={`@${status.account?.acct ?? ''}`}
      content={status.content || status.text || ''}
      href={`/statuses/${status.id}`}
      timestamp={status.created_at ?? ''}
      raw
    />
  {/each}
</section>
