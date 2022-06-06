/**
 * Basic operations with the ./integrations folder
 * to get or list the integrations within that folder.
 */

import fs from 'fs'
import path from 'path'
import { Types } from '../../types'

const integrationsDir = path.join(__dirname, '../../../', 'integrations')

let latestList: Types.Integration[]

/**
 * List all integrations within the folder
 * @returns an array of the integration configurations.
 */
export const list = async (): Promise<Types.Integration[]> => {
  let integrationsFiles = await fs.promises.readdir(integrationsDir).catch(err => {
    console.error(`Error occurred when trying to readdir ${integrationsDir}:`, err)
    return Promise.reject('Unable to access integrations directory.')
  })

  let integrations = await Promise.all(integrationsFiles.map(async (file) => {
    if (file === 'index.js') return null

    let fileNameParts = file.split('.')
    let fileExtension = fileNameParts.pop()
    let fileWithoutExtension = fileNameParts.join('.')
    if (!fileExtension || !['json', 'js'].includes(fileExtension.toLowerCase())) {
      console.warn(`Skipping ${file} integration file: unsupported extension ${fileExtension}`)
      return null
    }
    let fileContent = await import(path.join(integrationsDir, file))
    let integrations = fileExtension === 'json' ? [fileContent] : Object.values(fileContent) as any[]
    console.warn(file, integrations)
    return integrations.map(integration => {
      try {
        return normalizeIntegration(fileWithoutExtension, integration)
      } catch (err) {
        console.error(`Skipping ${file} integration file: error occurred while loading:`, err)
        return null
      }
    })
  }))
  latestList = integrations.flat().filter(isNotNull)
  return latestList
}

let memo: { integrations: Types.Integration[], byId: Record<string, Types.Integration> }

/**
 * Retrieve a particular integration within the folder.
 * @param integrationId
 * @returns the integration configuration.
 */
export const get = async (integrationId: string): Promise<Types.Integration> => {
  if (!memo || memo.integrations !== latestList) {
    let integrations = latestList || await list()
    let byId = integrations.reduce((memo, integration) => {
      if (memo[integration.id]) {
        console.error(`There are multiple integrations having id=${JSON.stringify(integration.id)}, the one we met first stays:`, memo[integration.id])
      } else {
        memo[integration.id] = integration
      }
      return memo
    }, {})
    memo = { integrations, byId }
  }

  let integration = memo.byId[integrationId]
  if (!integration) {
    throw new Error(`Cannot find integration having id=${JSON.stringify(integrationId)}, available ones are: ${JSON.stringify(Object.keys(memo.byId))}`)
  }
  return integration
}

const normalizeIntegration = (id: string, integration: Omit<Types.Integration, 'id' | 'image'> & Partial<Pick<Types.Integration, 'id' | 'image'>>): Types.Integration => {
  return {
    ...integration,
    id: integration.id ?? id,
    image: integration.image ?? `https://logo.clearbit.com/${integration.name.toLowerCase().replace(' ', '')}.com`,
    auth: {
      ...integration.auth,
      ...integration.auth.authType === 'OAUTH2'
        ? { setupKeyLabel: 'Client ID', setupSecretLabel: 'Client Secret' }
        : { setupKeyLabel: 'Consumer Key', setupSecretLabel: 'Consumer Secret' }
    }
  }
}

/**
 * Validation
 */

export const validateConfigurationScopes = (scopesAsString: string): string[] | null => {
  const scopes: string = ((String(scopesAsString) as string) || '').trim()

  return (scopes && scopes.split(/\r?\n/)) || null
}

export const validateConfigurationCredentials = (
  setup: { [key: string]: string } | undefined,
  integration: Types.Integration
): Types.OAuth1Credentials | Types.OAuth2Credentials | undefined => {
  if (!setup) {
    return
  }

  const authConfig = integration.auth
  const isOAuth2 = authConfig.authType == 'OAUTH2'
  const isOAuth1 = authConfig.authType == 'OAUTH1'

  if (isOAuth1) {
    const consumerKey = String(setup.consumerKey)
    const consumerSecret = String(setup.consumerSecret)

    if (consumerKey && consumerSecret) {
      return { consumerKey, consumerSecret }
    }
  } else if (isOAuth2) {
    const clientId = String(setup.clientId)
    const clientSecret = String(setup.clientSecret)

    if (clientId && clientSecret) {
      return { clientId, clientSecret }
    }
  }

  return
}

/*
  Helpers
*/

export function isOAuth2(integration: Types.Integration): integration is Types.Integration<Types.OAuth2Config> {
  return integration.auth.authType === 'OAUTH2'
}

export function isOAuth1(integration: Types.Integration): integration is Types.Integration<Types.OAuth1Config> {
  return integration.auth.authType === 'OAUTH1'
}

const isNotNull = <T>(value: T): value is (T extends null ? never : T) => value !== null
