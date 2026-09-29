# M2B design mapping

Reviewed the live [Figma Make preview](https://www.figma.com/make/7AqVYRogPUjTclUHbML9IW/Finalize-Mezun360-Design?fullscreen=1) on 2026-09-25 before UI implementation. Figma did not expose an immutable revision ID.

- Profile: existing left identity/contribution cards and right biography/education/career cards. Add a quiet textual verification card, retaining the established M2A shell.
- Settings → Gizlilik Ayarları: white rounded cards, navy controls, pale blue selected visibility row, a separate contact privacy explanation. Implement only authorized visibility choices and directory opt-in. Replace the prototype's default alumni visibility with PRIVATE; omit active employer, notification and mentorship toggles.
- Yönetici → Mezun Yönetimi: pale lavender table header, pastel name/status badges, row inspection action, private-data access notice. Reuse this visual language for a focused verification queue and accessible review dialog. Do not implement mock counts, search, general edits or unrelated dashboard screens.

The prototype shows account activity states, not a complete verification workflow. PENDING/VERIFIED/REJECTED, confirmation, rejection reason, empty/error/loading and mobile adaptations follow the authorized product requirements. Contact fields shown in the profile prototype are deliberately excluded from M2B administrative inspection. Tokens and self-hosted Barlow remain from the existing design system.
