import { useState } from 'react';

// Simple, clean validation functions
export function validateForm(formData, formType = 'signup') {
    const errors = {};

    // Email validation for all types
    if (formData.email !== undefined) {
        if (!formData.email?.trim()) {
            errors.email = 'Email is required';
        } else {
            const email = formData.email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = 'Please enter a valid email address';
            }
        }
    }

    // Password validation
    if (formData.password !== undefined) {
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formType !== 'login' && formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
    }

    // Name validations for non-login forms
    if (formType !== 'login') {
        if (formData.first_name !== undefined) {
            if (!formData.first_name?.trim()) {
                errors.first_name = 'First name is required';
            } else if (formData.first_name.trim().length < 2) {
                errors.first_name = 'First name must be at least 2 characters';
            }
        }

        if (formData.last_name !== undefined) {
            if (!formData.last_name?.trim()) {
                errors.last_name = 'Last name is required';
            } else if (formData.last_name.trim().length < 2) {
                errors.last_name = 'Last name must be at least 2 characters';
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export function getPasswordStrength(password) {
    if (!password) return { strength: 0, text: 'Enter a password', color: '#ccc' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

    if (score <= 2) return { strength: 1, text: 'Weak', color: '#ff4444' };
    if (score <= 4) return { strength: 2, text: 'Medium', color: '#ffaa00' };
    return { strength: 3, text: 'Strong', color: '#00aa00' };
}

export function formatContactNumber(value) {
    if (!value) return '';
    return value.replace(/\D/g, '').slice(0, 10);
}

export function normalizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
}

// Simple form validation hook
export function useFormValidation(initialForm, formType = 'signup') {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        if (name === 'contact_number') {
            formattedValue = formatContactNumber(value);
        }
        if (name === 'email') {
            formattedValue = normalizeEmail(value);
        }
        
        setForm(prev => ({ ...prev, [name]: formattedValue }));
        
        // Validate if field has been touched
        if (touchedFields[name]) {
            const tempFormData = { ...form, [name]: formattedValue };
            const { errors: validationErrors } = validateForm(tempFormData, formType);
            setErrors(prev => ({ ...prev, [name]: validationErrors[name] || '' }));
        }
    };

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
        const { errors: validationErrors } = validateForm(form, formType);
        setErrors(prev => ({ ...prev, [field]: validationErrors[field] || '' }));
    };

    const validateAllFields = () => {
        const { isValid, errors: validationErrors } = validateForm(form, formType);
        setErrors(validationErrors);
        return isValid;
    };

    const setFieldError = (fieldName, error) => {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
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
        setForm,
        setErrors,
        setFieldError,
        clearFieldError
    };
}
