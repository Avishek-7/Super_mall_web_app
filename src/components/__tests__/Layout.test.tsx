import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../../test/test-utils'
import { Layout } from '../Layout'
import * as useAuthHook from '../../hooks/useAuth'
import type { User } from 'firebase/auth'

// Mock the useAuth hook
const mockUseAuth = vi.spyOn(useAuthHook, 'useAuth')

const createMockAuthReturn = (user: User | null = null) => ({
  user,
  userProfile: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loading: false,
})

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is not logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuthReturn())
    })

  it('renders the Super Mall logo and navigation', () => {
    render(
      <Layout title="Test Page">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getAllByText('Super Mall')).toHaveLength(2) // Header and Footer
    expect(screen.getByText('Your Shopping Hub')).toBeInTheDocument()
    expect(screen.getByText('🏠 Home')).toBeInTheDocument()
    expect(screen.getByText('⚖️ Compare')).toBeInTheDocument()
  })

  it('shows login and sign up buttons when not authenticated', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.queryByText('📊 Dashboard')).not.toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      )

      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('shows mobile menu when hamburger button is clicked', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      fireEvent.click(mobileMenuButton)

      await waitFor(() => {
        // Mobile menu should show the same navigation items
        expect(screen.getAllByText('🏠 Home')).toHaveLength(2) // Desktop + Mobile
        expect(screen.getAllByText('⚖️ Compare')).toHaveLength(2)
      })
    })
  })

  describe('when user is logged in', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as User

    const mockLogout = vi.fn()

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        userProfile: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
        loading: false,
      })
    })

    it('shows dashboard link and user info when authenticated', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
      expect(screen.queryByText('Login')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
    })

    it('shows user avatar with first letter of email', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      expect(screen.getByText('T')).toBeInTheDocument() // First letter of test@example.com
    })

    it('calls logout function when logout button is clicked', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1)
      })
    })

    it('shows user info in mobile menu', async () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i })
      fireEvent.click(mobileMenuButton)

      await waitFor(() => {
        expect(screen.getAllByText('test@example.com')).toHaveLength(2) // Desktop + Mobile
        expect(screen.getAllByText('📊 Dashboard')).toHaveLength(2)
      })
    })
  })

  describe('page title functionality', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuthReturn())
    })

    it('does not show page title when title is default', () => {
      render(
        <Layout title="Super Mall">
          <div>Test Content</div>
        </Layout>
      )

      // Default title should not create a separate title section, just the header h1
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1) // Only the header brand, no additional title
    })

    it('shows custom page title when provided', () => {
      render(
        <Layout title="Dashboard - Super Mall">
          <div>Test Content</div>
        </Layout>
      )

      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard - Super Mall' })).toBeInTheDocument()
    })
  })

  describe('footer', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuthReturn())
    })

    it('renders footer with brand information', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      expect(screen.getByText('Your ultimate shopping destination. Discover amazing deals and compare prices.')).toBeInTheDocument()
      expect(screen.getByText('© 2025 Super Mall. All rights reserved.')).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(createMockAuthReturn())
    })

    it('applies correct CSS classes for responsive design', () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('bg-white/90', 'backdrop-blur-md', 'sticky', 'top-0', 'z-50')

      const mainDiv = container.querySelector('div')
      expect(mainDiv).toHaveClass('min-h-screen', 'bg-gradient-to-br')
    })
  })
})
