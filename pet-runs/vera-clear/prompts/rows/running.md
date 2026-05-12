Create a single horizontal sprite strip for the Codex app digital pet `vera-clear` in the state `running`.

Use the attached reference image(s) for pet identity and the attached base pet image as the canonical design. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. Simplify any high-resolution reference details into the Codex digital pet sprite style. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle.

Identity lock:
- Do not redesign the pet. Only change pose/action for the `running` animation.
- Preserve the exact head shape, ear/horn/limb shape, face design, markings, palette, outline weight, body proportions, prop design, and overall silhouette from the canonical base pet.
- Keep every frame recognizably the same individual pet, not a related variant.
- If the pet has a prop or accessory, preserve its size, side, palette, and attachment style unless the row action requires a small pose-only adjustment.
- Prefer a subtler animation over any change that mutates the pet identity.

Output exactly 6 separate animation frames arranged left-to-right in one single row. Each frame must show the same pet: Adult anime-style female chibi bust-only Codex pet named Vera Clear. Modern female AI assistant with black rounded bob hair, a large readable head, slim compact upper body, normally no glasses, no headband, no badge, no earrings, and no asymmetric accessories. In this running row only, add oversized work glasses as a temporary focused-working accessory. Clear warm gray-brown eyes with thick eyelids, tiny readable mouth, slightly longer soft oval face, side-swept black bob, broad simple hair highlights, and a deep V-neck fitted short-sleeve white shirt simplified for tiny sprite scale. Dark lower torso hint only, no visible legs. Small hands near the lower edge. Laptop appears only in waiting, running, and review rows; every other row must have no laptop. When laptop appears, it must be dark charcoal or black and the lid must show one very large centered high-contrast light OpenAI knot logo matching the supplied openai.svg shape, simplified but recognizable, not tiny. Adult and tasteful; no nudity, no lingerie, no see-through fabric, no sexual pose, no exaggerated cleavage..

Style contract: Codex digital pet sprite style: pixel-art-adjacent low-resolution mascot sprite, compact chibi proportions, chunky whole-body silhouette, thick dark 1-2 px outline, visible stepped/pixel edges, limited palette, flat cel shading with at most one small highlight and one shadow step, simple readable face, tiny limbs, and no detail that disappears at 192x208. Avoid polished illustration, painterly rendering, anime key art, 3D render, vector app-icon polish, glossy lighting, soft gradients, realistic fur or material texture, anti-aliased high-detail edges, and complex tiny accessories. Additional user style notes: Codex digital pet sprite style optimized for the real app render at about 113 x 122 CSS pixels. Use thick dark 1-2 px outlines, high-contrast readable eyes and mouth, large head with small slim torso, simple flat colors, limited palette, and no tiny body details that shimmer or disappear. In the 192 x 208 source cell, target a visible character bbox about 120-130 px wide and 170-180 px tall; keep the face and laptop logo large enough to survive the final app scale. Avoid polished anime key art, painterly rendering, soft gradients, glossy lighting, texture, micro-accessories, loose effects, shadows, text, UI, scenery, and high-detail anti-aliased edges..

Use this prompt as an authoritative sprite-production spec. Do not expand it into a polished illustration, painterly character image, anime key art, 3D render, vector mascot, glossy app icon, realistic animal portrait, or marketing artwork.

Animation action: focused laptop work loop with oversized glasses and fast keyboard hand motion.

Current canonical character lock:
- Preserve the first approved base's slightly longer soft oval face, warm gray-brown eyes, tiny friendly smile, side-swept black bob, and broad simple hair highlights.
- Keep the head-to-body ratio large while preserving a short fitted torso down to just below the start of the waist.
- Keep the eyebrow-to-crown hair volume low; do not puff up the top hair. Preserve the larger readable face area and expression.
- Keep small hands and a slight inward waist taper visible; do not show hips, legs, feet, a long torso, or a body-heavy silhouette.

User motion directive:
- Laptop required in this row.
- The pet works on a dark charcoal/black laptop. The laptop lid must show one very large centered high-contrast light OpenAI knot logo based on references/openai-logo-reference-on-white.png.
- Preserve the current approved running row's laptop angle, laptop size, character scale, and character-to-laptop placement. Use `decoded/running.png` only as a layout reference; do not copy its noisy up-down hand rhythm.
- Add large readable work glasses: oversized dark frames, simple clear lenses, big enough to read at app size, but not hiding the eyes. The glasses are only for this running state.
- Show active work through focused eyes behind the glasses and busy low hand motion on the keyboard.
- The hands should stay near the keyboard and move rapidly in small alternating typing positions. Avoid large arm raises, waving-like hand lifts, or hands popping high above the laptop.
- Keep the head and torso mostly steady with only a tiny focused bob. The laptop should stay stable and readable.
- This is task-running, not directional running. No travel, jogging, raised knees, or speed effects.

State-specific requirements:
- Show the pet actively working on the laptop: focused posture, oversized glasses, eyes aimed at the laptop, and rapid small typing motions.
- The animation should feel like concentrated desk work, not a noisy gesture loop. The motion center is the hands/fingers over the keyboard.
- Keep both hands visible enough to sell typing. Alternate left/right hand positions across frames with small wrist and finger changes.
- Preserve the same compact bust-only scale, laptop angle, laptop size, and character-laptop placement as the current running row.
- Keep the logo readable at final app scale; prefer a bold simplified knot over tiny exact linework. Do not add text or extra UI on the laptop.
- Do not show literal foot-running, jogging, sprinting, treadmill motion, directional travel, speed lines, dust clouds, floor shadows, motion trails, or detached effects.

Transparency and artifact rules:
- Prefer pose, expression, and silhouette changes over decorative effects.
- Effects are allowed only when they are state-relevant, opaque, hard-edged, pixel-style, fully inside the same frame slot, and physically touching or overlapping the pet silhouette.
- Allowed attached effects can include a tear touching the face, a small smoke puff touching the pet or prop, or tiny stars overlapping the pet during a failed/dizzy reaction.
- Do not draw detached effects: floating stars, loose sparkles, floating punctuation, floating icons, falling tear drops, separated smoke clouds, loose dust, disconnected outline bits, or stray pixels.
- Do not draw wave marks, motion arcs, speed lines, action streaks, afterimages, blur, smears, halos, glows, auras, floor patches, cast shadows, contact shadows, drop shadows, oval floor shadows, landing marks, or impact bursts.
- Do not include text, labels, frame numbers, visible grids, guide marks, speech bubbles, thought bubbles, UI panels, code snippets, scenery, checkerboard transparency, white backgrounds, or black backgrounds.
- Do not use the chroma-key color or chroma-key-adjacent colors in the pet, prop, effects, highlights, shadows, or outlines.
- Reject any pose that is cropped, overlaps another pose, crosses into a neighboring frame slot, or creates a separate disconnected component that is not attached to the pet.

Layout requirements:
- Exactly 6 full-body frames, left to right, in one horizontal row.
- The attached layout guide shows the 6 frame boxes and inner safe area for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 6 equal-width invisible frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 6 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
- Center one complete pose in each slot. No pose may cross into the neighboring slot.
- Use a perfectly flat pure user-selected #00FF00 chroma-key background across the whole image.
- Do not draw visible grid lines, borders, labels, numbers, text, watermarks, or checkerboard transparency.
- Do not include scenery or a background environment.
- Keep the rendering sprite-like: chunky silhouette, dark pixel-style outline, limited palette, flat shading, minimal tiny detail.
- Do not use #00FF00, pure user-selected, or colors close to that chroma key in the pet, props, highlights, shadows, motion marks, dust, landing marks, or effects.
- Do not draw shadows, glows, smears, dust, or landing marks using darker/lighter versions of the chroma-key color.
- Keep every frame self-contained with safe padding. No pet body part should be clipped by the frame slot.
- Avoid motion blur. Use clear pose changes readable at 192x208.
- Preserve the same silhouette, face, proportions, palette, material, and props across every frame.
