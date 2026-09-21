export type FilterCond =
  | { field: string; op: "exists" }
  | { field: string; op: "in" | "between"; values: (string | number)[] }
  | { field: string; op: "eq" | "cidr" | "glob" | "gte" | "lte"; value: string | number };

export type RootFilter = {
  all: FilterCond[];
};

export type SearchFormSubmitValues = {
  sensorIds: string[];
  from: string;
  to: string;
  filter: RootFilter;
};
