/* Select Component - array of objects for dropdown options
- error 
- disabled
 */

export function Select({
  label,
  options,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  id,
  className = '',
  placeholder = 'Select an option',
  value,
  ...props
}) {
  //fallback ID for accessibility linkage
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  //styling with minimum tap target of 44px
  const baseSelectStyles =
    'min-h-[44px] px-3 py-2 rounded-lg border text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed text-navy bg-white appearance-none cursor-pointer pr-10';

  //dynamic state styling (error state vs normal state)
  const stateStyles = error
    ? 'border-coral focus:border-coral focus:ring-coral text-coral'
    : 'border-sage/50 focus:border-teal focus:ring-teal';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthStyle} flex flex-col gap-1.5`}>
      {/*label */}
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold uppercase tracking-wider text-navy">
          {label}
        </label>
      )}

      {/*select Container with dropdown arrow icon */}
      <div className="relative w-full">
        <select
          id={selectId}
          disabled={disabled}
          value={value}
          className={`${baseSelectStyles} ${stateStyles} ${widthStyle} ${className}`}
          {...props}
        >
          {/*default unselected placeholder ('Select an option')*/}
          <option value="" disabled>
            {placeholder}
          </option>

          {/*dynamic option mapping */}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/*arrow icon*/}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-navy">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/*error message in coral */}
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
