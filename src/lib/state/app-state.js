import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const settingsKey = 'samhain.settings'
const accountKey = 'samhain.account'

export const defaultSettings = {
  theme: 'system',
  reduceMotion: false,
  defaultVisibility: 'public',
  confirmBeforePosting: true
}

export const defaultAccount = {
  instanceUrl: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
  username: '',
  accountId: '',
  displayName: ''
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function read_value(key, fallback) {
  if (!browser) {
    return fallback
  }

  const stored = window.localStorage.getItem(key)
  if (!stored) {
    return fallback
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(stored)
    }
  } catch {
    return fallback
  }
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {import('svelte/store').Writable<T>}
 */
function create_persistent_store(key, fallback) {
  const store = writable(read_value(key, fallback))

  if (browser) {
    store.subscribe((value) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    })
  }

  return store
}

export const settings = create_persistent_store(settingsKey, defaultSettings)
export const account = create_persistent_store(accountKey, defaultAccount)

/**
 * @param {Partial<typeof defaultSettings>} patch
 */
export function update_settings(patch) {
  settings.update((current) => ({
    ...current,
    ...patch
  }))
}

/**
 * @param {Partial<typeof defaultAccount>} patch
 */
export function update_account(patch) {
  account.update((current) => ({
    ...current,
    ...patch
  }))
}

/**
 * Returns a plain account object safe to pass to API helpers.
 * @param {typeof defaultAccount} value
 */
export function to_credentials(value) {
  return {
    instanceUrl: value.instanceUrl,
    accessToken: value.accessToken
  }
}

/**
 * @param {typeof defaultAccount} value
 * @returns {boolean}
 */
export function is_logged_in(value) {
  return Boolean(value?.instanceUrl && value?.accessToken)
}
