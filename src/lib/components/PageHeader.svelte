<script>
  export let eyebrow = ''
  export let title
  export let description = ''
</script>

<header class="page-header">
  {#if eyebrow}
    <p class="eyebrow">{eyebrow}</p>
  {/if}
  <h1>{title}</h1>
  {#if description}
    <p>{description}</p>
  {/if}
</header>
