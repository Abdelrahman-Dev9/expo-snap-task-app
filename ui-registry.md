# UI Registry — Snap Task Mobile

Design tokens live in `tailwind.config.js` (`brand`, `accent`, `ink`, `canvas`, `surface`).
Raw hex values used in JS props (icons, gradients) come from `src/components/ui/theme.ts`.

## Baseline — Established 2026-10-17

| Property           | Class / Token                                   |
| ------------------ | ----------------------------------------------- |
| App background     | `bg-brand-950` (root), `bg-canvas` (content)    |
| Hero gradient      | `theme.gradients.hero` (`#1e1b4b → #4338ca → #6366f1`) |
| Card / surface     | `bg-surface border border-ink-200 rounded-3xl`  |
| Control radius     | `rounded-2xl` (inputs, buttons, social, OTP)    |
| Control height     | `h-14`                                          |
| Text — primary     | `text-ink-900`                                  |
| Text — secondary   | `text-ink-700` (labels), `text-ink-500` (body)  |
| Text — muted       | `text-ink-400`                                  |
| Text on hero       | `text-white`, `text-white/75`, `text-white/70`  |
| Link / accent text | `text-brand-600 font-semibold`                  |
| Error text         | `text-accent-500`                               |
| Focus border       | `border-brand-600`                              |
| Default border     | `border-ink-200`                                |
| Error border       | `border-accent-500`                             |
| Screen padding     | `px-6`                                          |
| Field spacing      | `mb-4`                                          |
| Section divider    | `my-5`                                          |

---

### Screen (auth shell)

File: `src/components/ui/Screen.tsx`
Last updated: 2026-10-17

| Property         | Class                                               |
| ---------------- | --------------------------------------------------- |
| Background       | `bg-brand-950` + hero `LinearGradient` `h-[360px]`  |
| Content sheet    | `rounded-t-3xl bg-canvas px-6 pb-6 pt-7`            |
| Eyebrow          | `text-xs font-semibold uppercase tracking-[3px] text-white/70` |
| Title            | `text-display font-bold text-white`                 |
| Subtitle         | `mt-2 text-base leading-6 text-white/75`            |
| Icon chip / back | `h-10 w-10 rounded-2xl bg-white/15` / `rounded-full bg-white/15` |
| Decorative orbs  | `rounded-full bg-white/10`, `bg-accent-500/20`      |

**Pattern notes:** Every auth screen uses this shell. Header lives on the gradient; form content sits on the rounded `bg-canvas` sheet. `footer` prop pins secondary links to the bottom with `mt-auto pt-6`.

---

### Button

File: `src/components/ui/Button.tsx`
Last updated: 2026-10-17

| Variant   | Class                                                                 |
| --------- | --------------------------------------------------------------------- |
| primary   | `h-14 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 active:bg-brand-700` + `text-base font-semibold text-white` |
| secondary | `h-14 rounded-2xl border border-ink-200 bg-surface active:bg-ink-100` + `text-ink-900` |
| ghost     | `py-3 active:opacity-70` + `text-base font-semibold text-brand-600`   |
| disabled  | `opacity-60`                                                          |

**Pattern notes:** Optional trailing `Ionicons` icon (18px). Primary CTA always has an icon when it advances a flow (`arrow-forward`, `checkmark`).

---

### TextField

File: `src/components/ui/TextField.tsx`
Last updated: 2026-10-17

| Property      | Class                                                          |
| ------------- | -------------------------------------------------------------- |
| Label         | `mb-2 text-sm font-semibold text-ink-700`                      |
| Container     | `h-14 flex-row items-center rounded-2xl border bg-surface px-4`|
| Border states | default `border-ink-200`, focus `border-brand-600`, error `border-accent-500` |
| Input text    | `text-base text-ink-900`, placeholder `#94a3b8`                |
| Leading icon  | 18px, `#94a3b8` → `#4f46e5` on focus                           |
| Error         | `mt-1.5 text-sm text-accent-500`                               |
| Hint          | `mt-1.5 text-xs text-ink-500`                                  |
| Wrapper       | `mb-4`                                                         |

**Pattern notes:** Password fields get an eye toggle. Always pass a leading `icon`.

---

### OtpInput

File: `src/components/ui/OtpInput.tsx`
Last updated: 2026-10-17

| Property      | Class                                                        |
| ------------- | ------------------------------------------------------------ |
| Box           | `h-16 flex-1 rounded-2xl border-2 bg-surface`                |
| Border states | empty `border-ink-200`, filled `border-brand-300`, active `border-brand-600`, error `border-accent-500` |
| Digit         | `text-2xl font-bold text-ink-900`                            |
| Caret         | `h-7 w-0.5 rounded-full bg-brand-600`                        |
| Gap           | `gap-2`                                                      |

---

### SocialButton

File: `src/components/ui/SocialButton.tsx`
Last updated: 2026-10-17

| Property   | Class                                                        |
| ---------- | ------------------------------------------------------------ |
| Container  | `h-14 rounded-2xl border border-ink-200 bg-surface px-4 active:bg-ink-100` |
| Label      | `text-base font-semibold text-ink-900` (centered)            |
| Icon       | `Ionicons logo-*` 20px, brand color (Google `#EA4335`, Facebook `#1877F2`) |

**Pattern notes:** Matches `Button secondary`. Handlers route through `features/auth/social.ts` so Clerk can be swapped in without touching screens.

---

### Divider

File: `src/components/ui/Divider.tsx`
Last updated: 2026-10-17

| Property | Class                                                         |
| -------- | ------------------------------------------------------------- |
| Line     | `h-px bg-ink-200`                                             |
| Label    | `text-xs font-semibold uppercase tracking-wider text-ink-400` |
| Spacing  | `my-5`, `gap-3`                                               |

---

### Banner

File: `src/components/ui/Banner.tsx`
Last updated: 2026-10-17

| Tone    | Class                                                       |
| ------- | ----------------------------------------------------------- |
| error   | `border-accent-500/30 bg-accent-500/10` + `text-accent-500` |
| info    | `border-brand-200 bg-brand-50` + `text-brand-700`           |
| success | `border-emerald-200 bg-emerald-50` + `text-emerald-700`     |
| Shape   | `mb-4 rounded-2xl border px-4 py-3`, icon 18px              |

---

### App tabs (Tasks / Profile)

File: `src/app/(app)/(tabs)/_layout.tsx`
Last updated: 2026-10-17

| Property     | Value |
| ------------ | ----- |
| Active tint  | `theme.colors.brand600` |
| Inactive     | `theme.colors.ink400` |
| Tab bar      | `bg-surface`, border `ink-200`, height 88 |

### Tasks list

File: `src/app/(app)/(tabs)/index.tsx`
Last updated: 2026-10-17

| Property   | Class |
| ---------- | ----- |
| Hero       | `LinearGradient h-[220px]` |
| Sheet      | `rounded-t-3xl bg-canvas` |
| Task row   | `rounded-3xl border border-ink-200 bg-surface` |
| Thumb      | 88×88 image or `bg-brand-50` placeholder |
| Empty state | `h-24 w-24 rounded-3xl bg-brand-50`, title `text-xl font-bold text-ink-900` |

### Profile

File: `src/app/(app)/(tabs)/profile.tsx`
Last updated: 2026-10-23

| Property | Class |
| -------- | ----- |
| Avatar   | 96×96 circle + camera chip `bg-brand-600` |
| Avatar pick | Action sheet via `lib/pick-image` — Take photo / Choose from gallery |
| Section label | `text-sm font-semibold uppercase tracking-wider text-ink-400` |
| Email row | `h-14 rounded-2xl border border-ink-200 bg-surface` |

### Task photo strip

Files: `src/app/(app)/task/new.tsx`, `src/app/(app)/task/[id].tsx`
Last updated: 2026-10-23

| Property | Class / behavior |
| -------- | ---------------- |
| Label | `text-sm font-semibold text-ink-700` + `(count/5)` |
| Strip | Horizontal `ScrollView`, `gap-3` |
| Thumb | 112×112, `borderRadius: 16` |
| Remove | Absolute chip `bg-ink-900/70` + close icon |
| Add tile | `h-28 w-28 rounded-2xl border border-dashed border-ink-200 bg-surface` |
| Source | Shared `pickImageWithSource` (camera or gallery) |
| Cap | `MAX_TASK_IMAGES` = 5 |
