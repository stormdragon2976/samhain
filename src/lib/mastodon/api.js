import { get_instance_api_base } from './instance.js'

/**
 * @typedef {Object} AccountCredentials
 * @property {string} instanceUrl
 * @property {string} accessToken
 */

/**
 * @param {AccountCredentials} account
 * @param {string} path
 * @param {RequestInit & { query?: Record<string, string | number | boolean | undefined> }} [options]
 * @returns {Promise<Response>}
 */
export async function api_request(account, path, options = {}) {
  if (!account.instanceUrl) {
    throw new Error('No instance connected. Add an instance in Settings before making API calls.')
  }

  if (!account.accessToken) {
    throw new Error('Not logged in. Connect an instance to authenticate API calls.')
  }

  const { query, headers, ...rest } = options
  const url = new URL(path, `${get_instance_api_base(account.instanceUrl)}/`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...rest,
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      ...headers
    }
  })

  return response
}

/**
 * @param {AccountCredentials} account
 * @param {string} path
 * @param {RequestInit & { query?: Record<string, string | number | boolean | undefined> }} [options]
 * @returns {Promise<any>}
 */
export async function api_json(account, path, options = {}) {
  const response = await api_request(account, path, options)

  if (!response.ok) {
    const body = await response.text()
    let message = `Mastodon API request failed: ${response.status} ${response.statusText}`
    if (body) {
      message += ` — ${body}`
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

/**
 * @param {AccountCredentials} account
 * @param {{ limit?: number, maxId?: string, sinceId?: string }} [params]
 * @returns {Promise<any[]>}
 */
export function get_home_timeline(account, params = {}) {
  return api_json(account, 'timelines/home', {
    query: {
      limit: params.limit ?? 20,
      max_id: params.maxId,
      since_id: params.sinceId
    }
  })
}

/**
 * @param {AccountCredentials} account
 * @param {{ limit?: number, maxId?: string }} [params]
 * @returns {Promise<any[]>}
 */
export function get_notifications(account, params = {}) {
  return api_json(account, 'notifications', {
    query: {
      limit: params.limit ?? 20,
      max_id: params.maxId
    }
  })
}

/**
 * @param {AccountCredentials} account
 * @param {string} statusId
 * @returns {Promise<{ ancestors: any[], descendants: any[] }>}
 */
export async function get_status_context(account, statusId) {
  return api_json(account, `statuses/${encodeURIComponent(statusId)}/context`)
}

/**
 * @param {AccountCredentials} account
 * @param {string} statusId
 * @returns {Promise<any>}
 */
export function get_status(account, statusId) {
  return api_json(account, `statuses/${encodeURIComponent(statusId)}`)
}

/**
 * @param {AccountCredentials} account
 * @param {{ status: string, visibility?: string, spoilerText?: string, inReplyToId?: string }} payload
 * @returns {Promise<any>}
 */
export function post_status(account, payload) {
  const form = new FormData()
  form.set('status', payload.status)
  form.set('visibility', payload.visibility ?? 'public')

  if (payload.spoilerText) {
    form.set('spoiler_text', payload.spoilerText)
  }

  if (payload.inReplyToId) {
    form.set('in_reply_to_id', payload.inReplyToId)
  }

  return api_json(account, 'statuses', {
    method: 'POST',
    body: form
  })
}

/**
 * @param {AccountCredentials} account
 * @returns {Promise<any>}
 */
export function get_account_credentials(account) {
  return api_json(account, 'accounts/verify_credentials')
}
