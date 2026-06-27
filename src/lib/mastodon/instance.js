const defaultScopes = ['read', 'write', 'follow', 'push']

/**
 * @param {string} value
 * @returns {string}
 */
export function normalize_instance_url(value) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const url = new URL(withProtocol)
  url.pathname = ''
  url.search = ''
  url.hash = ''
  return url.origin
}

/**
 * @param {string} instanceUrl
 * @returns {string}
 */
export function get_instance_api_base(instanceUrl) {
  return `${normalize_instance_url(instanceUrl)}/api/v1`
}

/**
 * @param {{
 *   instanceUrl: string,
 *   clientId: string,
 *   redirectUri: string,
 *   scopes?: string[],
 *   state?: string
 * }} options
 * @returns {string}
 */
export function build_oauth_authorize_url({
  instanceUrl,
  clientId,
  redirectUri,
  scopes = defaultScopes,
  state = ''
}) {
  const url = new URL('/oauth/authorize', normalize_instance_url(instanceUrl))
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(' '))

  if (state) {
    url.searchParams.set('state', state)
  }

  return url.toString()
}

/**
 * @param {string} instanceUrl
 */
export function create_login_preview(instanceUrl) {
  const normalizedUrl = normalize_instance_url(instanceUrl)
  return {
    instanceUrl: normalizedUrl,
    apiBase: `${normalizedUrl}/api/v1`,
    appsEndpoint: `${normalizedUrl}/api/v1/apps`,
    authorizeEndpoint: `${normalizedUrl}/oauth/authorize`
  }
}


/**
 * @param {string} instanceUrl
 * @param {{ clientName: string, redirectUri: string, scopes?: string[], website?: string }} options
 * @returns {Promise<{ clientId: string, clientSecret: string, redirectUri: string, scopes: string[] }>}
 */
export async function register_app(instanceUrl, options) {
  const normalizedUrl = normalize_instance_url(instanceUrl)
  const scopes = options.scopes ?? defaultScopes
  const form = new URLSearchParams()
  form.set('client_name', options.clientName)
  form.set('redirect_uris', options.redirectUri)
  form.set('scopes', scopes.join(' '))

  if (options.website) {
    form.set('website', options.website)
  }

  const response = await fetch(`${normalizedUrl}/api/v1/apps`, {
    method: 'POST',
    body: form
  })

  if (!response.ok) {
    throw new Error(`App registration failed: ${response.status} ${response.statusText}`)
  }

  const body = await response.json()
  return {
    clientId: body.client_id,
    clientSecret: body.client_secret,
    redirectUri: options.redirectUri,
    scopes
  }
}

/**
 * @param {string} instanceUrl
 * @param {{ clientId: string, clientSecret: string, code: string, redirectUri: string, scopes?: string[] }} options
 * @returns {Promise<{ accessToken: string, scopes: string[] }>}
 */
export async function exchange_oauth_code(instanceUrl, options) {
  const normalizedUrl = normalize_instance_url(instanceUrl)
  const scopes = options.scopes ?? defaultScopes
  const form = new URLSearchParams()
  form.set('client_id', options.clientId)
  form.set('client_secret', options.clientSecret)
  form.set('code', options.code)
  form.set('redirect_uri', options.redirectUri)
  form.set('grant_type', 'authorization_code')
  form.set('scope', scopes.join(' '))

  const response = await fetch(`${normalizedUrl}/oauth/token`, {
    method: 'POST',
    body: form
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`)
  }

  const body = await response.json()
  return {
    accessToken: body.access_token,
    scopes
  }
}

/**
 * @returns {string}
 */
export function get_redirect_uri() {
  return `${window.location.origin}/auth/callback`
}
