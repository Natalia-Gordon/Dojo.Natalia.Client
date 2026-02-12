# Translation & RTL Best Practices

Guidelines for keeping the site translatable and accessible (Hebrew/RTL).

## Already in place

- `<html lang="he" dir="rtl">` and RTL used across the site
- `<meta name="google" content="translate">` for translation tools
- Semantic HTML5 and sensible heading hierarchy

## Practices to follow

### Images

- Use **descriptive Hebrew `alt` text** for every image (no empty or generic "Image" alt).
- Helps screen readers and translation tools.

### Dates and numbers

- **Avoid hardcoded dates** in HTML (e.g. "27 בנובמבר 2025").
- Use Angular `DatePipe` (or `Intl.DateTimeFormat`) with locale so dates format correctly.

### Text content

- Keep **complete sentences in templates**, not built in TypeScript, so translation tools see full phrases.
- Avoid **text in CSS** (`::before` / `::after`); put text in HTML.
- Prefer **Angular templates** over `innerHTML` for dynamic content so it can be translated.

### Checklist

| Area | Do |
|------|----|
| HTML | `lang` and `dir` set; semantic elements; descriptive `alt` |
| Text | In HTML; complete phrases; locale-aware dates/numbers |
| i18n | No text in CSS; user-facing text in HTML |
| A11y | Descriptive alt text; heading order; keyboard navigation |
