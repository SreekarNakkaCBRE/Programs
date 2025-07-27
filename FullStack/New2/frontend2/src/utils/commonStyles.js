import { colors } from './colors';

/**
 * Common reusable style patterns used across components
 * This reduces redundancy and ensures consistency
 */

// Base card styles - used for most white cards with shadows
export const baseCard = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`
};

// Card with padding - most common card variant
export const card = {
    ...baseCard,
    padding: '1.5rem',
    textAlign: 'center'
};

// Compact card with less padding
export const compactCard = {
    ...baseCard,
    padding: '1rem'
};

// Large card for forms and main content
export const largeCard = {
    ...baseCard,
    padding: '2rem'
};

// Container styles for page layouts
export const pageContainer = {
    padding: '1rem'
};

// Common header section
export const pageHeader = {
    marginBottom: '2rem'
};

// Page title styling
export const pageTitle = {
    color: colors.primary.darkGreen,
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0'
};

// Page subtitle styling
export const pageSubtitle = {
    color: colors.secondary.darkGray,
    fontSize: '1.1rem',
    margin: 0
};

// Section title styling
export const sectionTitle = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'left'
};

// Grid layouts
export const gridAuto = (minWidth = '250px') => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
    gap: '1rem'
});

// Common button styles
export const primaryButton = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

export const secondaryButton = {
    backgroundColor: colors.secondary.teal,
    color: colors.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

// Form input styles
export const formInput = {
    padding: '10px',
    borderRadius: '4px',
    border: `1px solid ${colors.secondary.mediumGreen}`,
    fontSize: '14px',
    color: colors.primary.darkGreen,
    width: '100%',
    boxSizing: 'border-box'
};

// Modern form input styles for validation forms
export const validationInput = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #CBCDCB',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
    boxSizing: 'border-box'
};

// Input with error state
export const inputWithError = (hasError) => ({
    ...validationInput,
    borderColor: hasError ? '#e74c3c' : '#CBCDCB'
});

// Common error message style
export const errorMessage = {
    color: '#e74c3c',
    fontSize: '0.8rem',
    marginTop: '0.25rem'
};

// Common hint message style
export const hintMessage = {
    color: '#7F8480',
    fontSize: '0.75rem',
    marginTop: '0.25rem'
};

// Common label style
export const formLabel = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#003F2D',
    fontWeight: '500',
    fontSize: '0.9rem'
};

// Field group style
export const fieldGroup = {
    marginBottom: '1.5rem'
};

// Common flexbox layouts
export const flexCenter = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

export const flexBetween = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

export const flexColumn = {
    display: 'flex',
    flexDirection: 'column'
};

// Loading state
export const loadingText = {
    textAlign: 'center',
    padding: '2rem',
    color: colors.secondary.darkGray,
    fontSize: '1.1rem'
};

// Clickable card (for action cards)
export const clickableCard = {
    ...card,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 63, 45, 0.15)'
    }
};

// Stat title styling
export const statTitle = {
    color: colors.secondary.darkGray,
    fontSize: '1rem',
    margin: '0 0 0.5rem 0',
    letterSpacing: '0.5px',
    textAlign: 'center'
};

// Stat number styling
export const statNumber = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: colors.primary.darkGreen,
    margin: 0,
    textAlign: 'center'
};

// Icon styling for action cards
export const actionIcon = {
    fontSize: '2.5rem',
    marginBottom: '1rem'
};

const commonStyles = {
    baseCard,
    card,
    compactCard,
    largeCard,
    pageContainer,
    pageHeader,
    pageTitle,
    pageSubtitle,
    sectionTitle,
    gridAuto,
    primaryButton,
    secondaryButton,
    formInput,
    validationInput,
    inputWithError,
    errorMessage,
    hintMessage,
    formLabel,
    fieldGroup,
    flexCenter,
    flexBetween,
    flexColumn,
    loadingText,
    clickableCard,
    statTitle,
    statNumber,
    actionIcon
};

export default commonStyles;
