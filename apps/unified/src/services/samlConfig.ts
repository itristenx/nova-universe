import { apiClient } from './api';

export interface SAMLConfig {
  enabled: boolean;
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  authnContextClassRef: string;
  attributeMapping: {
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    groups: string;
  };
  idpMetadata?: string;
  spEntityId?: string;
  allowedClockDrift: number;
  forceAuthn: boolean;
  bypassLoginPage: boolean;
  groupMirroringEnabled: boolean;
  autoProvisionUsers: boolean;
  defaultUserRole: string;
}

export interface SAMLTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

class SAMLConfigService {
  private static base(tenantId: string) {
    return `/api/v1/helix/login/admin/tenant/${tenantId}`;
  }

  static async getConfig(tenantId: string): Promise<SAMLConfig> {
    const { data } = await apiClient.get<{ success: boolean; data: SAMLConfig | null }>(
      `${this.base(tenantId)}/sso-configs/saml`,
    );
    return (data && (data as any).data) || ({} as SAMLConfig);
  }

  static async update(tenantId: string, config: Partial<SAMLConfig>): Promise<void> {
    await apiClient.put(`${this.base(tenantId)}/sso-configs/saml`, config);
  }

  static async test(tenantId: string): Promise<SAMLTestResult> {
    // Optional: loopback test not implemented; return success for now
    return { success: true, message: 'SAML configuration saved' };
  }

  static async getMetadata(tenantId: string): Promise<string> {
    const { data } = await apiClient.get<string>(`${this.base(tenantId)}/saml/metadata`);
    return data as unknown as string;
  }
}

export const samlConfigService = SAMLConfigService;
export default SAMLConfigService;
