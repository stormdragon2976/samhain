const allowedTags = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'del', 'em', 'i', 'ins',
  'li', 'mark', 'ol', 'p', 'pre', 's', 'span', 'strong', 'sub', 'sup', 'ul'
])

/** @type {Record<string, Set<string>>} */
const allowedAttributes = {
  a: new Set(['href', 'title', 'class']),
  span: new Set(['class']),
  abbr: new Set(['title'])
}

const safeSchemes = new Set(['http:', 'https:', 'mailto:', 'magnet:'])

/**
 * Sanitize Mastodon status HTML to a small allowlist of tags and attributes.
 * Strips scripts, event handlers, javascript: URLs, and unknown markup.
 * @param {string} html
 * @returns {string}
 */
export function sanitize_html(html) {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  clean(doc.body)
  return doc.body.innerHTML
}

/**
 * @param {Element} node
 */
function clean(node) {
  const children = Array.from(node.children)

  for (const child of children) {
    const tag = child.tagName.toLowerCase()

    if (!allowedTags.has(tag)) {
      const replacement = document.createTextNode(child.textContent ?? '')
      child.replaceWith(replacement)
      continue
    }

    for (const attr of Array.from(child.attributes)) {
      const allowed = allowedAttributes[tag]
      if (!allowed || !allowed.has(attr.name.toLowerCase())) {
        child.removeAttribute(attr.name)
        continue
      }

      if (attr.name.toLowerCase() === 'href') {
        try {
          const url = new URL(attr.value, window.location.origin)
          if (!safeSchemes.has(url.protocol)) {
            child.removeAttribute('href')
          } else {
            child.setAttribute('href', url.toString())
          }
        } catch {
          child.removeAttribute('href')
        }
      }
    }

    clean(child)
  }
}
