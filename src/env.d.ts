// Astro types
/// <reference types="astro/astro-jsx" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_PAGECLIP_KEY: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY: string;
  readonly PUBLIC_ENABLE_RECAPTCHA: string;
  readonly PUBLIC_IS_DEVELOPMENT: string;
  readonly PAGECLIP_KEY: string;
  readonly RECAPTCHA_SITE_KEY: string;
  readonly ENABLE_RECAPTCHA: string;
  readonly IS_DEVELOPMENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// External script globals
declare var grecaptcha: {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  render: (el: HTMLElement | string, opts: Record<string, unknown>) => number;
  reset: (id?: number) => void;
  getResponse: (id?: number) => string;
};

declare var Pageclip: {
  send: (formEl: HTMLFormElement, cb: (err: Error | null, res: Response) => void) => void;
};

declare var gtag: (...args: unknown[]) => void;

// Support className on HTML elements in Astro files to avoid JSX typescript conflicts
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    className?: string;
  }
}
