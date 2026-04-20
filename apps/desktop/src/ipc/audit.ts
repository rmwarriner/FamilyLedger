import { invoke } from '@tauri-apps/api/core';

export interface AuditIntegrityPayload {
  valid: boolean;
  checkedEvents: number;
  firstInvalidEventId: string | null;
}

export interface QueryAuditLogRequest {
  page?: number;
  pageSize?: number;
  tableName?: string;
  operation?: string;
}

export interface AuditLogEvent {
  id: string;
  occurredAt: string;
  userId: string;
  operation: string;
  tableName: string;
  recordId: string;
  beforeJson: string | null;
  afterJson: string | null;
  prevHash: string | null;
  thisHash: string;
}

export interface AuditLogPage {
  items: AuditLogEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export const verifyAuditIntegrity = async (): Promise<AuditIntegrityPayload> =>
  invoke<AuditIntegrityPayload>('verify_audit_integrity');

export const queryAuditLog = async (request: QueryAuditLogRequest): Promise<AuditLogPage> =>
  invoke<AuditLogPage>('query_audit_log', { request });
