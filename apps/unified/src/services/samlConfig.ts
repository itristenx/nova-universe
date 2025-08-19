import { apiClient } from './api'

export interface SAMLConfig {
  enabled: boolean
  entryPoint: string
  issuer: string
  callbackUrl: string
  cert: string
  signatureAlgorithm: string
  digestAlgorithm: string
  authnContextClassRef: string
  attributeMapping: {
    email: string
    displayName: string
    firstName: string
    lastName: string
    groups: string
  }
  idpMetadata?: string
  spEntityId?: string
  allowedClockDrift: number
  forceAuthn: boolean
  bypassLoginPage: boolean
  groupMirroringEnabled: boolean
  autoProvisionUsers: boolean
  defaultUserRole: string
}

export interface SAMLTestResult {
  success: boolean
  message: string
  details?: any
}

class SAMLConfigService {
  private static baseUrl = '/api/v1/admin/saml'

  static async getConfig(): Promise<SAMLConfig> {
    const { data } = await apiClient.get<SAMLConfig>(`${this.baseUrl}/config`)
    return data
  }

  static async update(config: SAMLConfig): Promise<void> {
    await apiClient.put(`${this.baseUrl}/config`, config)
  }

  static async test(): Promise<SAMLTestResult> {
    const { data } = await apiClient.post<SAMLTestResult>(`${this.baseUrl}/test`)
    return data
  }

  static async getMetadata(): Promise<string> {
    const { data } = await apiClient.get<string>(`${this.baseUrl}/metadata`)
    return data
  }
}

export const samlConfigService = SAMLConfigService
export default SAMLConfigService
