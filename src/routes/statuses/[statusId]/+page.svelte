<script>
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { account, to_credentials } from '$lib/state/app-state.js'
  import { get_status, get_status_context } from '$lib/mastodon/api.js'
  import { error_message } from '$lib/util/errors.js'
  import PageHeader from '$lib/components/PageHeader.svelte'
  import StatusCard from '$lib/components/StatusCard.svelte'

  let statusId = $derived(page.params.statusId)
  /** @type {any} */
  let status = $state(null)
  /** @type {any[]} */
  let ancestors = $state([])
  /** @type {any[]} */
  let descendants = $state([])
  let loading = $state(true)
  let error = $state('')

  onMount(async () => {
    if (!$account.instanceUrl || !$account.accessToken) {
      loading = false
      return
    }

    const credentials = to_credentials($account)

    try {
      const [loadedStatus, context] = await Promise.all([
        get_status(credentials, statusId),
        get_status_context(credentials, statusId)
      ])
      status = loadedStatus
      ancestors = context?.ancestors ?? []
      descendants = context?.descendants ?? []
    } catch (err) {
      error = error_message(err) || 'Could not load this status.'
    } finally {
      loading = false
    }
  })
</script>

<svelte:head>
  <title>Status | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Status"
  title="Status detail"
  description="A status and its thread context."
/>

<section class="content-stack" aria-label="Status detail" aria-live="polite">
  {#if loading}
    <p>Loading status…</p>
  {/if}
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  {#if !loading && !error && (!$account.instanceUrl || !$account.accessToken)}
    <p>No account connected. <a class="text-link" href="/login">Connect an instance</a> to load statuses.</p>
  {/if}

  {#if ancestors.length}
    <section class="thread-section" aria-label="Earlier in thread">
      <h2>Earlier in thread</h2>
      {#each ancestors as ancestor (ancestor.id)}
        <StatusCard
          author={ancestor.account?.display_name || ancestor.account?.username || 'Unknown'}
          handle={`@${ancestor.account?.acct ?? ''}`}
          content={ancestor.content || ''}
          href={`/statuses/${ancestor.id}`}
          timestamp={ancestor.created_at ?? ''}
          raw
        />
      {/each}
    </section>
  {/if}

  {#if status}
    <StatusCard
      author={status.account?.display_name || status.account?.username || 'Unknown'}
      handle={`@${status.account?.acct ?? ''}`}
      content={status.content || ''}
      timestamp={status.created_at ?? ''}
      raw
    />
  {/if}

  {#if descendants.length}
    <section class="thread-section" aria-label="Replies">
      <h2>Replies</h2>
      {#each descendants as descendant (descendant.id)}
        <StatusCard
          author={descendant.account?.display_name || descendant.account?.username || 'Unknown'}
          handle={`@${descendant.account?.acct ?? ''}`}
          content={descendant.content || ''}
          href={`/statuses/${descendant.id}`}
          timestamp={descendant.created_at ?? ''}
          raw
        />
      {/each}
    </section>
  {/if}
</section>
