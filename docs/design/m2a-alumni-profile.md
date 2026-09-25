# M2A profile design evidence

The [Figma Make file](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) was reviewed on 2026-09-25 before profile UI implementation. Opened **Mezun → Profilim** and **Profili Düzenle** in the live preview. This is a dated live review, not an immutable Figma revision.

| Observed design | M2A mapping |
| --- | --- |
| 240px pale sidebar, navy selected profile item, header/user area | AlumniLayout; responsive dialog navigation below 1024px, backend identity, no demo role switch |
| Left white rounded profile card, initials, name, company/position, mint completion panel, navy edit button | ProfilePage owner data, backend completion, additional requested department/year/city |
| Left lavender “BTÜ Topluluğuna Katkı” panel | Four stored preferences with explicit edit/save; no program enrollment |
| Right white cards: Hakkımda, Kariyer Yolculuğu timeline, Eğitim, Yetenekler, Sertifikalar | Same composition/order, records and empty states; descending chronological history |
| Centered rounded edit dialog with Hakkımda/company/position/industry/city | Accessible section-specific Radix dialogs; core, biography, each record, skills and preferences |
| Prototype comma-separated skills and single certificate text | Explicit user requirement supersedes prototype controls: keyboard chips and structured certificate records |
| Prototype İletişim email/phone card | Intentionally omitted: M2A has no contact storage or contact/profile-sharing surface |

Preserve the [established tokens and Barlow](m1a-foundation.md). No sample names, career records, metrics or 80% constant are included in production code. Initials derive from saved names; absent data is shown honestly. Local synthetic data entered during verification lives only in the local database, never Flyway or a production fixture.

Loading/onboarding/error/conflict/save states, responsive breakpoints and add/edit/remove record forms are engineering completions of the authorized brief; the live prototype did not specify every state. There is no official logo asset or immutable revision available. M2A does not claim pixel-exact Figma extraction or formal accessibility certification.
