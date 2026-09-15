/* Input Component
- text, password and number
- error
- isLoading
- disabled
 */

import { Spinner } from './Spinner';
import { useState } from 'react';

export function Input({
  label,
  error,
  helperText,
  type = 'text',
  fullWidth = true,
  disabled = false,
  isLoading = false,
  id,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  //toggle type dynamically when type is 'password'
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  //fallback ID if none is provided
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  //styling with 44px minimum tap target rule and teal focus ring
  const baseInputStyles =
    'min-h-[44px] px-3 py-2 rounded-lg border text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed text-navy bg-white placeholder:text-slate-400';

  //dynamic border and focus ring colors based on state (error vs. normal)
  const stateStyles = error
    ? 'border-coral focus:border-coral focus:ring-coral text-coral'
    : 'border-sage/50 focus:border-teal focus:ring-teal';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle} flex flex-col gap-1.5`}>
      {/*label*/}
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-navy">
          {label}
        </label>
      )}

      {/*container relative to input*/}
      <div className="relative w-full">
        <input
          id={inputId}
          type={effectiveType}
          disabled={disabled || isLoading}
          className={`${baseInputStyles} ${stateStyles} ${widthStyle} ${isLoading ? 'pr-10' : ''} ${className}`}
          {...props}
        />

        {/*trailing elements (spinner or password) */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Spinner size="sm" color="teal" />
          ) : type === 'password' ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              className="text-slate-400 hover:text-navy focus:outline-none disabled:opacity-50 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {/*show/hide password */}
              {showPassword ? (
                /*eye off icon*/
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a13.16 13.16 0 012.172-2.872m2.81-2.4A9.957 9.957 0 0112 5c7 0 10 7 10 7a13.13 13.13 0 01-1.669 2.339m-2.836 2.836A9.99 9.99 0 0112 19c-2.09 0-4.02-.64-5.625-1.73M3 3l18 18"
                  />
                </svg>
              ) : (
                /*eye icon*/
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/*error message*/}
      {error && (
        <p className="text-xs font-medium text-coral flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/*helper text*/}
      {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
