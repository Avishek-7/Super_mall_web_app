import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '../../test/test-utils'
import { OfferCard } from '../OfferCard'
import type { Offer } from '../../types/shop'

const mockOffer: Offer = {
  id: 'test-offer-1',
  title: 'Test Offer',
  description: 'This is a test offer description',
  category: 'Electronics',
  originalPrice: 100,
  discountedPrice: 80,
  discountPercentage: 20,
  validFrom: new Date('2025-01-01'),
  validTo: new Date('2025-12-31'),
  shopId: 'test-shop-1',
  isActive: true,
  image: 'https://example.com/offer-image.jpg',
  termsAndConditions: 'Test terms and conditions',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

const mockExpiredOffer: Offer = {
  ...mockOffer,
  id: 'test-offer-2',
  title: 'Expired Offer',
  validTo: new Date('2024-12-31'), // Past date
}

const mockInactiveOffer: Offer = {
  ...mockOffer,
  id: 'test-offer-3',
  title: 'Inactive Offer',
  isActive: false,
}

describe('OfferCard Component', () => {
  describe('active offer', () => {
    it('renders offer information correctly', () => {
      render(<OfferCard offer={mockOffer} />)

      expect(screen.getByText('Test Offer')).toBeInTheDocument()
      expect(screen.getByText('This is a test offer description')).toBeInTheDocument()
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('₹80.00')).toBeInTheDocument()
      expect(screen.getByText('₹100.00')).toBeInTheDocument()
      expect(screen.getByText('20% OFF')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('displays offer image when provided', () => {
      render(<OfferCard offer={mockOffer} />)

      const image = screen.getByAltText('Test Offer')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/offer-image.jpg')
    })

    it('shows validity dates', () => {
      render(<OfferCard offer={mockOffer} />)

      expect(screen.getByText(/From Jan 1, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Until Dec 31, 2025/)).toBeInTheDocument()
    })

    it('shows terms and conditions in collapsible section', () => {
      render(<OfferCard offer={mockOffer} />)

      expect(screen.getByText('📋 Terms & Conditions')).toBeInTheDocument()
      
      // Terms should be in a details element
      const details = screen.getByText('Test terms and conditions')
      expect(details).toBeInTheDocument()
    })

    it('calls onViewDetails when View Details button is clicked', () => {
      const mockOnViewDetails = vi.fn()
      render(<OfferCard offer={mockOffer} onViewDetails={mockOnViewDetails} />)

      const viewDetailsButton = screen.getByText('View Details')
      fireEvent.click(viewDetailsButton)

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOffer)
      expect(mockOnViewDetails).toHaveBeenCalledTimes(1)
    })

    it('applies custom className when provided', () => {
      const { container } = render(
        <OfferCard offer={mockOffer} className="custom-class" />
      )

      const offerCard = container.firstChild as HTMLElement
      expect(offerCard).toHaveClass('custom-class')
    })
  })

  describe('expired offer', () => {
    it('shows expired status and disabled button', () => {
      const onViewDetails = vi.fn()
      render(<OfferCard offer={mockExpiredOffer} onViewDetails={onViewDetails} />)

      // Check for expired badge in the image area
      const expiredBadges = screen.getAllByText('Expired')
      expect(expiredBadges.length).toBeGreaterThan(0)
      expect(screen.queryByText('Active')).not.toBeInTheDocument()

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Expired')
    })

    it('applies opacity class for expired offers', () => {
      const { container } = render(<OfferCard offer={mockExpiredOffer} />)

      const offerCard = container.firstChild as HTMLElement
      expect(offerCard).toHaveClass('opacity-60')
    })
  })

  describe('inactive offer', () => {
    it('shows inactive status and disabled button', () => {
      const onViewDetails = vi.fn()
      render(<OfferCard offer={mockInactiveOffer} onViewDetails={onViewDetails} />)

      expect(screen.getByText('Inactive')).toBeInTheDocument()
      expect(screen.queryByText('Active')).not.toBeInTheDocument()

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Not Available')
    })
  })

  describe('offer without image', () => {
    const offerWithoutImage = { ...mockOffer, image: undefined }

    it('does not render image section when no image provided', () => {
      render(<OfferCard offer={offerWithoutImage} />)

      expect(screen.queryByAltText('Test Offer')).not.toBeInTheDocument()
    })
  })

  describe('offer without onViewDetails callback', () => {
    it('does not render View Details button when callback not provided', () => {
      render(<OfferCard offer={mockOffer} />)

      expect(screen.queryByText('View Details')).not.toBeInTheDocument()
    })
  })

  describe('offer without terms and conditions', () => {
    const offerWithoutTerms = { ...mockOffer, termsAndConditions: undefined }

    it('does not render terms section when not provided', () => {
      render(<OfferCard offer={offerWithoutTerms} />)

      expect(screen.queryByText('📋 Terms & Conditions')).not.toBeInTheDocument()
    })
  })

  describe('pricing scenarios', () => {
    it('shows only original price when no discounted price', () => {
      const offerWithOriginalPriceOnly = {
        ...mockOffer,
        discountedPrice: undefined,
        discountPercentage: undefined,
      }

      render(<OfferCard offer={offerWithOriginalPriceOnly} />)

      expect(screen.getByText('₹100.00')).toBeInTheDocument()
      expect(screen.queryByText('₹80.00')).not.toBeInTheDocument()
    })

    it('calculates discount from prices when percentage not provided', () => {
      const offerWithCalculatedDiscount = {
        ...mockOffer,
        discountPercentage: undefined,
      }

      render(<OfferCard offer={offerWithCalculatedDiscount} />)

      expect(screen.getByText('20% OFF')).toBeInTheDocument()
    })

    it('does not show discount badge when no discount available', () => {
      const offerWithoutDiscount = {
        ...mockOffer,
        originalPrice: undefined,
        discountedPrice: undefined,
        discountPercentage: undefined,
      }

      render(<OfferCard offer={offerWithoutDiscount} />)

      expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument()
    })
  })

  describe('responsive design', () => {
    it('applies correct CSS classes for modern styling', () => {
      const { container } = render(<OfferCard offer={mockOffer} />)

      const offerCard = container.firstChild as HTMLElement
      expect(offerCard).toHaveClass('bg-white', 'rounded-2xl', 'shadow-soft', 'hover:shadow-medium')
    })
  })
})
