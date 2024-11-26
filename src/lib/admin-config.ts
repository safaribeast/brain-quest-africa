export const ADMIN_EMAILS = [
  'safaribeast01@gmail.com',
  'muhsinadam38@gmail.com',
  'charlesnyerere17@gmail.com',
  'rahimmnaro@gmail.com'
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // Convert email to lowercase for case-insensitive comparison
  const normalizedEmail = email.toLowerCase();
  
  // Quick access for development (you can remove this in production)
  if (normalizedEmail === 'admin@brainquest.africa') return true;
  
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
}
