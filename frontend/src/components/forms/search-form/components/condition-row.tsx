"use client";

import { useEffect, useRef } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { BackendFieldDef, BackendFilterOp } from "@/types";
import type { SearchFormValues } from "@/components/forms/search-form/search-filter/search-filter";

type ConditionRowProps = {
  index: number;
  control: Control<SearchFormValues>;
  register: UseFormRegister<SearchFormValues>;
  setValue: UseFormSetValue<SearchFormValues>;
  remove: (index: number) => void;
  fieldDefs: BackendFieldDef[];
  rowErrors: FieldErrors<SearchFormValues["conditions"][number]> | undefined;
};

const MULTI_VALUE_OPS = new Set<BackendFilterOp>(["in", "between"]);

export function ConditionRow({
  index,
  control,
  register,
  setValue,
  remove,
  fieldDefs,
  rowErrors,
}: ConditionRowProps) {
  const fieldName = useWatch({ control, name: `conditions.${index}.field` });
  const op = useWatch({ control, name: `conditions.${index}.op` });

  const fieldDef = fieldDefs.find((f) => f.name === fieldName);

  const previousField = useRef(fieldName);
  useEffect(() => {
    if (previousField.current !== fieldName) {
      previousField.current = fieldName;
      setValue(`conditions.${index}.op`, "");
      setValue(`conditions.${index}.value`, "");
      setValue(`conditions.${index}.valuesText`, "");
    }
  }, [fieldName, index, setValue]);

  const previousOp = useRef(op);
  useEffect(() => {
    if (previousOp.current !== op) {
      previousOp.current = op;
      setValue(`conditions.${index}.value`, "");
      setValue(`conditions.${index}.valuesText`, "");
    }
  }, [op, index, setValue]);

  const isMultiValue = MULTI_VALUE_OPS.has(op as BackendFilterOp);
  const isExists = op === "exists";
  const hasEnum = !!fieldDef?.enum?.length;

  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-input p-3">
      <div className="flex flex-col gap-1.5">
        <Label>Field</Label>
        <Controller
          control={control}
          name={`conditions.${index}.field`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fieldDefs.map((f) => (
                  <SelectItem key={f.name} value={f.name}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {rowErrors?.field && (
          <p role="alert" className="text-sm text-destructive">
            {rowErrors.field.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Operator</Label>
        <Controller
          control={control}
          name={`conditions.${index}.op`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!fieldDef}>
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {(fieldDef?.operators ?? []).map((operator) => (
                  <SelectItem key={operator} value={operator}>
                    {operator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {rowErrors?.op && (
          <p role="alert" className="text-sm text-destructive">
            {rowErrors.op.message}
          </p>
        )}
      </div>

      {!isExists && (
        <div className="flex flex-col gap-1.5">
          <Label>{isMultiValue ? "Values" : "Value"}</Label>
          {isMultiValue ? (
            <>
              <Input
                placeholder={op === "between" ? "e.g. 10,20" : "comma-separated values"}
                {...register(`conditions.${index}.valuesText`)}
              />
              {hasEnum && (
                <p className="text-sm text-muted-foreground">Allowed: {fieldDef!.enum!.join(", ")}</p>
              )}
            </>
          ) : hasEnum ? (
            <Controller
              control={control}
              name={`conditions.${index}.value`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldDef!.enum!.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <Input placeholder={fieldDef?.example} {...register(`conditions.${index}.value`)} />
          )}
          {(rowErrors?.value ?? rowErrors?.valuesText) && (
            <p role="alert" className="text-sm text-destructive">
              {rowErrors?.value?.message ?? rowErrors?.valuesText?.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="mt-6"
        onClick={() => remove(index)}
        aria-label="Remove condition"
      >
        ×
      </Button>
    </div>
  );
}
