// Google Analytics 4 Utility Functions

// Event tracking function
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Page view tracking function
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  }
};

// Custom event tracking for specific actions
export const trackJobView = (jobId: string) => {
  trackEvent('view_job', 'job_interaction', `job_${jobId}`);
};

export const trackJobApplication = (jobId: string) => {
  trackEvent('apply_job', 'job_interaction', `job_${jobId}`);
};

export const trackMessageSent = (conversationId: string) => {
  trackEvent('send_message', 'messaging', `conversation_${conversationId}`);
};

export const trackRegistration = (method: string) => {
  trackEvent('sign_up', 'authentication', method);
};

export const trackLogin = (method: string) => {
  trackEvent('login', 'authentication', method);
};
