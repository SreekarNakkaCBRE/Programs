import React from 'react';


// Reusable form field component to eliminate redundancy
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    maxLength,
    style = {},
    children,
    hint,
    isTextarea = false,
    ...props
}) => {
    const baseInputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #CBCDCB',
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        borderColor: error ? '#e74c3c' : '#CBCDCB',
        ...style
    };

    const errorStyle = {
        color: '#e74c3c',
        fontSize: '0.8rem',
        marginTop: '0.25rem'
    };

    const hintStyle = {
        color: '#7F8480',
        fontSize: '0.75rem',
        marginTop: '0.25rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#003F2D',
        fontWeight: '500',
        fontSize: '0.9rem'
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>
                {label} {required && '*'}
            </label>
            {isTextarea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    style={{
                        ...baseInputStyle,
                        minHeight: '80px',
                        resize: 'vertical'
                    }}
                    {...props}
                />
            ) : (
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    required={required}
                    style={baseInputStyle}
                    {...props}
                />
            )}
            {error && <div style={errorStyle}>{error}</div>}
            {hint && <div style={hintStyle}>{hint}</div>}
            {children}
        </div>
    );
};

export default FormField;
