import { Types } from '../src/types.js'

export const oauth2 = <Types.Integration<Types.OAuth2Config>>{
  id: 'zenmoney',
  name: 'Zenmoney',
  image: 'https://zenmoney.ru/favicon.ico',
  auth: {
    authType: 'OAUTH2',
    authorizationMethod: 'body',
    authorizationParams: { 'response_type': 'code' },
    authorizationURL: 'https://api.zenmoney.ru/oauth2/authorize/',
    bodyFormat: 'json',
    config: { response_type: 'code', scope: [] },
    hint: 'hint goes here',
    provider: 'provider goes here',
    tokenParams: { grant_type: 'authorization_code' },
    tokenURL: 'https://api.zenmoney.ru/oauth2/token/'
  },
  request: {
    baseURL: 'https://api.zenmoney.ru/',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Pizzly',
      'Authorization': 'Bearer ${auth.accessToken}'
    }
  }
}

export const oauth1 = <Types.Integration<Types.OAuth1Config>>{
  id: 'zenmoney-legacy',
  name: 'Zenmoney (legacy API)',
  image: 'https://zenmoney.ru/favicon.ico',
  auth: {
    authType: 'OAUTH1',
    authorizationParams: {},
    // authorizationParams: { 'response_type': 'code' },
    hint: 'hint goes here',
    provider: 'provider goes here',
    requestTokenURL: 'http://api.zenmoney.ru/oauth/request_token',
    accessTokenURL: 'http://api.zenmoney.ru/oauth/access_token',
    userAuthorizationURL: 'http://api.zenmoney.ru/access/',
    signatureMethod: 'HMAC-SHA1',
    config: {},
    // config: { response_type: 'code', scope: [] },
    tokenParams: {},
    // tokenParams: { grant_type: 'authorization_code' },
    callbackURL: 'http://api.zenmoney.ru/callback-url-wtf/'
  },
  request: {
    baseURL: 'https://zenmoney.ru/api/',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Pizzly',
      'Authorization': 'OAuth ${auth.oauth1}'
    }
  }
}
