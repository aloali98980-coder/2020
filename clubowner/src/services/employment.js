export const active = (p) => p.status !== "retired";
export const ownsContract = (s, p) =>
  active(p) && (p.loan ? p.loan.parent === s.clubId : p.clubId === s.clubId);
export function salaryLiability(s, p) {
  if (!active(p)) return 0;
  const l = p.loan;
  if (l?.version === 2) {
    const borrowerShare = Math.round((p.salary * l.wageShare) / 100);
    return l.parent === s.clubId
      ? p.salary - borrowerShare
      : l.borrower === s.clubId
        ? borrowerShare
        : 0;
  }
  return p.clubId === s.clubId ? p.salary : 0;
}
export const reservedSquadSize = (s) =>
  s.players.filter(
    (p) => active(p) && (p.clubId === s.clubId || p.loan?.parent === s.clubId),
  ).length;
