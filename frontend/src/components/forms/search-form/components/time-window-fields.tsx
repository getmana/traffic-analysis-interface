import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input, Label } from "@/components/ui";
import type { SearchFormValues } from "../search-filter/search-filter";

type TimeWindowFieldsProps = {
  register: UseFormRegister<SearchFormValues>;
  errors: FieldErrors<SearchFormValues>;
};

export function TimeWindowFields({ register, errors }: TimeWindowFieldsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="from">From</Label>
        <Input id="from" type="datetime-local" {...register("from")} />
        {errors.from && (
          <p role="alert" className="text-sm text-destructive">
            {errors.from.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="to">To</Label>
        <Input id="to" type="datetime-local" {...register("to")} />
        {errors.to && (
          <p role="alert" className="text-sm text-destructive">
            {errors.to.message}
          </p>
        )}
      </div>
    </div>
  );
}
