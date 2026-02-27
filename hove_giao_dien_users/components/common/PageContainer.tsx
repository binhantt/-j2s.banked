import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
}

export const PageContainer = ({
  children,
  title,
  description,
  maxWidth = '7xl',
  noPadding = false,
}: PageContainerProps) => {
  const maxWidthClass = maxWidth === 'full' ? 'w-full' : `max-w-${maxWidth}`;
  const paddingClass = noPadding ? '' : 'px-4 sm:px-6 lg:px-8 py-6';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className={`${maxWidthClass} mx-auto ${paddingClass}`}>
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
