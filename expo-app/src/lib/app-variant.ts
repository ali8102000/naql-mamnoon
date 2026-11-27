import Constants from "expo-constants";

export type MamnoonAppVariant = "customer" | "worker" | "driver" | "large_driver";

// Native builds may expose the embedded Expo manifest through different
// Constants fields depending on the runtime. Resolve the carrier identity from
// its immutable Android/iOS package as a final fallback so it can never fall
// through to the customer default and accidentally open the taxi flow.
const manifest2Extra = (Constants.manifest2 as any)?.extra?.expoClient?.extra;
const legacyExtra = (Constants.manifest as any)?.extra;
const configuredVariant =
  Constants.expoConfig?.extra?.appVariant ??
  manifest2Extra?.appVariant ??
  legacyExtra?.appVariant;
const packageName =
  Constants.expoConfig?.android?.package ??
  Constants.expoConfig?.ios?.bundleIdentifier ??
  (Constants.manifest2 as any)?.extra?.expoClient?.android?.package ??
  (Constants.manifest2 as any)?.extra?.expoClient?.ios?.bundleIdentifier ??
  (Constants.manifest as any)?.android?.package ??
  (Constants.manifest as any)?.ios?.bundleIdentifier;
const packageVariant: MamnoonAppVariant | null =
  packageName === "com.mamnoon.naql" ? "large_driver" : null;
const isKnownVariant = (value: unknown): value is MamnoonAppVariant =>
  value === "customer" || value === "worker" || value === "driver" || value === "large_driver";
export const APP_VARIANT: MamnoonAppVariant =
  packageVariant ?? (isKnownVariant(configuredVariant) ? configuredVariant : "customer");

export const REQUIRED_APP_ROLE = APP_VARIANT;

const privilegedRoles = new Set([
  "admin",
  "super_admin",
  "support",
  "finance",
  "moderator",
]);

export function isRoleAllowedInApp(role: string): boolean {
  return role === REQUIRED_APP_ROLE || privilegedRoles.has(role);
}

export function filterRolesForApp(roles: string[]): string[] {
  return roles.filter(isRoleAllowedInApp);
}

export function getInitialRoleForApp(roles: string[]): string | null {
  const allowed = filterRolesForApp(roles);
  if (allowed.includes(REQUIRED_APP_ROLE)) return REQUIRED_APP_ROLE;
  for (const role of ["super_admin", "admin", "support", "finance", "moderator"]) {
    if (allowed.includes(role)) return role;
  }
  return null;
}
