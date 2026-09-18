import { Spinner } from './Spinner';

/* Button Component - primary, secondary and destructive
 -isLoading
 -disabled
 */

export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  //44x44px minimum tap target
  const baseStyles =
    'min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base active:scale-[0.98]';

  //width styling controlled by fullWidth prop
  const widthStyle = fullWidth ? 'w-full' : 'w-auto';

  //different variants have different colours
  const variants = {
    primary: 'bg-navy text-white hover:opacity-90',
    secondary: 'bg-teal text-white hover:opacity-90',
    destructive: 'bg-coral text-navy hover:opacity-90',
  };

  //structure for buttons
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${widthStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {/*isLoading buttons get a spinner*/}
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
