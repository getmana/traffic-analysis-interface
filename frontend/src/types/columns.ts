export type BackendColumnDef = {
  key: string;
  label: string;
  type: string;
  default_visible: boolean;
  sortable: boolean;
  width_hint: number;
};

export type BackendColumnList = {
  items: BackendColumnDef[];
};
