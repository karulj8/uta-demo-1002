export type ContentstackModuleOptions = {
  provider: 'contentstack'
}

export type ContentstackRuntimeConfig = {
  accessToken: string
  deliveryAccessToken: string
  previewAccessToken: string
  region: string
  environment: string
  branch?: string
}
