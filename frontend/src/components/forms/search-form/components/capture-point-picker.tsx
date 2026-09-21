"use client";

import { useController, type Control } from "react-hook-form";

import { Checkbox, Label } from "@/components/ui";
import type { BackendSensor } from "@/types";
import type { SearchFormValues } from "@/components/forms/search-form/search-filter/search-filter";

const MAX_SENSORS = 5;

type CapturePointPickerProps = {
  control: Control<SearchFormValues>;
  sensors: BackendSensor[];
};

export function CapturePointPicker({ control, sensors }: CapturePointPickerProps) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "sensorIds", control });

  const selected = field.value;

  function toggle(id: string) {
    if (selected.includes(id)) {
      field.onChange(selected.filter((sensorId) => sensorId !== id));
    } else {
      field.onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Capture points</span>
        <span className="text-sm text-muted-foreground">
          {selected.length}/{MAX_SENSORS} selected
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-input p-3">
        {sensors.map((sensor) => {
          const checked = selected.includes(sensor.id);
          const disabled = !checked && selected.length >= MAX_SENSORS;
          return (
            <div key={sensor.id} className="flex items-center gap-2">
              <Checkbox
                id={`sensor-${sensor.id}`}
                checked={checked}
                disabled={disabled}
                onCheckedChange={() => toggle(sensor.id)}
              />
              <Label htmlFor={`sensor-${sensor.id}`} className="flex-1 font-normal">
                {sensor.name}
                <span className="ml-1.5 text-muted-foreground">
                  ({sensor.site}, {sensor.status})
                </span>
              </Label>
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
