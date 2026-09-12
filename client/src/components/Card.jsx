/* Card Component - default, interactive (outlined), flat
- title
- subtitle
- footer
*/

export function Card({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) {
  //base styling with soft shadow and rounded edges
  const baseStyles = 'rounded-xl transition-all duration-200 overflow-hidden text-navy';

  //variants
  const variants = {
    default: 'bg-white shadow-md border border-slate-100',
    outlined: 'bg-white border-2 border-sage/40',
    flat: 'bg-cream/50 border border-cream',
  };

  //interactive styling if an onClick prop is passed
  const interactiveStyles = onClick
    ? 'cursor-pointer hover:shadow-lg active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal'
    : '';

  return (
    <div
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/*card header*/}
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-2">
          {title && <h3 className="text-base font-bold text-navy leading-snug">{title}</h3>}
          {subtitle && <p className="text-xs text-teal font-medium mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/*main content*/}
      <div className="p-5 pt-3">{children}</div>

      {/*card footer*/}
      {footer && (
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </div>
  );
}
