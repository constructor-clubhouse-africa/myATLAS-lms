/* EmptyState Component 
- title
- description
- icon
- action (button component)
 */

export function EmptyState({ title, description, icon, action, className = '', ...props }) {
  //default fallback clipboard icon
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-sage"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-sage/40 ${className}`}
      {...props}
    >
      {/*icon container*/}
      <div className="p-3 bg-cream/40 rounded-full mb-3 text-teal">{icon || defaultIcon}</div>

      {/*main title*/}
      <h3 className="text-base font-bold text-navy mb-1">{title}</h3>

      {/*description*/}
      {description && (
        <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed mb-4">{description}</p>
      )}

      {/*action button*/}
      {action && <div className="w-full max-w-[200px]">{action}</div>}
    </div>
  );
}
