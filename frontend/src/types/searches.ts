import type { BackendFilterOp } from "./fields";

export type BackendSearchState = "queued" | "running" | "done" | "failed" | "cancelled";
export type BackendSortKey = "ts" | "-ts" | "bytes" | "-bytes" | "risk" | "-risk";
export type BackendSearchWarningCode = "capture_gap" | "sensor_lagging";
export type BackendProtocolName = "dns" | "http" | "tls" | "smtp" | "smb2" | "ssh" | "ntp" | "tcp";
export type BackendTransport = "udp" | "tcp";
export type BackendRiskBand = "low" | "medium" | "high";

type Scalar = string | number | boolean;

/** Recursive filter tree: {all:[...]} | {any:[...]} | {not:...} | a leaf condition. */
export type BackendFilterNode =
  | { all: BackendFilterNode[] }
  | { any: BackendFilterNode[] }
  | { not: BackendFilterNode }
  | { field: string; op: BackendFilterOp; value?: Scalar; values?: Scalar[] };

export type BackendSearchCreate = {
  sensor_ids: string[];
  from: string;
  to: string;
  filter: BackendFilterNode;
  sort?: BackendSortKey;
};

export type BackendSearchProgress = {
  scanned_sessions: number;
  total_sessions_estimate: number;
  matched: number;
  matched_is_estimate: boolean;
  percent: number;
};

export type BackendSearchStats = {
  matched_bytes_up: number;
  matched_bytes_down: number;
};

export type BackendSearchWarning = {
  code: BackendSearchWarningCode;
  sensor_id: string;
  from?: string;
  to?: string;
  detail: string;
};

export type BackendSearch = {
  id: string;
  state: BackendSearchState;
  sensor_ids: string[];
  from: string;
  to: string;
  filter: BackendFilterNode;
  sort: BackendSortKey;
  created_at: string;
  finished_at?: string;
  progress: BackendSearchProgress;
  stats: BackendSearchStats;
  warnings: BackendSearchWarning[];
};

export type BackendEndpoint = {
  ip: string;
  port: number;
  host?: string;
  country?: string;
};

export type BackendByteCount = {
  up: number;
  down: number;
};

export type BackendRiskReason = {
  code: string;
  label: string;
  mitre?: string;
};

export type BackendRisk = {
  score: number;
  band: BackendRiskBand;
  reasons: BackendRiskReason[];
};

export type BackendIntel = {
  score: number;
  source: string;
};

export type BackendSessionRow = {
  id: string;
  sensor_id: string;
  start: string;
  end: string;
  duration_ms: number;
  protocol: BackendProtocolName;
  transport: BackendTransport;
  src: BackendEndpoint;
  dst: BackendEndpoint;
  bytes: BackendByteCount;
  packets: BackendByteCount;
  risk: BackendRisk;
  intel?: BackendIntel;
  summary: string;
  decoder: string;
  files_count: number;
  pcap_available: boolean;
};

export type BackendSearchResults = {
  items: BackendSessionRow[];
  next_cursor: string | null;
  complete: boolean;
  matched_so_far: number;
};
