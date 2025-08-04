import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Mock user for testing
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2025-01-01T00:00:00.000Z',
    lastSignInTime: '2025-01-01T00:00:00.000Z',
  },
  providerData: [],
  refreshToken: 'test-refresh-token',
  tenantId: null,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve('test-token'),
  getIdTokenResult: () => Promise.resolve({
    token: 'test-token',
    expirationTime: 'test-expiration',
    authTime: 'test-auth-time',
    issuedAtTime: 'test-issued-at',
    signInProvider: 'password',
    signInSecondFactor: null,
    claims: {},
  }),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'firebase',
}

// Custom render function with providers

// Inline AllTheProviders to avoid import error
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
