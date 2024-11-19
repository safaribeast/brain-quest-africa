export const ADMIN_EMAILS = [
  'safaribeast01@gmail.com',
  'muhsinadam38@gmail.com',
  'charlesnyerere17@gmail.com',
  'rahimmnaro@gmail.com'
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email as any);
}
