type Translate = (
  key: string,
  replacements?: Record<string, string | number>,
) => string;

export type ErrorContext =
  | "admin.renewals"
  | "auth.login"
  | "auth.signup"
  | "auth.profile"
  | "auth.resetRequest"
  | "auth.resetLink"
  | "auth.updatePassword"
  | "image.compress"
  | "image.upload"
  | "order.create"
  | "order.load"
  | "order.update"
  | "product.delete"
  | "product.load"
  | "product.publicLoad"
  | "product.save"
  | "settings.customerInfo"
  | "settings.password"
  | "settings.save"
  | "settings.slug"
  | "setup.check"
  | "setup.create"
  | "setup.slug"
  | "store.load";

const contextFallbacks: Record<ErrorContext, string> = {
  "admin.renewals": "errors.admin.loadFailed",
  "auth.login": "errors.auth.invalidCredentials",
  "auth.signup": "errors.auth.signupFailed",
  "auth.profile": "errors.setup.checkFailed",
  "auth.resetRequest": "errors.auth.resetFailed",
  "auth.resetLink": "errors.auth.invalidReset",
  "auth.updatePassword": "errors.auth.passwordUpdateFailed",
  "image.compress": "errors.image.invalid",
  "image.upload": "errors.image.uploadFailed",
  "order.create": "errors.order.createFailed",
  "order.load": "errors.order.loadFailed",
  "order.update": "errors.order.updateFailed",
  "product.delete": "errors.product.deleteFailed",
  "product.load": "errors.product.loadFailed",
  "product.publicLoad": "errors.product.publicLoadFailed",
  "product.save": "errors.product.saveFailed",
  "settings.customerInfo": "errors.settings.customerInfoFailed",
  "settings.password": "errors.auth.passwordUpdateFailed",
  "settings.save": "errors.settings.saveFailed",
  "settings.slug": "errors.setup.slugCheckFailed",
  "setup.check": "errors.setup.checkFailed",
  "setup.create": "errors.setup.createFailed",
  "setup.slug": "errors.setup.slugCheckFailed",
  "store.load": "errors.store.loadFailed",
};

function readErrorValue(error: unknown, key: "message" | "code" | "status") {
  if (!error || typeof error !== "object") {
    return "";
  }

  const value = (error as Record<string, unknown>)[key];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

export function getUserFacingError(
  error: unknown,
  context: ErrorContext,
  t: Translate,
) {
  const message = readErrorValue(error, "message").toLowerCase();
  const code = readErrorValue(error, "code").toLowerCase();
  const status = readErrorValue(error, "status");
  const combined = `${message} ${code} ${status}`;

  if (
    combined.includes("failed to fetch") ||
    combined.includes("network") ||
    combined.includes("fetch failed") ||
    combined.includes("load failed") ||
    combined.includes("timeout")
  ) {
    return t("errors.network");
  }

  if (context === "auth.login") {
    return t("errors.auth.invalidCredentials");
  }

  if (
    context === "auth.signup" &&
    (combined.includes("already") ||
      combined.includes("registered") ||
      combined.includes("user_already_exists"))
  ) {
    return t("errors.auth.emailExists");
  }

  if (
    context === "order.create" &&
    (combined.includes("out of stock") ||
      combined.includes("unavailable") ||
      combined.includes("currently unavailable"))
  ) {
    return t("errors.order.outOfStock");
  }

  return t(contextFallbacks[context] ?? "errors.generic");
}
