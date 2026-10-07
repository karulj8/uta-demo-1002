import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixtures'
import { getUserForBrowser, isMobile } from '../../support/utils'
import {
  USER_ACCOUNT,
  TEST_USERS,
  LOGIN_REGISTRATION,
} from '../../support/constants'

/**
 * @file Contains end-to-end tests for the user account area functionality.
 * This suite verifies account page navigation, user data updates, and password management.
 */

test.describe('Account area', () => {
  /**
   * Global setup hook for the Account E2E test suite.
   * Performs user authentication before each test to ensure a logged-in state.
   * To avoid conflicts in parallel execution, each browser project is assigned a dedicated test user.
   * Check `/playwright/support/utils.ts` to get the details on how the test users are defined.
   *
   * @description
   * The login process involves visiting the homepage, closing any country detector modals,
   * and authenticating the user directly via RPC (Remote Procedure Call) using credentials
   * obtained from environment variables (mapped per browser project). This bypasses the UI
   * login flow for faster test setup.
   */
  test.beforeEach(
    async ({ page, countryDetector, homePage, accountPage }, testInfo) => {
      const projectName = testInfo.project.name
      const { email, password } = getUserForBrowser(projectName)

      await homePage.navigate(page, '/', 'networkidle')
      await countryDetector.closeModal()
      await accountPage.userAuthentication(email, password)
      await homePage.navigate(page, '/account', 'networkidle')
    },
  )

  /**
   * Verifies that the Orders tab is loaded by default upon navigating to the Account area.
   * Verifies that the Orders tab has the 'aria-current' attribute set to 'page' and that the URL contains the orders route.
   * It then proceeds to verify the loading of the Subscriptions and Profile pages by clicking their respective tabs.
   */
  test('C2188614 C2188628 Verify Account area landing page', async ({
    accountPage,
    page,
  }) => {
    await test.step('Verify Orders tab is loaded by default', async () => {
      await accountPage.accountTabOrders.waitFor()

      await expect(accountPage.accountTabOrders).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(page.url()).toContain(USER_ACCOUNT.routeOrders)
    })

    await test.step('Verify Subscription page is loaded', async () => {
      await accountPage.accountTabSubscriptions.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(accountPage.accountTabSubscriptions).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(page.url()).toContain(USER_ACCOUNT.routeSubscriptions)
    })

    await test.step('Verify Profile page is loaded', async () => {
      await accountPage.accountTabProfile.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(accountPage.accountTabProfile).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(page.url()).toContain(USER_ACCOUNT.routeProfile)
      await expect(accountPage.userProfileHeadline).toBeVisible()
      await expect(accountPage.accountInfoHeadline).toBeVisible()
      await expect(accountPage.personalInfoHeadline).toBeVisible()
      await expect(accountPage.passwordHeadline).toBeVisible()
    })
  })

  /**
   * Verifies the process of updating user personal data with both
   * correct and incorrect input formats for the birth date, asserting
   * success messages or validation errors accordingly.
   */
  test('C2190952 Verify Account user data update', async ({
    accountPage,
    toastMessage,
    page,
  }) => {
    await test.step('Update user data - correct input format', async () => {
      await accountPage.accountTabProfile.click()
      await page.waitForLoadState('domcontentloaded')
      await accountPage.selectGender('f')
      await accountPage.updateUserData(
        USER_ACCOUNT.userFirstName,
        USER_ACCOUNT.userLastName,
        USER_ACCOUNT.userBirthDateCorrect,
        true,
      )
      await toastMessage.assertToastInfoIsVisible()
    })

    await test.step('Update user data - incorrect birth date input format', async () => {
      await accountPage.updateUserData(
        USER_ACCOUNT.userFirstName,
        USER_ACCOUNT.userLastName,
        USER_ACCOUNT.userBirthDateIncorrect,
        false,
      )
      await expect(accountPage.birthdateValidationLabel).toBeVisible()
      await expect(accountPage.formSaveButton).not.toBeEnabled()
    })
  })

  /**
   * Verifies the password update process, including successful updates
   * with correct credentials and the display of error messages for incorrect
   * current passwords.
   */
  test('C2188629 Verify Account password update', async ({
    accountPage,
    toastMessage,
    page,
  }) => {
    await test.step('Update password - correct format and matching passwords', async () => {
      await accountPage.accountTabProfile.click()
      await page.waitForLoadState('domcontentloaded')
      await accountPage.updatePassword(
        TEST_USERS.testUserPassword,
        TEST_USERS.testUserPassword,
        true,
      )
      await toastMessage.assertToastInfoIsVisible()
      await toastMessage.clickToastMessageButton()
    })

    await test.step('Update password - incorrect current password', async () => {
      await accountPage.updatePassword(
        USER_ACCOUNT.nonMatchingPassword,
        TEST_USERS.testUserPassword,
        true,
      )
      await accountPage.passwordErrorMessage.waitFor()
      await expect(accountPage.passwordErrorMessage).toBeVisible()
    })
  })
})

/**
 * Verifies the header user profile flyout for guest and logged-in users (desktop only).
 * As a guest, hover shows login and register links. After logging in via the flyout,
 * the greeting with the user first name is displayed in the flyout.
 */
test.describe('User account flyout', () => {
  test.beforeEach(async ({ page, countryDetector, homePage }) => {
    await homePage.navigate(page, '/', 'networkidle')
    await countryDetector.closeModal()
  })

  test('C2352417 Verify User Account Flyout', async ({
    page,
    header,
    signinPage,
    homePage,
    countryDetector,
  }, testInfo) => {
    test.skip(isMobile(page), 'Test only for desktop browsers')

    const { email, password } = getUserForBrowser(testInfo.project.name)

    await test.step('As non-logged-in user, hover user link and assert login/register visible', async () => {
      await header.headerLoginButton.hover()
      await header.userFlyoutLoginLink.waitFor()
      await header.userFlyoutRegisterLink.waitFor()
      await expect(header.userFlyoutLoginLink).toBeVisible()
      await expect(header.userFlyoutRegisterLink).toBeVisible()
      await expect(header.userFlyoutRegisterLink).toHaveAttribute(
        'href',
        expect.stringContaining(`signin?${LOGIN_REGISTRATION.regUrlParam}`),
      )
    })

    await test.step('Click login and assert signin route with redirectUrl', async () => {
      await header.userFlyoutLoginLink.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)

      expect(page.url()).toContain('/signin')
      expect(page.url()).toContain('redirectUrl')
    })

    await test.step('Log in as test user and assert greeting in flyout', async () => {
      await signinPage.fillLoginData(email, password)
      await signinPage.clickLoginButton()
      await page.waitForURL((url) => !url.pathname.includes('/signin'), {
        timeout: 15000,
      })
      await homePage.navigate(page, '/', 'networkidle')
      await countryDetector.closeModal()

      const greeting = header.userFlyoutGreetingFirstname
      await expect(async () => {
        await header.headerLoginButton.hover()
        await expect(greeting).toBeVisible({ timeout: 8000 })
      }).toPass({ timeout: 25000 })
      await expect(header.userFlyoutGreetingFirstname).toContainText(
        USER_ACCOUNT.userFirstName,
      )

      await test.step('Assert user flyout has links to profile, orders, subscriptions', async () => {
        await expect(header.userFlyoutProfileLink).toBeVisible()
        await expect(header.userFlyoutProfileLink).toHaveAttribute(
          'href',
          expect.stringContaining('/account/profile'),
        )
        await expect(header.userFlyoutOrdersLink).toBeVisible()
        await expect(header.userFlyoutOrdersLink).toHaveAttribute(
          'href',
          expect.stringContaining('/account/orders'),
        )
        await expect(header.userFlyoutSubscriptionsLink).toBeVisible()
        await expect(header.userFlyoutSubscriptionsLink).toHaveAttribute(
          'href',
          expect.stringContaining('/account/subscriptions'),
        )
      })

      await test.step('Click logout and assert user is logged out', async () => {
        await header.userFlyoutLogoutButton.click()
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(1000)
        await header.headerLoginButton.hover()
        await expect(header.userFlyoutLoginLink).toBeVisible()
        await expect(header.userFlyoutRegisterLink).toBeVisible()
      })
    })
  })
})
