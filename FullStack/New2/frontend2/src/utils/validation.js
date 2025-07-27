import { useState } from 'react';

// =============================================================================
// VALIDATION RULES AND UTILITIES
// =============================================================================

/**
 * Validates form data based on the form type (signup, createUser, login, or profile)
 * @param {Object} formData - The form data to validate
 * @param {string} formType - Either 'signup', 'createUser', 'login', or 'profile'
 * @returns {Object} - { isValid: boolean, errors: object }
 */
export const validateForm = (formData, formType = 'signup') => {
    const errors = {};

    // First name validation (required for signup, createUser, and profile)
    if (formType !== 'login' && formData.first_name !== undefined) {
        if (!formData.first_name?.trim()) {
            errors.first_name = 'First name is required';
        } else if (formData.first_name.trim().length < 2) {
            errors.first_name = 'First name must be at least 2 characters';
        } else if (formData.first_name.trim().length > 50) {
            errors.first_name = 'First name must not exceed 50 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(formData.first_name.trim())) {
            errors.first_name = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
    }

    // Last name validation (required for signup, createUser, and profile)
    if (formType !== 'login' && formData.last_name !== undefined) {
        if (!formData.last_name?.trim()) {
            errors.last_name = 'Last name is required';
        } else if (formData.last_name.trim().length < 2) {
            errors.last_name = 'Last name must be at least 2 characters';
        } else if (formData.last_name.trim().length > 50) {
            errors.last_name = 'Last name must not exceed 50 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(formData.last_name.trim())) {
            errors.last_name = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
    }

    // Email validation (required for login, signup, and createUser - not for profile updates)
    if (formType !== 'profile' && formData.email !== undefined) {
        if (!formData.email?.trim()) {
            errors.email = 'Email is required';
        } else {
            const email = formData.email.trim().toLowerCase();
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            
            if (!emailRegex.test(email)) {
                errors.email = 'Please enter a valid email address';
            } else if (email.length > 254) {
                errors.email = 'Email address is too long';
            } else if (email.startsWith('.') || email.endsWith('.')) {
                errors.email = 'Email cannot start or end with a period';
            } else if (email.includes('..')) {
                errors.email = 'Email cannot contain consecutive periods';
            }
        }
    }

    // Password validation (required for login, signup, and createUser - not for profile updates)
    if (formType !== 'profile' && formData.password !== undefined) {
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formType === 'login') {
            // For login, just check that password is not empty
            if (formData.password.trim() === '') {
                errors.password = 'Password is required';
            }
        } else {
            // For signup and createUser, use full password validation
            const password = formData.password;
            const passwordErrors = [];

            if (password.length < 8) {
                passwordErrors.push('at least 8 characters');
            }
            if (password.length > 128) {
                passwordErrors.push('not exceed 128 characters');
            }
            if (!/[A-Z]/.test(password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!/\d/.test(password)) {
                passwordErrors.push('one number');
            }
            if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
                passwordErrors.push('one special character');
            }

            // Check for common weak passwords
            const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', '123456789'];
            if (commonPasswords.includes(password.toLowerCase())) {
                passwordErrors.push('a stronger, less common password');
            }

            if (passwordErrors.length > 0) {
                errors.password = `Password must contain ${passwordErrors.join(', ')}`;
            }
        }
    }

    // Contact number validation (optional for signup, createUser, and profile - not used for login)
    if (formType !== 'login' && formData.contact_number?.trim()) {
        const digitsOnly = formData.contact_number.replace(/\D/g, '');
        
        if (digitsOnly.length !== 10) {
            errors.contact_number = 'Contact number must be exactly 10 digits';
        } else if (!/^[6-9]/.test(digitsOnly)) {
            errors.contact_number = 'Mobile number must start with 6, 7, 8, or 9';
        }
    }

    // Address validation (optional for signup, createUser, and profile - not used for login)
    if (formType !== 'login' && formData.address?.trim() && formData.address.trim().length > 500) {
        errors.address = 'Address must not exceed 500 characters';
    }

    // Role validation (only for createUser, signup defaults to 2)
    if (formType === 'createUser') {
        if (!formData.role_id || (formData.role_id !== 1 && formData.role_id !== 2)) {
            errors.role_id = 'Please select a valid role';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validates a single field
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value of the field
 * @param {Object} formData - Complete form data for context
 * @param {string} formType - Either 'signup', 'createUser', 'login', or 'profile'
 * @returns {string} - Error message or empty string if valid
 */
export const validateField = (fieldName, value, formData, formType = 'signup') => {
    const tempFormData = { ...formData, [fieldName]: value };
    const { errors } = validateForm(tempFormData, formType);
    return errors[fieldName] || '';
};

// =============================================================================
// PASSWORD STRENGTH UTILITY
// =============================================================================

export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: 'Enter a password', color: '#ccc' };

    let score = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
        longEnough: password.length >= 12
    };

    // Calculate score
    Object.values(checks).forEach(check => {
        if (check) score++;
    });

    // Determine strength
    if (score <= 2) {
        return { strength: 1, text: 'Weak', color: '#ff4444' };
    } else if (score <= 4) {
        return { strength: 2, text: 'Medium', color: '#ffaa00' };
    } else if (score <= 5) {
        return { strength: 3, text: 'Strong', color: '#00aa00' };
    } else {
        return { strength: 4, text: 'Very Strong', color: '#00cc00' };
    }
};

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

export const formatContactNumber = (value) => {
    if (!value) return '';
    
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits only
    return digitsOnly.slice(0, 10);
};

export const normalizeEmail = (email) => {
    if (!email) return '';
    
    // Trim whitespace and convert to lowercase
    return email.trim().toLowerCase();
};

// =============================================================================
// CUSTOM FORM VALIDATION HOOK
// =============================================================================

/**
 * Custom hook for form validation and state management
 * @param {Object} initialForm - Initial form state
 * @param {string} formType - Either 'signup', 'createUser', 'login', or 'profile'
 * @returns {Object} - Form utilities and state
 */
export const useFormValidation = (initialForm, formType = 'signup') => {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        // Format contact number with real-time formatting
        if (name === 'contact_number') {
            formattedValue = formatContactNumber(value);
        }
        
        // Normalize email with real-time formatting
        if (name === 'email') {
            formattedValue = normalizeEmail(value);
        }
        
        setForm(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        
        // Real-time validation for touched fields
        if (touchedFields[name]) {
            const formData = { ...form, [name]: formattedValue };
            const fieldError = validateField(name, formattedValue, formData, formType);
            setErrors(prev => ({
                ...prev,
                [name]: fieldError
            }));
        }
    };

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        
        // Validate on blur
        const fieldError = validateField(field, form[field], form, formType);
        setErrors(prev => ({
            ...prev,
            [field]: fieldError
        }));
    };

    const validateAllFields = () => {
        const { isValid, errors: validationErrors } = validateForm(form, formType);
        
        // Preserve existing email availability errors for both signup and createUser
        const preservedErrors = { ...validationErrors };
        if (errors.email && errors.email.includes('already registered')) {
            preservedErrors.email = errors.email;
        }
        
        setErrors(preservedErrors);
        
        // Mark all fields as touched
        const allFieldsTouched = {};
        Object.keys(form).forEach(field => {
            allFieldsTouched[field] = true;
        });
        setTouchedFields(allFieldsTouched);
        
        // Return false if there are any errors (including email availability)
        const hasAnyErrors = Object.values(preservedErrors).some(error => error && error.trim() !== '');
        return !hasAnyErrors;
    };

    const resetForm = (newForm = initialForm) => {
        setForm(newForm);
        setErrors({});
        setTouchedFields({});
    };

    const updateForm = (updates) => {
        setForm(prev => ({ ...prev, ...updates }));
    };

    const setFieldError = (fieldName, error) => {
        setErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    const clearFieldError = (fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    return {
        form,
        errors,
        touchedFields,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm,
        updateForm,
        setForm,
        setErrors,
        setFieldError,
        clearFieldError
    };
};

export default useFormValidation;
