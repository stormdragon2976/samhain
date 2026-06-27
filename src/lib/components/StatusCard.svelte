<script>
  import { sanitize_html } from '$lib/util/sanitize.js'

  const interactiveSelector = 'button, input, select, textarea, [contenteditable="true"]'

  /** @type {string} */
  export let author = ''
  /** @type {string} */
  export let handle = ''
  /** @type {string} */
  export let content = ''
  /** @type {string} */
  export let href = ''
  /** @type {string} */
  export let timestamp = ''
  /** @type {boolean} */
  export let raw = false
  /** @type {string} */
  export let statusId = ''
  /** @type {number | undefined} */
  export let index = undefined
  /** @type {number | undefined} */
  export let length = undefined

  function heading_id() {
    return `status-${statusId || index?.toString() || 'item'}-author`
  }

  function actions_id() {
    return `status-${statusId || index?.toString() || 'item'}-actions`
  }

  function meta_id() {
    return `status-${statusId || index?.toString() || 'item'}-meta`
  }

  function content_id() {
    return `status-${statusId || index?.toString() || 'item'}-content`
  }

  const actions = ['Reply', 'Boost', 'Favorite', 'More']

  /**
   * @param {KeyboardEvent} event
   */
  function on_keydown(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }
    if (event.target instanceof Element && event.target.closest(interactiveSelector)) {
      return
    }

    const currentTarget = /** @type {Element} */ (event.currentTarget)
    const feed = currentTarget.closest('[data-status-feed]') ?? document
    const cards = Array.from(feed.querySelectorAll('[data-status-card]'))
    const currentIndex = cards.indexOf(currentTarget)
    const nextIndex = currentIndex + (event.key === 'ArrowDown' ? 1 : -1)
    const nextCard = /** @type {HTMLElement | undefined} */ (cards[nextIndex])

    if (!nextCard) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    nextCard.focus({ preventScroll: true })
    nextCard.scrollIntoView({ block: 'nearest' })
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<article
  class="status-card"
  id={statusId ? `status-${statusId}` : undefined}
  data-status-card
  tabindex="0"
  aria-posinset={index === undefined ? undefined : index + 1}
  aria-setsize={length}
  aria-labelledby={heading_id()}
  aria-describedby={`${meta_id()} ${content_id()}`}
  onkeydown={on_keydown}
>
  <header>
    <img src="/icon-72.png" alt="" width="48" height="48">
    <div>
      <h2 id={heading_id()}>
        {#if href}
          <a href={href}>{author}</a>
        {:else}
          {author}
        {/if}
      </h2>
      <p id={meta_id()}>{handle}{timestamp ? ` · ${timestamp}` : ''}</p>
    </div>
  </header>
  {#if raw}
    <!-- Content is sanitized via sanitize_html before rendering. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <div class="status-content" id={content_id()}>{@html raw ? sanitize_html(content) : content}</div>
  {:else}
    <p id={content_id()}>{content}</p>
  {/if}
  <footer role="group" aria-labelledby={actions_id()}>
    <span class="sr-only" id={actions_id()}>Actions for {author || 'this status'}</span>
    <ul class="status-actions">
      {#each actions as action}
        <li>
          <button type="button">{action}</button>
        </li>
      {/each}
    </ul>
  </footer>
  <hr class="status-separator" aria-hidden="true">
</article>
