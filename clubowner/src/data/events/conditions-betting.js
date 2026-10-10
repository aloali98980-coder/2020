// بوابات أحداث المراهنات 0.36
export const hasBetting = (s) => Boolean(s.betting?.owned);
export const hasNoBetting = (s) => !s.betting?.owned;
export const bettingCustomersAtLeast = (n) => (s) => (s.betting?.customers || 0) >= n;
export const bettingReputationAtLeast = (n) => (s) => (s.betting?.reputation || 0) >= n;
export const bettingReputationBelow = (n) => (s) => (s.betting?.reputation || 0) < n;
export const bettingLicenseIs = (tier) => (s) => s.betting?.licenseTier === tier;
export const bettingSuspicionAtLeast = (n) => (s) => (s.blackFiles?.suspicion || 0) >= n;
export const bettingIsPresident = (s) => Boolean(s.politics?.office?.held);
export const bettingSponsorLeague = (s) => Boolean(s.betting?.sponsorLeague);
export const hasPendingInsider = (s) => Boolean(s.betting?.pendingInsider);
export const hasBribedOpponent = (s) => Boolean(s.blackFiles?.active?.bribedOpponent);
export const isSuspended = (s) => s.betting?.licenseStatus === "suspended";
export const isRevoked = (s) => s.betting?.licenseStatus === "revoked";
export const hasStarPlayer = (s) => s.players.some((p) => p.clubId === s.clubId && p.rating >= 78);
export const all = (...fns) => (s) => fns.every((fn) => fn(s));
export const any = (...fns) => (s) => fns.some((fn) => fn(s));
