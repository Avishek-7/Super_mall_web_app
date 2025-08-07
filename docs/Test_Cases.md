# Manual Test Cases - Super Mall Web App

## Authentication Tests
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC001 | Valid user login | 1. Navigate to /login<br>2. Enter valid email/password<br>3. Click Sign In | User logged in, redirected to dashboard | ✅ Pass |
| TC002 | Invalid credentials | 1. Navigate to /login<br>2. Enter invalid email/password<br>3. Click Sign In | Error message displayed | ✅ Pass |
| TC003 | Empty form submission | 1. Navigate to /login<br>2. Leave fields empty<br>3. Click Sign In | Validation errors shown | ✅ Pass |
| TC004 | User logout | 1. Login successfully<br>2. Click logout button | User logged out, redirected to home | ✅ Pass |

## Shop Management Tests
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC005 | Add new shop | 1. Login as admin<br>2. Navigate to add shop<br>3. Fill all required fields<br>4. Submit | Shop created successfully | ✅ Pass |
| TC006 | Edit shop details | 1. Select existing shop<br>2. Click edit<br>3. Modify details<br>4. Save | Shop updated successfully | ✅ Pass |
| TC007 | Delete shop | 1. Select shop<br>2. Click delete<br>3. Confirm deletion | Shop removed from list | ✅ Pass |
| TC008 | Filter shops by category | 1. Select category filter<br>2. Apply filter | Only shops of selected category shown | ✅ Pass |

## Offer Management Tests
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC009 | Create offer | 1. Navigate to offers<br>2. Click add offer<br>3. Fill details<br>4. Submit | Offer created and displayed | ✅ Pass |
| TC010 | Expired offer handling | 1. Create offer with past date<br>2. View offer | Offer shown as expired, button disabled | ✅ Pass |
| TC011 | Offer image display | 1. Add offer with image<br>2. View offer card | Image displayed correctly | ✅ Pass |
| TC012 | Terms & conditions | 1. Add offer with T&C<br>2. View offer<br>3. Click terms section | Terms displayed in collapsible section | ✅ Pass |

## Responsive Design Tests
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC013 | Mobile navigation | 1. Open app on mobile<br>2. Click hamburger menu | Mobile menu opens and displays correctly | ✅ Pass |
| TC014 | Tablet layout | 1. View on tablet screen<br>2. Navigate through pages | Layout adapts appropriately | ✅ Pass |
| TC015 | Desktop layout | 1. View on desktop<br>2. Check all components | Full desktop layout displayed | ✅ Pass |

## Edge Cases & Error Handling
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC016 | Network error handling | 1. Disconnect internet<br>2. Try to load data | Appropriate error message shown | ✅ Pass |
| TC017 | Invalid image URLs | 1. Add offer with broken image<br>2. View offer | Graceful fallback or error handling | ✅ Pass |
| TC018 | Form validation | 1. Submit forms with invalid data<br>2. Check validation | All validation rules enforced | ✅ Pass |
| TC019 | Permission testing | 1. Login as regular user<br>2. Try admin functions | Access denied appropriately | ✅ Pass |

## Performance Tests
| Test Case ID | Test Description | Steps | Expected Result | Status |
|-------------|------------------|-------|-----------------|--------|
| TC020 | Page load time | 1. Clear cache<br>2. Load homepage<br>3. Measure load time | Page loads under 3 seconds | ✅ Pass |
| TC021 | Large data handling | 1. Load page with many offers<br>2. Check performance | Smooth scrolling and interaction | ✅ Pass |

## Automated Test Coverage
- **Component Tests:** 29 tests passing
- **Service Tests:** CRUD operations tested
- **UI Tests:** Layout, OfferCard, responsive design
- **Integration Tests:** Firebase interaction mocked

## Test Environment
- **Browsers Tested:** Chrome, Firefox, Safari
- **Devices Tested:** Desktop, Tablet, Mobile
- **Operating Systems:** macOS, Windows, iOS, Android

## Notes
- All critical user journeys tested and passing
- Edge cases and error scenarios covered
- Responsive design verified across devices
- Performance meets acceptable standards
