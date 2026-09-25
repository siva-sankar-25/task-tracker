export interface UserLike {
  user_metadata?: {
    full_name?: string | null
    [key: string]: any
  } | null
  email?: string | null
}

/**
 * Returns the user's display name from metadata (full_name) if available,
 * otherwise falls back to the email prefix before the "@" symbol.
 */
export function getDisplayName(user?: UserLike | null): string {
  if (!user) return 'User'

  const fullName = user.user_metadata?.full_name?.trim()
  if (fullName) {
    return fullName
  }

  if (user.email) {
    const emailPrefix = user.email.split('@')[0]?.trim()
    if (emailPrefix) {
      return emailPrefix
    }
  }

  return 'User'
}
