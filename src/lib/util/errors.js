/**
 * @param {unknown} err
 * @returns {string}
 */
export function error_message(err) {
  if (err instanceof Error) {
    return err.message
  }

  return String(err)
}
