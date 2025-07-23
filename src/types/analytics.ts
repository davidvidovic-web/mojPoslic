// Google Analytics 4 Global Types

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_title?: string;
        page_location?: string;
        custom_map?: Record<string, string>;
        [key: string]: unknown;
      }
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
}

export {};
