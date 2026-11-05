# Product invariants for later milestones

The Journey is a private Android application for two local profiles. Milestone 1 is exclusively its world interface. Do not begin later phases automatically.

- Each completed activity adds exactly one annual step, irrespective of difficulty or duration. Steps are accumulated activity counts, not calendar slots. New annual journeys begin January 1; archives remain explorable. Training sequences and streaks may cross years.
- Explicit tiers: 0–179 base; 180–199 Solid; 200–219 Excellent; 220–239 Extraordinary; 240–260 Champion; 261+ Legendary. Step 260 is the culmination/gateway. The route must extend deterministically without a hard limit.
- Personal quests are separate from steps and do not generate different main routes. Future quest islands: profile A marathon/80 kg/fitness; profile B 55 kg/5K/fitness. Never infer readiness from activity count.
- Permanent character abilities use qualifying active training weeks: standing from five activities, jogging at four weeks, running at 13, flying at 26. Broken-streak disappointment is temporary. Approved vacation/sickness/injury overrides it and preserves abilities. Current preview poses are not a real streak engine.
- Five workouts qualify an active week. At most one adjacent-active-week credit permits 4+6 or 6+4; no unlimited banking. Qualification may remain pending. Pauses preserve streaks without increasing their length and do not consume make-up windows.
- Pauses are distinct from missed workouts. Ordered training weeks have stable IDs; schedule derivation skips pauses without rewriting completed history. Fixed-date races require conflict warnings.
- Future Weekly Workouts: snapping week carousel, five expressive expandable bubbles, one expanded at a time, bonus activities, custom reversible choreographed transition to the world. Do not replace this with generic navigation slides.
- Future SQLite: versioned migrations and stable IDs for independent profiles, templates, scheduled instances, completion history, goals/measurements, journey events, pauses, rewards and preferences. Plan edits must preserve historical records. Real progress must be restored from durable records, never from the developer sandbox.
- Future JSON imports require schema validation and preview; preserve completed history. Full backups must transactionally reconstruct the entire application, including archives, achievements and preferences.
- Offline operation, no login/backend/cloud database. Android development and EAS builds must be possible through cloud tooling. Keep device logical dp, safe-area insets, density and font scaling distinct from physical display resolution.
