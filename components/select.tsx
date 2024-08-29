"use client";

import { useMemo } from "react";
import { SingleValue } from "react-select"
import CreatableSelect from "react-select/creatable"

type Props = {
  value?: string | null | undefined,
  options?: { label: string, value:string}[],
  disabled?: boolean,
  placeholder?:string
  onChange: (value?: string) => void,
  onCreate?: (value: string) => void,
}

export const Select = ({
  value,
  options = [],
  disabled,
  placeholder,
  onChange,
  onCreate
}: Props) => {
  const onSelect = (
    option: SingleValue<{ label: string, value: string }>
  ) => {
    onChange(option?.value)
  }

  const formattedValue = useMemo(() => {
    return options.find((option) => option.value === value)
  }, [options, value])

  //https://react-select.com/creatable
  //Allow to create new options that are not yet available.
  return (
    <CreatableSelect 
      placeholder={placeholder}
      className="text-sm h-10"
      styles={{
        control: (base) => ({
          ...base,
          // Override the base style.
          borderColor: "#e2e8f0",
          ":hover": {
            borderColor: "#e2e8f0"
          },
        })
      }}
      value={formattedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
    />
  )
}