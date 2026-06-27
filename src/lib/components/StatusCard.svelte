<script>
  import { sanitize_html } from '$lib/util/sanitize.js'
  export let author
  export let handle
  export let content
  export let href = ''
  export let timestamp = ''
  export let raw = false
</script>

<article class="status-card" aria-labelledby={`${handle}-author`}>
  <header>
    <img src="/icon-72.png" alt="" width="48" height="48">
    <div>
      <h2 id={`${handle}-author`}>
        {#if href}
          <a href={href}>{author}</a>
        {:else}
          {author}
        {/if}
      </h2>
      <p>{handle}{timestamp ? ` · ${timestamp}` : ''}</p>
    </div>
  </header>
  {#if raw}
    <!-- Content is sanitized via sanitize_html before rendering. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <div class="status-content">{@html raw ? sanitize_html(content) : content}</div>
  {:else}
    <p>{content}</p>
  {/if}
  <footer aria-label="Status actions">
    <button type="button">Reply</button>
    <button type="button">Boost</button>
    <button type="button">Favorite</button>
    <button type="button">More</button>
  </footer>
</article>
