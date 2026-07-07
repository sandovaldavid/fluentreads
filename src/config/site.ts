export interface SiteConfig {
  url: string;
  name: string;
  domain: string;
  whatsapp: string; // Formato E.164: sin espacios, sin '+'
  whatsappUrl: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
    youtube: string;
    twitter: string;
    twitterHandle: string;
    telegram: string;
    facebookAppId: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

export const siteConfig: SiteConfig = {
  url: 'https://fluentreads.sandovaldavid.com',
  name: 'FluentReads',
  domain: 'fluentreads.sandovaldavid.com',
  whatsapp: '51987654321',
  whatsappUrl: 'https://wa.me/51987654321',
  social: {
    facebook: 'https://www.facebook.com/fluentreads',
    instagram: 'https://www.instagram.com/fluentreads',
    tiktok: 'https://www.tiktok.com/@fluentreads',
    linkedin: 'https://www.linkedin.com/company/fluentreads',
    youtube: 'https://www.youtube.com/@fluentreads',
    twitter: 'https://twitter.com/fluentreads',
    twitterHandle: '@fluentreads',
    telegram: 'FluentReads',
    facebookAppId: '1234567890',
  },
  contact: {
    email: 'contacto@fluentreads.com',
    phone: '+51 987 654 321',
    address: 'Av. Principal 123, Piura, Perú',
  },
};
