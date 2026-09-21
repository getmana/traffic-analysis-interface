export type BackendSensorKind = "tap" | "span" | "import";
export type BackendSensorStatus = "online" | "lagging" | "offline";
export type BackendDecoderVersion = "v1" | "v2";

export type BackendSensorRetention = {
  metadata_days: number;
  pcap_hours: number;
  files_days: number;
};

export type BackendSensor = {
  id: string;
  name: string;
  site: string;
  kind: BackendSensorKind;
  status: BackendSensorStatus;
  decoder_version: BackendDecoderVersion;
  tz: string;
  retention: BackendSensorRetention;
  last_packet_at: string;
  lag_seconds: number;
  last_packet_local: string;
};

export type BackendSensorList = {
  items: BackendSensor[];
};
