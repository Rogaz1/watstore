import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { Locale } from "../i18n/messages";

export type PhoneCountryCode = CountryCode;

export type CountryOption = {
  code: PhoneCountryCode;
  name: string;
  callingCode: string;
  flag: string;
};

export const fallbackCountry: PhoneCountryCode = "GH";

function countryFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

export function normalizeCountryCode(value: string | null | undefined) {
  const upperValue = (value ?? "").toUpperCase();
  return getCountries().includes(upperValue as PhoneCountryCode)
    ? (upperValue as PhoneCountryCode)
    : fallbackCountry;
}

export function getCountryOptions(locale: Locale): CountryOption[] {
  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames([locale], { type: "region" })
      : null;

  return getCountries()
    .map((code) => ({
      code,
      name: displayNames?.of(code) ?? code,
      callingCode: `+${getCountryCallingCode(code)}`,
      flag: countryFlag(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export function parsePhoneInput(
  value: string,
  defaultCountry: string | null | undefined,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return parsePhoneNumberFromString(
    trimmed,
    normalizeCountryCode(defaultCountry),
  );
}

export function normalizePhoneNumber(
  value: string,
  defaultCountry: string | null | undefined,
) {
  const parsed = parsePhoneInput(value, defaultCountry);

  if (!parsed || !parsed.isValid()) {
    return null;
  }

  return {
    e164: parsed.number,
    country: parsed.country ?? normalizeCountryCode(defaultCountry),
    national: parsed.formatNational(),
  };
}

export function deriveCountryFromPhone(
  value: string | null | undefined,
  fallback: string | null | undefined,
) {
  if (value) {
    const parsed = parsePhoneNumberFromString(value);

    if (parsed?.country) {
      return parsed.country;
    }
  }

  return normalizeCountryCode(fallback);
}
