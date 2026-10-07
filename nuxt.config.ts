import { type NuxtConfig, defineNuxtConfig } from 'nuxt/config'
import { HashAlgorithm } from '@scayle/storefront-nuxt'
import type { RuntimeConfig } from '@nuxt/schema'
import type { LocaleObject } from '@nuxtjs/i18n'
import * as customRpcMethods from './rpcMethods'
import withParams from './shared/constants/withParams'
import { shops } from './config/shops'
import { BREAKPOINTS } from './config/ui'
import { stringToBoolean } from './server/utils/boolean'

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    cdnUrl: string
    googleMapsApiKey: string

    userCentricsAppId: string
  }
}

/**
 * [DEFAULT VALUE] Storefront Core - Configure format for AppKey generation for baskets and wishlists
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions#app-keys
 */
const DEFAULT_APP_KEYS = {
  // NOTE: Baskets and wishlists are unscoped and shared across all configured shops.
  // If baskets and wishlists should be scoped by shop, the respective keys need to be extended with `{shopId}`.
  wishlistKey: 'wishlist_{userId}', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_APP_KEYS_WISHLIST_KEY
  basketKey: 'basket_{userId}', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_APP_KEYS_BASKET_KEY
  hashAlgorithm: HashAlgorithm.SHA256, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_APP_KEYS_HASH_ALGORITHM
}

declare module '@scayle/storefront-nuxt' {
  // Extend the shop config
  export interface AdditionalShopConfig {
    paymentProviders: string[]
    appKeys: typeof DEFAULT_APP_KEYS
  }
  /**
   * Represents the public configuration of a shop.
   *
   * This interface extends the shop configuration to make additional properties
   * available on `currentShop`, ensuring proper regional and payment settings.
   *
   * @typedef PublicShopConfig
   *
   * @property paymentProviders - List of payment providers available for the shop.
   *
   * @property countryCode - The country code used to determine the shop's region.
   *
   * This property is necessary for distinguishing shops in different languages within the same country.
   * For example, Germany may have two shops: one in German (`de_DE`) and another in English (`en_US`).
   * Since the `locale` attribute only represents language and not the region, `countryCode` ensures
   * correct regional detection.
   */
  export interface PublicShopConfig {
    paymentProviders: string[]
    countryCode: string
    /**
     * Indicates if the shop requires consent management for third party services.
     * If true, the shop will require the user to consent to the use of third party services.
     * If false, the shop will not require the user to consent to the use of third party services.
     * This is used to determine if the consent management module should be enabled for the shop.
     * @default false
     */
    requiresConsentManagement?: boolean
  }
}

type NitroRouteRules = Required<NuxtConfig>['routeRules']
type NitroRouteConfig =
  NitroRouteRules extends Record<string, infer Value> ? Value : never

/**
 * [DEFAULT VALUE] Storefront Core - Shop domain if `domain` is selected as `shopSelector
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization/configuration#routing-configuration
 */
const baseShopDomain = (code: string | string[]) =>
  `${Array.isArray(code) ? code[0] : code}.localhost:3000`

const SHOP_SELECTOR_MODE = (process.env.SHOP_SELECTOR_MODE ??
  'path') as RuntimeConfig['storefront']['shopSelector'] // Build time only configuration
const DOMAIN_PER_LOCALE = SHOP_SELECTOR_MODE === 'domain' // Build time only configuration

const isVercel =
  process.env.NITRO_PRESET && process.env.NITRO_PRESET.includes('vercel')

// Generate the I18N locales from the shop config

const locales: LocaleObject[] = shops.flatMap((shop) => {
  if (Array.isArray(shop.code)) {
    if (SHOP_SELECTOR_MODE === 'domain') {
      // Only one domain can be assigned to a shop,
      // we generate the domain using the first shop code.
      return {
        code: shop.code[0]!,
        language: shop.locale,
        domain: baseShopDomain(shop.code[0] as string),
        file: shop.translationFile,
      }
    }

    return shop.code.map((code) => ({
      code,
      language: shop.locale,
      domain: baseShopDomain(code),
      file: shop.translationFile,
    }))
  } else {
    return {
      code: shop.code,
      language: shop.locale,
      domain: baseShopDomain(shop.code),
      file: shop.translationFile,
    }
  }
})

function getI18nStrategy(): 'prefix' | 'prefix_except_default' | 'no_prefix' {
  if (SHOP_SELECTOR_MODE === 'path') {
    return 'prefix'
  }
  if (SHOP_SELECTOR_MODE === 'path_or_default') {
    return 'prefix_except_default'
  }
  return 'no_prefix'
}

const defaultShop = shops.find((shop) => shop.isDefault) ?? shops[0]
const i18nDefaultLocale = Array.isArray(defaultShop.code)
  ? defaultShop.code[0]
  : defaultShop.code

export default defineNuxtConfig({
  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#compatibilitydate */
  compatibilityDate: '2024-09-03',

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#devtools */
  devtools: { enabled: true },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#telemetry */
  telemetry: false,

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#debug */
  debug: stringToBoolean(process.env.NUXT_DEBUGGING_ENABLED),

  /**
   * @note Any key/value pair outside of the `public` key are private/server-side only
   * @see https://nuxt.com/docs/3.x/guide/going-further/runtime-config
   */
  runtimeConfig: {
    // Following keys are overridable using prefix NUXT_CHECKOUT_
    checkout: {
      accessHeader: undefined, // Override: NUXT_CHECKOUT_ACCESS_HEADER
    },
    /**
     *  Configuration for the SCAYLE Omnichannel add-on
     * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/omnichannel
     */
    // https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/omnichannel
    omnichannel: {
      apiToken: '', // Override: NUXT_OMNICHANNEL_API_TOKEN
      apiHost: '', // Override: NUXT_OMNICHANNEL_API_HOST
    },
    /** @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration */
    storefront: {
      /**
       * Storefront Core - Additional server-side context properties exposed to client-side
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#public-shop-data
       */
      publicShopData: [
        'paymentProviders',
        'countryCode',
        'requiresConsentManagement',
      ], // Override: NUXT_PUBLIC_PUBLIC_SHOP_DATA

      /**
       * Storefront Core - Configure format for AppKey generation for baskets and wishlists
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions#app-keys
       */
      appKeys: DEFAULT_APP_KEYS,

      /**
       * [OPTIONAL] Storefront Core - Fetch redirects from Storefront API set within Cloud Panel
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/redirects
       */
      redirects: {
        enabled: false, // Override: NUXT_STOREFRONT_REDIRECTS_ENABLED
        queryParamWhitelist: [], // Override: NUXT_STOREFRONT_REDIRECTS_QUERY_PARAM_WHITELIST
      },

      /**
       * Storefront Core - Configuration of session handling and cookie
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions
       */
      session: {
        sameSite: 'lax', // Override: NUXT_STOREFRONT_SESSION_SAME_SITE
        maxAge: 2419200, // 4 weeks in seconds | Override: NUXT_STOREFRONT_SESSION_MAX_AGE
      },

      /**
       * Storefront Core - Storefront API Client configuration
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#storefront-api
       */
      sapi: {
        host: '', // Override: NUXT_STOREFRONT_SAPI_HOST
        token: '', // Override: NUXT_STOREFRONT_SAPI_TOKEN
      },

      /**
       * Storefront Core - Token-based (OAuth) Authentication configurations
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/login-and-registration
       */
      oauth: {
        apiHost: '', // Override: NUXT_STOREFRONT_OAUTH_API_HOST
        clientId: '', // Override: NUXT_STOREFRONT_OAUTH_CLIENT_ID
        clientSecret: '', // Override: NUXT_STOREFRONT_OAUTH_CLIENT_SECRET
      },

      /**
       * Storefront Core - Identity Provider support for Token-based (OAuth) Authentication
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions#configure-identity-providers
       */
      idp: {
        enabled: false,
        idpKeys: [],
        idpRedirectURL: '',
      },

      /**
       * Storefront Core - Configure shop switching based on selected routing option (`domain` or `path`-based)
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization/configuration#routing-configuration
       */
      shopSelector: SHOP_SELECTOR_MODE, // Override: NUXT_STOREFRONT_SHOP_SELECTOR

      /**
       * Storefront Core - Shop-specific configuration options
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#shops
       */
      shops: shops.reduce(
        (previousShopConfigs, shop) => ({
          /**
           * Values within `storefront.shops` are overridable by using their locale as identifier.
           * Example of an runtimeConfig override: NUXT_STOREFRONT_SHOPS_EN_US_PATH=someValue
           * All values should be provided through runtime using NUXT_ environment variable overrides.
           * @see https://nuxt.com/docs/guide/going-further/runtime-config#example
           */
          ...previousShopConfigs,

          /**
           * We can use shop.locale instead of shop.shopId to avoid conflicts if we use the same shopId for multiple shop.
           * The key [shop.locale] is connected to the overridable environment variables like NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_USER.
           * Depending on what key will be used here, the variables need use either the locale or shopId as{UNIQUE_IDENTIFIER}.
           * NOTE: We recommend to use the shopId as {UNIQUE_IDENTIFIER}!
           * Example if `[shop.locale]` is used -> overridable environment variable: NUXT_STOREFRONT_SHOPS_EN_US_CHECKOUT_USER.
           * Example if `[shop.shopId]` is used -> overridable environment variable: NUXT_STOREFRONT_SHOPS_1001_CHECKOUT_USER.
           */
          [shop.shopId]: {
            /**
             * Storefront Core - Identity Provider support for Token-based (OAuth) Authentication
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions#configure-identity-providers
             */
            idp: {
              enabled: false,
              idpKeys: ['google'],
              idpRedirectURL: '',
            },
            /** Storefront Core - Numeric SCAYLE ShopId (usually 5 digits) */
            shopId: shop.shopId, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_SHOP_ID
            /**
             * [CONDITIONAL] Storefront Core - Shop path if `path` is selected as `shopSelector
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization/configuration#routing-configuration
             */
            path: shop.code, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_PATH

            /**
             * [CONDITIONAL] Storefront Core - Shop domain if `domain` is selected as `shopSelector
             *
             * Required in `domain` mode, where the shop is resolved by matching
             * the request host against it. Optional in `path` mode, where it
             * pins the public origin of every absolute URL the shop renders:
             * set it when the proxy in front passes a client-sent
             * `x-forwarded-host` through untouched, so cached pages cannot bake
             * in a forged host. Left empty in `path` mode, absolute URLs follow
             * the forwarded host of the request.
             *
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization/configuration#routing-configuration
             */
            // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_DOMAIN
            domain: DOMAIN_PER_LOCALE ? baseShopDomain(shop.code) : '',

            locale: shop.locale, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_LOCALE

            /** Storefront Core -  Country code used to determine the shop's region. */
            countryCode: shop.countryCode,

            /**
             * Storefront Core - Shop-specific authentication configurations
             * @note Currently only `resetPasswordUrl` is supported
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#password-reset-url#password-reset-url
             */
            auth: {
              // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_AUTH_RESET_PASSWORD_URL
              resetPasswordUrl: `https://${baseShopDomain(
                shop.code,
              )}/${shop.locale}/signin/`,
            },

            /** Storefront Core - Set shop-specific campaign keyword to be used */
            shopCampaignKeyword: '', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_SHOP_CAMPAIGN_KEYWORD,

            /** Storefront Core - Set shop-specific currency to be used */
            currency: shop.currency, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CURRENCY

            /** Storefront Core - Checkout web component configuration */
            checkout: {
              shopId: shop.shopId, // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_SHOP_ID
              token: '', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_TOKEN
              secret: '', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_SECRET
              host: '', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_HOST
              user: '', // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_CHECKOUT_USER
              // The number of seconds that a CBD token should be considered valid since issued
              cbdExpiration: 60 * 60 * 2, // 2 hours
            },

            /**
             * Storefront Core - Configure format for AppKey generation for baskets and wishlists
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/sessions#app-keys-for-baskets-and-wishlists
             */
            appKeys: DEFAULT_APP_KEYS,

            /**
             * Storefront Core - Additional Shop Data for Payment providers
             * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#additional-shop-data
             */
            paymentProviders: [
              'lastschrift',
              'visa',
              'mastercard',
              'discover',
              'diners',
              'ratepay',
              'klarna',
              'paypal',
            ], // Override: NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_PAYMENT_PROVIDERS,

            isDefault: shop.isDefault,

            requiresConsentManagement: shop.requiresConsentManagement,
          },
        }),
        {},
      ),
      /**
       * [OPTIONAL] Storefront Core - Internal cache behavior configurations
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#cache
       */
      cache: {
        auth: {
          username: '', // Override: NUXT_STOREFRONT_CACHE_AUTH_USERNAME
          password: '', // Override: NUXT_STOREFRONT_CACHE_AUTH_PASSWORD
        },
        enabled: true, // Override: NUXT_STOREFRONT_CACHE_ENABLED
      },
      /**
       * [OPTIONAL] Storefront Core - `with` Parameter
       * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#with-parameters
       */
      withParams, // Previous withParams keys are Overridable using prefix NUXT_PUBLIC_WITH_PARAMS_
    },
    // Following keys are Overridable using prefix NUXT_PUBLIC_
    public: {
      shopName: 'SCAYLE Storefront',
      storefront: {
        /**
         * Storefront Core - Internal logger configuration
         * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/configuration#logging
         */
        log: {
          name: 'scayle-storefront-application-nuxt', // Override: NUXT_PUBLIC_STOREFRONT_LOG_NAME
          level: 'debug', // Override: NUXT_PUBLIC_STOREFRONT_LOG_LEVEL
        },
        // Configure default lazy loading behavior for useRpc and derived composables
        rpcDefaultLazy: true,
      },

      cms: {
        host: process.env.NUXT_PUBLIC_CMS_HOST,
        accessToken: process.env.NUXT_PUBLIC_CMS_ACCESS_TOKEN,
        previewHost: process.env.NUXT_PUBLIC_CMS_PREVIEW_HOST,
        previewAccessToken: process.env.NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN,
        deliveryAccessToken: process.env.NUXT_PUBLIC_CMS_DELIVERY_ACCESS_TOKEN,
        space: process.env.NUXT_PUBLIC_CMS_SPACE,
        allowDrafts: stringToBoolean(process.env.NUXT_PUBLIC_CMS_ALLOW_DRAFTS),
        environment: process.env.NUXT_PUBLIC_CMS_ENVIRONMENT,
        region: process.env.NUXT_PUBLIC_CMS_REGION,
        branch: process.env.NUXT_PUBLIC_CMS_BRANCH,
        hubName: process.env.NUXT_PUBLIC_CMS_HUB_NAME,
        locale: process.env.NUXT_PUBLIC_CMS_LOCALE,
        // This object is a superset of every CMS provider's runtime config, but
        // the `cms` key is globally typed as the active provider's shape, so we
        // cast to satisfy it.
      } as RuntimeConfig['public']['cms'],

      // Override: NUXT_PUBLIC_CDN_URL
      cdnUrl: '',

      // Override: NUXT_PUBLIC_GOOGLE_MAPS_API_KEY
      googleMapsApiKey: '',

      // Override: NUXT_PUBLIC_USER_CENTRICS_APP_ID
      userCentricsAppId: '  ',

      appEnv: process.env.APP_ENV, // Override: NUXT_PUBLIC_APP_ENV,

      subscription: {
        overviewWebHost: '', // Override: NUXT_PUBLIC_SUBSCRIPTION_OVERVIEW_WEB_HOST
        cancellationWebHost: '', // Override: NUXT_PUBLIC_SUBSCRIPTION_OVERVIEW_WEB_HOST
        apiUrl: '', // Override: NUXT_PUBLIC_SUBSCRIPTION_API_URL
      },

      /**
       * nuxt-tracking Runtime Configuration
       * Used in `./modules/tracking/README.md`.
       */
      tracking: {
        gtm: {
          id: '', // Override: NUXT_PUBLIC_TRACKING_GTM_ID
          debug: false, // Override: NUXT_PUBLIC_TRACKING_GTM_DEBUG
        },
      },
    },
  },

  /**
   * NOTE: Configuration outside of runtimeConfig is being filled in during
   * build time and will be serialized as part of the bundling process.
   * Execution of functions, etc during runtime is not possible.
   */

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#app */
  app: {
    /** @see https://nuxt.com/docs/3.x/api/nuxt-config#head */
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
      ],
    },
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#css */
  css: ['~~/app/assets/css/main.css'],

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#postcss */
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  /** @see https://tailwindcss.nuxtjs.org/ */
  tailwindcss: {
    cssPath: '~~/app/assets/css/main.css',
    exposeConfig: true,
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#modules-1 */
  modules: [
    './modules/cms',
    '@scayle/storefront-nuxt/module',
    '@scayle/omnichannel-nuxt/module',
    '@nuxtjs/tailwindcss', // https://tailwindcss.nuxtjs.org/
    'nuxt-svgo', // https://github.com/cpsoinos/nuxt-svgo
    '@nuxt/fonts', // https://nuxt.com/modules/fonts
    '@nuxt/image', // https://image.nuxt.com/
    '@nuxtjs/i18n', // https://i18n.nuxtjs.org/
    '@vueuse/nuxt', // https://github.com/vueuse/vueuse/tree/main/packages/nuxt
    '@nuxt/test-utils/module', // https://nuxt.com/docs/getting-started/testing
    '@nuxt/eslint', // https://eslint.nuxt.com/packages/module
    '@scayle/nuxt-opentelemetry', // https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/open-telemetry
    '@scayle/storefront-country-detection', // https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/country-detection
    '@scayle/storefront-product-detail',
    '@scayle/storefront-product-listing',
    '@scayle/storefront-promotions',
    '@scayle/storefront-search',
    '@scayle/storefront-basket',
    '@scayle/storefront-navigation',
    '@scayle/nuxt-image-provider',
    // https://github.com/nuxt-modules/storybook/pull/994
    // '@nuxtjs/storybook',
    '@nuxt/scripts',
  ],

  // Storefront CMS Module (local)
  cms: {
    // @ts-expect-error provider here expects either `storyblok`, `contentful` or 'scayle' but the env variable is typed as string
    provider: process.env.CMS_PROVIDER ?? 'scayle',
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#build */
  build: {
    /** @see https://nuxt.com/docs/3.x/api/nuxt-config#transpile */
    transpile: ['@scayle/storefront-nuxt'],
  },

  // Storefront Buildtime Config
  storefront: {
    /**
     * Storefront Core - Custom RPC Methods
     * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/rpc-methods#overview
     */
    rpcMethodNames: Object.keys(customRpcMethods), // NOT OVERRIDABLE AT RUNTIME

    // RPC Methods from the Storefront Core which are overridden by the project.
    rpcMethodOverrides: [],
  },

  'storefront-ui': {
    breakpoints: {
      xs: BREAKPOINTS.xs,
      sm: BREAKPOINTS.sm,
      md: BREAKPOINTS.md,
      lg: BREAKPOINTS.lg,
      xl: BREAKPOINTS.xl,
    },
  },

  /** @see https://github.com/cpsoinos/nuxt-svgo/blob/main/README.md#usage */
  svgo: {
    autoImportPath: './assets/icons',
    defaultImport: 'component',
    componentPrefix: 'Icon',
    svgoConfig: {
      plugins: [
        'preset-default',
        'removeDimensions',
        'prefixIds',
        /** @see https://svgo.dev/docs/plugins/addAttributesToSVGElement/ */
        {
          name: 'addAttributesToSVGElement',
          params: {
            attributes: [{ 'aria-hidden': 'true' }],
          },
        },
        /** @see https://svgo.dev/docs/plugins/convertColors/ */
        {
          name: 'convertColors',
          params: {
            currentColor: '#171717',
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
            shortname: true,
          },
        },
      ],
    },
  },

  /** @see https://fonts.nuxt.com/get-started/installation#configuration */
  fonts: {
    assets: {
      // The baseURL where font files are served.
      prefix: '/_fonts/',
    },
    defaults: {
      weights: [400, 500, 600, 700],
      // Limits Google Fonts requests to the subsets we actually serve, reducing build-time
      // fetches to fonts.gstatic.com that can intermittently 404.
      subsets: ['latin', 'latin-ext'],
    },
  },

  /** @see https://image.nuxt.com/get-started/configuration */
  image: {
    /**
     * Custom provider setup for @nuxt/image module.
     *
     * @see https://image.nuxt.com/advanced/custom-provider
     */
    providers: {
      scayle: {
        name: 'scayle',
        provider: '@scayle/nuxt-image-provider',
      },
      contentstack: {
        name: 'contentstack',
        provider: './modules/cms/providers/contentstack/runtime/imageprovider',
      },
    },
    screens: {
      ...BREAKPOINTS,
    },
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#experimental */
  experimental: {
    /** @see https://nuxt.com/docs/3.x/api/nuxt-config#cookiestore */
    cookieStore: true,
    /**
     * Use `parcel` instead of `chokidar` to avoid watcher issues
     *
     * @see https://github.com/nuxt/nuxt/issues/30481
     * @see https://nuxt.com/docs/3.x/api/nuxt-config#watcher
     */
    watcher: 'parcel',
    /**
     * `@scayle/storefront-nuxt` still expects the old cached data behavior.
     * Until this is updated, we need to disable it to maintain the existing behavior.
     *
     * @see https://nuxt.com/docs/3.x/api/nuxt-config#granularcacheddata
     */
    granularCachedData: false,
  },

  /**
   * @see https://i18n.nuxtjs.org/docs/getting-started
   * @see https://i18n.nuxtjs.org/docs/guide/migrating#upgrading-from-nuxtjsi18n-v8x-to-v9x
   */
  i18n: {
    locales: locales,
    differentDomains: DOMAIN_PER_LOCALE,
    detectBrowserLanguage: false,
    defaultLocale: i18nDefaultLocale,
    strategy: getI18nStrategy(),
    experimental: {
      nitroContextDetection: false,
    },
  },

  opentelemetry: {
    enabled: stringToBoolean(process.env.OTEL_ENABLED),
    pathBlocklist: '^(/.*)?/api/up',
    pathReplace: [`^/(${locales.map((l) => l.code).join('|')})/`, '/:locale/'],
    requestHeaders: [
      'x-shop-id',
      'content-type',
      'content-length',
      'accept',
      'referer',
      'host',
    ],
    responseHeaders: ['content-type', 'content-length'],
  },

  /** @see https://nuxt.com/docs/api/nuxt-config#imports */
  imports: {
    /** @see https://nuxt.com/docs/4.x/guide/concepts/auto-imports#disabling-auto-imports */
    autoImport: false,
    dirs: [],
    scan: false,
  },

  vueuse: {
    autoImports: false,
  },

  components: {
    dirs: [],
    global: false,
  },

  /** @see https://nuxt.com/docs/api/nuxt-config#vue-1 */
  vue: {
    /** @see https://nuxt.com/docs/3.x/api/nuxt-config#compileroptions-1 */
    compilerOptions: {
      isCustomElement: (tag) =>
        [
          'scayle-checkout',
          'scayle-express-checkout',
          'scayle-auth',
          'scayle-auth-new-password',
        ].includes(tag),
    },
  },

  /** @see https://nuxt.com/docs/api/nuxt-config#devserver */
  devServer: {
    /** @see https://nuxt.com/docs/api/nuxt-config#https */
    https:
      !process.env.HTTPS_KEY || !process.env.HTTPS_CERT
        ? false
        : {
            key: process.env.HTTPS_KEY,
            cert: process.env.HTTPS_CERT,
          },
  },

  /** @see https://nuxt.com/docs/api/nuxt-config#ignore */
  ignore: [
    '.DS_Store',
    '**/.changeset',
    '**/playwright',
    '**/docs',
    '**/test',
    '**/modules/cms/providers/contentful/types/gen',
  ],

  /**
   * Page Caching
   * @see https://nuxt.com/docs/api/nuxt-config#routerules-1
   * @see https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering
   * @see https://nitro.unjs.io/guide/cache#route-rules
   */
  routeRules: (() => {
    // Allow for disabling the SSR Cache via an environment flag
    if (stringToBoolean(process.env.PAGE_CACHE_DISABLED)) {
      return {}
    }

    /**
     * @note ISR currently leads to some bugs in the Nitro caching implementation
     * On server-side, the query params are not passed.
     * Thats why some pages will have hydration errors on initially set query params in the URL.
     *
     * @see https://github.com/nitrojs/nitro/issues/1880
     */
    const CACHE_PAGE: NitroRouteConfig = {
      isr: false,
      cache: {
        maxAge: 10 * 60, // Default: 10min
        swr: false,
        headersOnly: true,
      },
    }

    const NO_CACHE: NitroRouteConfig = isVercel
      ? { isr: false, cache: false }
      : { swr: false, cache: false }

    // Default routeRules for using SWR and `storefront-cache` storage for page caching setup
    return DOMAIN_PER_LOCALE
      ? {
          // Cache most pages by default
          '/**': CACHE_PAGE,
          // Don't cache API routes.
          '/api/**': NO_CACHE,
          // Don't cache pages with user-specific information
          '/wishlist': NO_CACHE,
          '/basket': NO_CACHE,
          '/checkout': NO_CACHE,
          '/signin': NO_CACHE,
          '/signin/callback': NO_CACHE,
          '/account': NO_CACHE,
          '/account/**': NO_CACHE,
        }
      : locales.reduce(
          (rules: NitroRouteRules, locale) => {
            const newRules: NitroRouteRules = {
              ...rules,
              [`/${locale.code}`]: CACHE_PAGE, // home page
              [`/${locale.code}/**`]: CACHE_PAGE, // other pages
              // Don't cache API routes.
              [`/${locale.code}/api/**`]: NO_CACHE,
              // Don't cache pages with user-specific information
              [`/${locale.code}/wishlist`]: NO_CACHE,
              [`/${locale.code}/basket`]: NO_CACHE,
              [`/${locale.code}/checkout`]: NO_CACHE,
              [`/${locale.code}/signin`]: NO_CACHE,
              [`/${locale.code}/signin/callback`]: NO_CACHE,
              [`/${locale.code}/account`]: NO_CACHE,
              [`/${locale.code}/account/**`]: NO_CACHE,
            }
            return newRules
          },
          {
            // Cache most pages by default
            '/**': CACHE_PAGE,
            // Don't cache API routes.
            '/api/**': NO_CACHE,
            // Don't cache pages with user-specific information
            '/wishlist': NO_CACHE,
            '/basket': NO_CACHE,
            '/checkout': NO_CACHE,
            '/signin': NO_CACHE,
            '/signin/callback': NO_CACHE,
            '/account': NO_CACHE,
            '/account/**': NO_CACHE,
          },
        )
  })(),

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#vite */
  vite: {
    resolve: {
      /**
       * The production build does not work when linking (dev mode is fine)
       * This workaround resolves the issue:
       * @see https://github.com/vitejs/vite/issues/11657#issuecomment-1385932066
       */
      preserveSymlinks: true,
      /**
       * Ensures that the package version of the Storefront Application will always be used
       * instead of potential nested dependencies within the packages.
       */
      dedupe: ['nuxt', '@nuxt/kit', '@nuxt/schema'],
      alias: {
        // `@contentstack/core` default-imports the CommonJS `lodash` package, which Vite's
        // dev server can't serve directly (no synthetic default export for the browser's
        // native ESM loader). Redirecting to the ESM `lodash-es` build fixes the dev-mode
        // crash and lets the bundler tree-shake to only what's used. Same fix as the
        // Storefront Application V3 boilerplate, see .changeset/lodash-es-alias.md.
        lodash: 'lodash-es',
        // Force tslib's ESM entry. Its `main` is the CommonJS UMD build, which
        // Rollup wraps in a minified CommonJS helper that mishandles the UMD
        // factory, crashing the production server with "Cannot destructure
        // property '__extends'".
        tslib: 'tslib/tslib.es6.mjs',
      },
    },
    ssr: {
      // Contentstack-specific test-mode noExternal entries are added in
      // modules/cms/providers/contentstack/setup.ts.
      noExternal:
        process.env.NODE_ENV === 'test' || process.env.VITEST ? [] : true,
    },
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#hooks */
  hooks: {
    'nitro:config'(nitroConfig) {
      /**
       * Override the root devStorage to use the fs-lite driver which does not depend on chokidar
       * This is a workaround to avoid excessive file handlers
       *
       * @see https://github.com/nuxt/nuxt/issues/30481
       */
      nitroConfig.devStorage ??= {}
      nitroConfig.devStorage['root'] = {
        driver: 'fs-lite',
        readOnly: true,
        base: nitroConfig.rootDir,
      }
    },
    'nitro:init'(nitro) {
      // This hook enables build-time configuration logging, controlled by the feature flag CONFIG_LOG_BUILD_ENABLED.
      if (stringToBoolean(process.env.CONFIG_LOG_BUILD_ENABLED)) {
        const configToPrint = stringToBoolean(
          process.env.CONFIG_LOG_PRETTIER_ENABLED,
        )
          ? JSON.stringify(nitro.options.runtimeConfig, null, 2)
          : JSON.stringify(nitro.options.runtimeConfig)

        console.log(
          '[storefront-boilerplate] runtimeConfig after nitro initialization:',
          configToPrint,
        )
      }
    },
  },

  /** @see https://nitro.build/config#general */
  nitro: {
    /** @see https://nitro.build/config#vercel */
    vercel: {
      functions: {
        // Default to the latest Node LTS
        runtime: 'nodejs22.x',
      },
    },
  },

  /** @see https://nuxt.com/docs/3.x/api/nuxt-config#optimization */
  optimization: {
    keyedComposables: [
      { name: 'useProductDetails', argumentLength: 1 },
      { name: 'useOrders', argumentLength: 1 },
      { name: 'usePromotionGifts', argumentLength: 2 },
      { name: 'useSubscription', argumentLength: 4 },
    ],
  },

  /** @see https://nuxt.com/docs/4.x/getting-started/testing#typescript-support-in-tests */
  typescript: {
    tsConfig: {
      include: ['../test/**/*', '../.storybook/**/*'],
    },
  },
})
