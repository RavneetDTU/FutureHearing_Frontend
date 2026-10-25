/** Selling prices, costs, totals and other money amounts. Administrators only. */
export function canSeePrices(user) {
  if (!user) return false;
  if (user.isAdmin) return true;
  const perms = user.permissions;
  return Array.isArray(perms) && perms.includes('*');
}

export const canSeeProductCost = canSeePrices;
