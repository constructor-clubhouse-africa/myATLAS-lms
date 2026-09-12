/* Page Layout for all pages 
- header, content, footer
- floating navigation bar
- scrollbar isolation (no overlap)
- show/hide behavior on scroll
- back button navigation
*/

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function PageLayout({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerAction,
  children,
  footer,
  className = '',
  ...props
}) {
  const navigate = useNavigate();

  const [showBars, setShowBars] = useState(true);
  const lastScrollY = useRef(0);

  //functionality to hide and show header and navigation bar based on scroll (minimise clutter and ease data entry)
  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;

    if (currentScrollY < lastScrollY.current && currentScrollY > 10) {
      setShowBars(true);
    } else if (currentScrollY > lastScrollY.current) {
      setShowBars(false);
    }

    lastScrollY.current = currentScrollY;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex justify-center sm:py-6">
      {/* 375px screen*/}
      <div
        className={`relative w-full max-w-[375px] min-h-screen sm:min-h-[667px] sm:max-h-[812px] bg-white sm:rounded-2xl shadow-xl flex flex-col overflow-hidden ${className}`}
        {...props}
      >
        {/*vertically stacked header with title and subtitle*/}
        <header
          className={`absolute top-1.5 left-2 right-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-md px-2 pt-2 pb-3 shrink-0 shadow-sm transition-all duration-300 ease-in-out ${
            showBars
              ? 'translate-y-0 opacity-100'
              : '-translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex flex-col min-w-0 flex-1">
              {/*back button*/}
              {showBackButton && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-3.5 h-3.5 -ml-0.5 mb-0.5 flex items-center justify-center rounded text-navy hover:bg-cream transition-colors shrink-0"
                  aria-label="Go back"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/*title*/}
              <h7 className="text-[20px] font-bold text-navy truncate leading-normal m-0 p-0 mb-1.5">
                {title}
              </h7>

              {/*subtitle*/}
              {subtitle && (
                <p className="text-[12px] text-teal font-medium truncate leading-none m-0 mt-[1px] p-0">
                  {subtitle}
                </p>
              )}
            </div>

            {headerAction && <div className="shrink-0 flex items-center">{headerAction}</div>}
          </div>
        </header>

        {/*scrollable content area*/}
        <main className="flex-1 w-full h-full relative overflow-hidden">
          <div
            onScroll={handleScroll}
            className={`h-full overflow-y-auto px-3 space-y-4 scroll-smooth transition-[padding] duration-300 ease-in-out ${
              showBars ? 'pt-24 pb-16' : 'pt-1.5 pb-3'
            }`}
            style={{ scrollbarGutter: 'stable' }}
          >
            {children}

            {footer && (
              <footer className="shrink-0 bg-slate-50 border border-slate-100 p-3 rounded-lg mt-4">
                {footer}
              </footer>
            )}
          </div>
        </main>

        {/*floating navigation bar*/}
        <nav
          className={`absolute bottom-4 left-4 right-4 z-20 bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-2xl p-2.5 flex items-center justify-around transition-all duration-300 ease-in-out ${
            showBars
              ? 'translate-y-0 opacity-100'
              : 'translate-y-[calc(100%+16px)] opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal text-[10px] font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal text-[10px] font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Assessments
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal text-[10px] font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Notifications
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal text-[10px] font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </button>
        </nav>
      </div>
    </div>
  );
}
