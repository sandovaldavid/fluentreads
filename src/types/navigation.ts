/**
 * Interface for breadcrumb navigation items
 */
export interface BreadcrumbItem {
  label: string;
  url: string;
  active?: boolean;
}

/**
 * Interface for menu items
 */
export interface MenuItem {
  label: string;
  url: string;
  icon?: string;
  children?: MenuItem[];
  active?: boolean;
}

/**
 * Interface for navigation structure
 */
export interface Navigation {
  main: MenuItem[];
  footer: {
    columns: {
      title: string;
      links: MenuItem[];
    }[];
    legal: MenuItem[];
  };
}
