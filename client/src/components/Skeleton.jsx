/** Skeleton Component - text, circular and rectangular */

export function Skeleton({ variant = 'text', width, height, className = '', style, ...props }) {
  //shape variations
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full w-10 h-10 flex-shrink-0',
    rectangular: 'h-24 w-full rounded-lg',
  };

  //skeleton with pulsing background effect
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`animate-pulse bg-sage/30 ${variantStyles[variant]} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
