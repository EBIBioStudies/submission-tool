export function useFeatureFlags() {
  const enableSubmission = import.meta.env.VITE_ENABLE_SUBMISSION !== 'false';

  const announcement = {
    enabled: import.meta.env.VITE_ANNOUNCEMENT_ENABLED === 'true',
    headline: import.meta.env.VITE_ANNOUNCEMENT_HEADLINE || '',
    message: import.meta.env.VITE_ANNOUNCEMENT_MESSAGE || '',
    priority: import.meta.env.VITE_ANNOUNCEMENT_PRIORITY || 'info',
  };

  return {
    enableSubmission,
    announcement,
  };
}
