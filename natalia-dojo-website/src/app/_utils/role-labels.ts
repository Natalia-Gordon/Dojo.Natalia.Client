/**
 * Role values from API: student, instructor, admin, guest, teacher.
 * Maps each to a Hebrew label for display.
 */
const ROLE_TO_HEBREW: Record<string, string> = {
  student: 'תלמיד',
  instructor: 'מדריך',
  admin: 'מנהל',
  guest: 'אורח',
  teacher: 'מורה'
};

/**
 * Returns the Hebrew label for a role, or the original role if unknown.
 */
export function getRoleLabelHebrew(role: string | null | undefined): string {
  if (role == null || role === '') return '—';
  const key = role.trim().toLowerCase();
  return ROLE_TO_HEBREW[key] ?? role;
}
