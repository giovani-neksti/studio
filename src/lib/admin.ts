export const ADMIN_EMAILS = [
  'giovani@neksti.com.br',
  'lucas@neksti.com.br',
  'jefferson@neksti.com.br',
];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
