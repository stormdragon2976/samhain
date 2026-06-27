<script>
  import { onMount } from 'svelte'
  import { account, to_credentials } from '$lib/state/app-state.js'
  import { get_notifications } from '$lib/mastodon/api.js'
  import { error_message } from '$lib/util/errors.js'
  import { sanitize_html } from '$lib/util/sanitize.js'
  import PageHeader from '$lib/components/PageHeader.svelte'

  /** @type {Record<string, string>} */
  const typeLabels = {
    mention: 'Mentioned you',
    reblog: 'Boosted your status',
    favourite: 'Favorited your status',
    follow: 'Followed you',
    follow_request: 'Requested to follow you',
    poll: 'Poll ended',
    update: 'Edited a status'
  }

  /** @type {any[]} */
  let notifications = $state([])
  let loading = $state(true)
  let error = $state('')

  onMount(async () => {
    if (!$account.instanceUrl || !$account.accessToken) {
      loading = false
      return
    }

    try {
      notifications = await get_notifications(to_credentials($account))
    } catch (err) {
      error = error_message(err) || 'Could not load notifications.'
    } finally {
      loading = false
    }
  })
</script>

<svelte:head>
  <title>Notifications | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Notifications"
  title="Notifications"
  description="Mentions, boosts, favorites, follows, and other activity."
/>

<section class="content-stack" aria-label="Notifications" aria-live="polite">
  {#if loading}
    <p>Loading notifications…</p>
  {/if}
  {#if error}
    <p class="form-error" role="alert">{error}</p>
  {/if}
  {#if !loading && !error && (!$account.instanceUrl || !$account.accessToken)}
    <p>No account connected. <a class="text-link" href="/login">Connect an instance</a> to load notifications.</p>
  {/if}
  {#each notifications as notification (notification.id)}
    <article class="simple-row">
      <h2>{typeLabels[notification.type] ?? notification.type}</h2>
      <p>{(notification.account?.display_name || notification.account?.username) ?? 'Someone'} (@{notification.account?.acct ?? ''})</p>
      {#if notification.status}
        <!-- Content is sanitized via sanitize_html before rendering. -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div class="status-content">{@html sanitize_html(notification.status.content)}</div>
        <p><a class="text-link" href={`/statuses/${notification.status.id}`}>View status</a></p>
      {/if}
    </article>
  {/each}
</section>
