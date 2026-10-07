export type AmplienceModuleOptions = {
  provider: 'amplience'
  hubName?: string
  locale?: string
}

export type AmplienceRuntimeConfig = {
  hubName: string
  allowDrafts?: boolean
  locale?: string
}

export * from './gen'
