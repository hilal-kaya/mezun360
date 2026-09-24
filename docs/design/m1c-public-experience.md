# M1C public experience design record — 2026-09-24

Source: [Finalize Mezun360 Design, Figma Make](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1). The live preview loaded after an initial delay. No immutable revision identifier was exposed; this is a dated observation, not a frozen design revision.

Reviewed before implementation: alumni Ana Sayfa (navy sidebar, pastel summaries and recommendation rows); Mezunlar Ağı (white cards, initials and professional labels); Mentörler (lavender/turquoise Hızlı Mentörlük panel, restrained tags); İş & Staj (opportunity rows and İş/Staj/İMEP/Yeni Mezun categories); admin Genel Bakış (pastel summaries and explicitly marked Demo Veri chart).

No dedicated public landing screen or official university logo asset was available in the reviewed screens/repository. Use the user-authorized text identity “BTÜ Mezun360 / Kariyer ve Mezun Platformu”. Do not treat the prototype's BTÜ letter tile or a graduation-cap icon as an official university emblem. Landing composition follows the detailed M1C brief, using the established Barlow/navy/warm background/pastel palette and rounded product surfaces.

## Screen mapping

| Surface | Reference and adaptation |
| --- | --- |
| Public header/footer | Text identity; original editorial navigation from the M1C brief; no invented logo/legal/contact information |
| Hero | Required headline/copy and CSS/vector community connections; no photography or personal data |
| Value / how it works | Original public explanatory layout; four distinct color accents and lightweight numbered steps |
| Alumni preview | Simplified static composition inspired by Ana Sayfa, network, career rows and mentor panel; no copied individuals, company records, scores or live metrics |
| Career Center preview | Static illustrative bars inspired by Genel Bakış; visibly marked as a design example, no aggregate API or real data |
| Login / private placeholders | Existing M1B logic preserved; matching text identity and surfaces; reset link becomes visibly unavailable |

Public previews explain planned features and are labelled “Tasarım önizlemesi · Temsili içerik”. They are not functioning dashboards, analytics or a directory. No numerical product metrics are needed. Student/employer ecosystem labels are conceptual, with no new roles or portals. Privacy copy describes the agreed design goals without claiming legal certification or completed M2 privacy controls.

Root stays public even for authenticated users. A successful existing `/auth/me` result offers “Alanıma dön”; it never gates the public content, exposes an admin role picker or redirects in a loop. Login retains its existing role-based redirect. Legal/contact placeholders are plain unavailable text. Password reset remains pending; direct legacy `/forgot-password` navigation has an honest informational fallback.

Responsive intent: expanded navigation on wide screens, keyboard-operable disclosure below that width; one-column hero and stacked preview regions on mobile. Existing focus/reduced-motion rules remain. Desktop/tablet/mobile visual and keyboard checks are recorded in the M1C verification report after implementation.
