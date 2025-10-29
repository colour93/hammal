/**
 * Check if authentication is enabled
 * Returns true if both REGISTRY_USERNAME and REGISTRY_PASSWORD are configured
 */
export function isAuthEnabled(): boolean {
  const username = (globalThis as any).REGISTRY_USERNAME
  const password = (globalThis as any).REGISTRY_PASSWORD
  return !!(username && password)
}

/**
 * Validate Basic Authentication from request headers
 * Returns { valid: boolean, error?: string }
 */
export async function validateBasicAuth(request: Request): Promise<{ valid: boolean; error?: string }> {
  // If auth is not enabled, allow the request
  if (!isAuthEnabled()) {
    return { valid: true }
  }

  const authHeader = request.headers.get('Authorization')

  // Check if Authorization header is present
  if (!authHeader) {
    return {
      valid: false,
      error: 'Authorization header is required'
    }
  }

  // Check if it's Basic auth
  if (!authHeader.startsWith('Basic ')) {
    return {
      valid: false,
      error: 'Only Basic authentication is supported'
    }
  }

  try {
    // Decode the Base64 credentials
    const encoded = authHeader.slice(6)
    const decoded = atob(encoded)
    const [user, pass] = decoded.split(':', 2)

    // Get expected credentials from environment
    const expectedUsername = (globalThis as any).REGISTRY_USERNAME
    const expectedPassword = (globalThis as any).REGISTRY_PASSWORD

    // Validate credentials
    if (user === expectedUsername && pass === expectedPassword) {
      return { valid: true }
    }

    return {
      valid: false,
      error: 'Invalid credentials'
    }
  } catch (err) {
    return {
      valid: false,
      error: 'Failed to parse Authorization header'
    }
  }
}

/**
 * Generate 401 Unauthorized response with Basic auth challenge
 */
export function sendUnauthorized(error: string): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message: error
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="Docker Registry"'
      }
    }
  )
}
