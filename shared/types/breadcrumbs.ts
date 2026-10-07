/**
 * Represents a single breadcrumb navigation item used in breadcrumb trails.
 * Used in navigation components to display hierarchical page paths.
 */
export interface BreadcrumbItem {
  /** Navigation path (URL) for the breadcrumb link */
  to: string
  /** Display text shown in the breadcrumb */
  value: string
}
