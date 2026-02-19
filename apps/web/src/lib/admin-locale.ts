/**
 * Helper to pick localized text based on admin locale.
 * Usage: getLocalized(item, 'title', locale) → item.titleRu / item.titleEn / item.titleAz
 *        getLocalized(item, 'name', locale)  → item.nameRu / item.nameEn / item.nameAz
 */
export function getLocalized(
  item: Record<string, any> | null | undefined,
  field: string,
  locale: string
): string {
  if (!item) return '—';
  if (locale === 'ru') return item[`${field}Ru`] || item[`${field}En`] || item[`${field}Az`] || '—';
  if (locale === 'en') return item[`${field}En`] || item[`${field}Az`] || item[`${field}Ru`] || '—';
  return item[`${field}Az`] || item[`${field}En`] || item[`${field}Ru`] || '—';
}
