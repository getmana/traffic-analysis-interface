"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";


import { Button } from "@/components/ui";
import { buildFilterCond, searchFormSchema, type SearchFormValues } from "@/components/forms/search-form/search-filter/search-filter";
import type { BackendFieldDef, BackendSensor, SearchFormSubmitValues } from "@/types";

import { CapturePointPicker, ConditionRow, DataSection, TimeWindowFields } from "./components";
import { loadItems } from './utils/load-items';

type SearchFormProps = {
  onSubmit?: (values: SearchFormSubmitValues) => void | Promise<void>;
};

export function SearchForm({ onSubmit }: SearchFormProps) {
  const [sensors, setSensors] = useState<BackendSensor[] | null>(null);
  const [sensorsError, setSensorsError] = useState<string | null>(null);
  const [sensorsAuthError, setSensorsAuthError] = useState(false);

  const [fields, setFields] = useState<BackendFieldDef[] | null>(null);
  const [fieldsError, setFieldsError] = useState<string | null>(null);
  const [fieldsAuthError, setFieldsAuthError] = useState(false);

  const loadSensors = useCallback(async () => {
    setSensorsError(null);
    const result = await loadItems<BackendSensor>("/api/sensors");
    setSensors(result.items);
    setSensorsError(result.error);
    setSensorsAuthError(result.authError);
  }, []);

  const loadFields = useCallback(async () => {
    setFieldsError(null);
    const result = await loadItems<BackendFieldDef>("/api/meta/fields");
    setFields(result.items);
    setFieldsError(result.error);
    setFieldsAuthError(result.authError);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadItems<BackendSensor>("/api/sensors");
      if (!cancelled) {
        setSensors(result.items);
        setSensorsError(result.error);
        setSensorsAuthError(result.authError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadItems<BackendFieldDef>("/api/meta/fields");
      if (!cancelled) {
        setFields(result.items);
        setFieldsError(result.error);
        setFieldsAuthError(result.authError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { sensorIds: [], from: "", to: "", conditions: [] },
  });
  const { fields: rows, append, remove } = useFieldArray({ control, name: "conditions" });

  const submit = handleSubmit(async (values) => {
    const payload: SearchFormSubmitValues = {
      sensorIds: values.sensorIds,
      from: new Date(values.from).toISOString(),
      to: new Date(values.to).toISOString(),
      filter: { all: values.conditions.map((row) => buildFilterCond(row, fields ?? [])) },
    };
    if (onSubmit) {
      await onSubmit(payload);
      return;
    }
    console.log("TODO: wire POST /v1/searches", payload);
  });

  const ready = sensors !== null && fields !== null;

  return (
    <form onSubmit={submit} noValidate className="mt-6 flex max-w-3xl flex-col gap-4">
      {sensors === null ? (
        <DataSection error={sensorsError} authError={sensorsAuthError} onRetry={loadSensors} label="capture points" />
      ) : (
        <CapturePointPicker control={control} sensors={sensors} />
      )}

      <TimeWindowFields register={register} errors={errors} />

      {fields === null ? (
        <DataSection error={fieldsError} authError={fieldsAuthError} onRetry={loadFields} label="fields" />
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Conditions</span>
          {rows.map((row, index) => (
            <ConditionRow
              key={row.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              remove={remove}
              fieldDefs={fields}
              rowErrors={errors.conditions?.[index]}
            />
          ))}
          {errors.conditions?.message && (
            <p role="alert" className="text-sm text-destructive">
              {errors.conditions.message}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ field: "", op: "", value: "", valuesText: "" })}
          >
            Add condition
          </Button>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || !ready} className="mt-2 self-start">
        Search
      </Button>
    </form>
  );
}


