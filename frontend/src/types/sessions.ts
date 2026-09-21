import type { BackendDecoderVersion } from "./sensors";
import type { BackendProtocolName, BackendSessionRow } from "./searches";

export type BackendSeverity = "low" | "medium" | "high";

export type BackendMitre = {
  technique_id: string;
  name: string;
};

export type BackendSessionDetection = {
  rule_id: string;
  rule: string;
  severity: BackendSeverity;
  mitre: BackendMitre;
};

export type BackendFileSource = "smtp_attachment" | "http_body";

export type BackendCarvedFile = {
  id: string;
  name: string;
  mime: string;
  size: number;
  sha256: string;
  source: BackendFileSource;
  purged: boolean;
};

export type BackendPcapUnavailableReason = "expired" | "not_captured";

export type BackendPcapInfo = {
  available: boolean;
  reason?: BackendPcapUnavailableReason;
  expired_at?: string;
};

export type BackendSession = BackendSessionRow & {
  decoded: Record<string, unknown>;
  detections: BackendSessionDetection[];
  files: BackendCarvedFile[];
  pcap: BackendPcapInfo;
};

export type BackendSchemaField = {
  path: string;
  title: string;
  type: string;
  unit?: string;
  sensitive?: boolean;
};

export type BackendProtocolSchema = {
  protocol: BackendProtocolName;
  decoder_versions: BackendDecoderVersion[];
  fields: BackendSchemaField[];
};
