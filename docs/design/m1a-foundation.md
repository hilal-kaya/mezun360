# M1A design evidence and tokens

The [Figma Make design](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) is the visual source of truth. This record is dated 2026-09-23. M1A does not reproduce any complete product screen.

## Access evidence

The configured in-app browser opened the file and its live preview. An initial loading/blank-iframe delay recovered with a new preview tab; no design substitute was used. Currently rechecked:

- **Mezun / Ana Sayfa:** left navigation, navy active item, pastel metric cards, white content cards, warm page background and recommendation rows. Navigation labels include Mezunlar Ağı, İş & Staj, Mentörler, Etkinlikler, Haberler, Profilim and Ayarlar.
- **Yönetici / Genel Bakış:** career-center overview, pastel summary cards and chart area explicitly marked “Demo Veri”. Navigation includes Mezun Analizleri, Mezun Yönetimi, Mentörlük Yönetimi, İşverenler, Anketler and Raporlar.

The [requirements](../requirements.md) retain the broader 2026-09-22 review (jobs, mentors/request form, privacy settings). Those screens were not all re-reviewed in M1A. The prototype role toggle and sample metrics are design/demo affordances, not authorization or production data. No toggle or metric fixture was copied into application code.

A stable immutable Figma revision, complete responsive layouts, exact spacing/radii and loading/empty/error/forbidden states have not been captured. The live Make URL is not an immutable revision. Map these details before each corresponding product screen is implemented.

## Confirmed inputs and provisional defaults

The following exact values come from the user's M1A request and are encoded in [globals.css](../../frontend/src/styles/globals.css):

| Token | Value |
| --- | --- |
| Institutional navy | `#233A85` |
| Pastel blue | `#DDE7FF` |
| Pastel turquoise | `#DDF6F4` |
| Pastel mint | `#E4F4EA` |
| Pastel lavender | `#ECE8FA` |
| Pastel peach | `#FCE9DE` |
| Warm background | `#FAFAF7` |
| Primary text | `#1F2937` |
| Typeface | Barlow, self-hosted Latin and Latin Extended; 400/500/600/700 |

Engineering defaults, pending exact Figma specifications: Tailwind's 4 px spacing unit; 8/10/12/16 px radius scale; 16 px base text; white card surfaces; gray secondary text/borders; red errors. These are reusable primitive defaults, not claims of pixel-exact Figma extraction. The prototype's page layouts, logos, charts and product content remain unimplemented.

Pastels are surfaces with dark text; white text is reserved for navy buttons. Inputs have a visible border, labels and help text. Focus outlines, 44 px minimum button/input targets, reduced-motion support, live loading/error text, a skip link and Radix dialog focus management establish accessibility behavior. Automated dialog tests verify Escape dismissal and focus restoration. The technical page is a development check, not final WCAG certification or complete product visual approval.
