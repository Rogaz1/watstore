const PRODUCTION_SITE_URL = "https://floxto.com";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getConfiguredSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;

  return configuredUrl ? trimTrailingSlash(configuredUrl) : "";
}

export function getClientSiteOrigin() {
  const configuredUrl = getConfiguredSiteUrl();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return PRODUCTION_SITE_URL;
}

export function getCanonicalSiteOrigin() {
  return getConfiguredSiteUrl() || PRODUCTION_SITE_URL;
}

export function buildAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getClientSiteOrigin()}${normalizedPath}`;
}
