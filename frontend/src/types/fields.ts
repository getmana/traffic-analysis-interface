export type BackendFieldType =
  | "ip"
  | "cidr"
  | "port"
  | "number"
  | "bytes"
  | "string"
  | "enum"
  | "country"
  | "ja3"
  | "duration_ms"
  | "sensor";

export type BackendFilterOp = "eq" | "in" | "cidr" | "glob" | "gte" | "lte" | "between" | "exists";

export type BackendFieldDef = {
  name: string;
  label: string;
  type: BackendFieldType;
  operators: BackendFilterOp[];
  enum?: string[];
  enum_name?: string;
  pattern?: string;
  example: string;
};

export type BackendFieldList = {
  items: BackendFieldDef[];
};
