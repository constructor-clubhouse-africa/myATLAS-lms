/** Alert Component - info, success, warning, error **/

export function Alert({ variant = 'info', title, children, onClose, className = '', ...props }) {
  //different variants have different colours
  const variants = {
    info: 'bg-teal/10 border-teal text-navy',
    success: 'bg-emerald-50 border-emerald-500 text-emerald-950',
    warning: 'bg-amber-50 border-amber-500 text-amber-950',
    error: 'bg-coral/15 border-coral text-navy',
  };

  // icon for each variant
  const icons = {
    info: (
      <svg
        className="w-5 h-5 text-teal shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-5 h-5 text-emerald-600 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-5 h-5 text-amber-600 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5 text-coral shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  //structure for each alert
  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border-l-4 flex gap-3 items-start ${variants[variant]} ${className}`}
      {...props}
    >
      {/*icon*/}
      {icons[variant]}

      {/*content*/}
      <div className="flex-1 text-xs leading-relaxed">
        {title && <h4 className="font-bold text-sm mb-0.5">{title}</h4>}
        {children && <div>{children}</div>}
      </div>

      {/*close button*/}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="min-h-[36px] min-w-[36px] p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-4 h-4 opacity-70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
