<script>
  import { settings, update_settings } from '$lib/state/app-state.js'
  import PageHeader from '$lib/components/PageHeader.svelte'

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'unlisted', label: 'Unlisted' },
    { value: 'private', label: 'Followers only' },
    { value: 'direct', label: 'Mentioned people only' }
  ]

  const themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ]
</script>

<svelte:head>
  <title>Settings | Samhain</title>
</svelte:head>

<PageHeader
  eyebrow="Settings"
  title="Settings"
  description="Persisted local preferences for the modern app shell."
/>

<form class="settings-panel">
  <div class="field-row">
    <label for="theme">Theme</label>
    <select
      id="theme"
      value={$settings.theme}
      onchange={(event) => update_settings({ theme: event.currentTarget.value })}
    >
      {#each themeOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <div class="field-row">
    <label for="default-visibility">Default post visibility</label>
    <select
      id="default-visibility"
      value={$settings.defaultVisibility}
      onchange={(event) => update_settings({ defaultVisibility: event.currentTarget.value })}
    >
      {#each visibilityOptions as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>

  <label class="check-row">
    <input
      type="checkbox"
      checked={$settings.confirmBeforePosting}
      onchange={(event) => update_settings({ confirmBeforePosting: event.currentTarget.checked })}
    >
    Confirm before posting
  </label>

  <label class="check-row">
    <input
      type="checkbox"
      checked={$settings.reduceMotion}
      onchange={(event) => update_settings({ reduceMotion: event.currentTarget.checked })}
    >
    Reduce motion
  </label>
</form>
