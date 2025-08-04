import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Firebase functions first
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  AuthErrorCodes: {
    INVALID_PASSWORD: 'auth/wrong-password',
    USER_NOT_FOUND: 'auth/user-not-found',
    INVALID_EMAIL: 'auth/invalid-email',
  },
}))

// Mock Firebase config
vi.mock('../../lib/firebase', () => ({
  auth: {},
}))

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/login' }),
  }
})

import { render } from '../../test/test-utils'
import { LoginPage } from '../login'
import { signInWithEmailAndPassword } from 'firebase/auth'

describe('LoginPage Component', () => {
  const mockSignIn = vi.mocked(signInWithEmailAndPassword)

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  it('renders login form with all required fields', () => {
    render(<LoginPage />)

    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('displays validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('displays validation error for password too short', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(passwordInput, '12345')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('handles successful login submission', async () => {
    const user = userEvent.setup()
    const mockUserCredential = {
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      },
    }

    mockSignIn.mockResolvedValue(mockUserCredential as never)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        {},
        'test@example.com',
        'password123'
      )
    })
  })

  it('handles authentication errors', async () => {
    const user = userEvent.setup()
    const authError = new Error('auth/wrong-password')
    authError.name = 'FirebaseError'
    mockSignIn.mockRejectedValue(authError)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    let resolveSignIn: (value: unknown) => void
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve
    })
    mockSignIn.mockReturnValue(signInPromise as never)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolveSignIn!({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
      },
    })

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })

  it('contains link to registration page', () => {
    render(<LoginPage />)

    const registerLink = screen.getByRole('link', { name: /create one/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('applies correct styling and responsive classes', () => {
    const { container } = render(<LoginPage />)

    const mainContainer = container.querySelector('.min-h-screen')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('bg-gradient-to-br')
  })

  it('prevents form submission with invalid data', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Should not call sign in with empty fields
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  describe('accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<LoginPage />)

      const form = screen.getByRole('form', { name: /login form/i }) || 
                  screen.getByRole('main') ||
                  screen.getByText('Sign In to Your Account').closest('form')

      expect(form).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('provides feedback for screen readers', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/required|invalid/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })
  })
})
