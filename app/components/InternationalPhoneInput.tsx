"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { Locale } from "../i18n/messages";
import {
  deriveCountryFromPhone,
  getCountryOptions,
  normalizeCountryCode,
  normalizePhoneNumber,
  PhoneCountryCode,
} from "./phone";

type InternationalPhoneInputProps = {
  value: string;
  defaultCountry?: string | null;
  locale: Locale;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onCountryChange?: (country: PhoneCountryCode) => void;
  onValidityChange?: (isValid: boolean) => void;
};

export function InternationalPhoneInput({
  value,
  defaultCountry,
  locale,
  placeholder = "55 123 4567",
  required = false,
  onChange,
  onCountryChange,
  onValidityChange,
}: InternationalPhoneInputProps) {
  const initialCountry = deriveCountryFromPhone(value, defaultCountry);
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountryCode>(
    initialCountry,
  );
  const countries = useMemo(() => getCountryOptions(locale), [locale]);
  const selectedCountryOption = countries.find(
    (country) => country.code === selectedCountry,
  );

  function emitValue(nextValue: string, nextCountry = selectedCountry) {
    const normalized = normalizePhoneNumber(nextValue, nextCountry);
    onChange(normalized?.e164 ?? nextValue);
    onValidityChange?.(Boolean(normalized));
  }

  function handleCountryChange(nextCountryValue: string) {
    const nextCountry = normalizeCountryCode(nextCountryValue);
    setSelectedCountry(nextCountry);
    onCountryChange?.(nextCountry);
    emitValue(value, nextCountry);
  }

  return (
    <div className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-[#EDECEA] bg-[#F4F3F0] text-[#888888] transition focus-within:border-[#1A1A18] focus-within:ring-2 focus-within:ring-[#1A1A18]/10">
      <span className="flex h-full shrink-0 items-center gap-2 border-r border-[#EDECEA] px-3">
        <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
        <select
          className="max-w-[112px] bg-transparent text-xs font-bold text-[#1A1A18] outline-none"
          value={selectedCountry}
          onChange={(event) => handleCountryChange(event.target.value)}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name} {country.callingCode}
            </option>
          ))}
        </select>
      </span>
      <input
        className="h-full min-w-0 flex-1 basis-0 bg-transparent px-3 text-sm font-medium text-[#1A1A18] outline-none placeholder:text-[#888888]"
        inputMode="tel"
        placeholder={placeholder}
        required={required}
        value={value}
        onBlur={() => emitValue(value)}
        onChange={(event) => onChange(event.target.value)}
      />
      {selectedCountryOption ? (
        <span className="shrink-0 pr-3 text-xs font-bold text-[#888888]">
          {selectedCountryOption.callingCode}
        </span>
      ) : null}
    </div>
  );
}
