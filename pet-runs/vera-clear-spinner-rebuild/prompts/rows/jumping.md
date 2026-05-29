Create a single horizontal sprite strip for the Codex app digital pet `vera-clear-spinner` in the state `jumping`.

Use the attached reference image(s) for pet identity and the attached base pet image as the canonical design. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. Simplify any high-resolution reference details into the Codex digital pet sprite style. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle.

Identity lock:
- Do not redesign the pet. Only change pose/action for the `jumping` animation.
- Preserve the exact head shape, ear/horn/limb shape, face design, markings, palette, outline weight, body proportions, prop design, and overall silhouette from the canonical base pet.
- Keep every frame recognizably the same individual pet, not a related variant.
- If the pet has a prop or accessory, preserve its size, side, palette, and attachment style unless the row action requires a small pose-only adjustment.
- Prefer a subtler animation over any change that mutates the pet identity.

Output exactly 5 separate animation frames arranged left-to-right in one single row. Each frame must show the same pet: Adult anime-style female chibi bust-only Codex pet named Vera Clear Spinner, using the existing Vera Clear canonical base as the immutable character identity. Black rounded bob hair, large readable head, slim compact upper body, warm gray-brown eyes, thick eyelids, tiny readable mouth, deep V-neck fitted short-sleeve white shirt, dark lower torso hint only, no legs. No laptop in idle, waving, jumping, running-right, or running-left. Laptop appears only in running, review, waiting, and failed rows. When laptop appears, it is dark charcoal or black and shows one large centered generic browser loading spinner mark, not an OpenAI logo, not text. Running state uses no glasses or added eyewear. Preserve canonical base line art, outline weight, face, proportions, palette, scale, and character size across every row. Failed may be regenerated, but the existing failed action is an approved fallback if a new row does not match the style..

Style contract: Codex digital pet sprite style: pixel-art-adjacent low-resolution mascot sprite, compact chibi proportions, chunky whole-body silhouette, thick dark 1-2 px outline, visible stepped/pixel edges, limited palette, flat cel shading with at most one small highlight and one shadow step, simple readable face, tiny limbs, and no detail that disappears at 192x208. Avoid polished illustration, painterly rendering, anime key art, 3D render, vector app-icon polish, glossy lighting, soft gradients, realistic fur or material texture, anti-aliased high-detail edges, and complex tiny accessories. Additional user style notes: Codex digital pet sprite style optimized for the actual app render around 113 x 122 CSS pixels. Thick dark 1-2 px outlines, pixel-art-adjacent stepped edges, flat cel shading, limited palette, compact chibi bust-only silhouette, high-contrast readable eyes and mouth. In each 192 x 208 source cell, maximize useful space while preserving safe padding; target visible character height around 170-180 px and keep idle, jumping, and waving almost identical in character size, ratio, face, line style, and silhouette. Avoid polished anime key art, painterly rendering, soft gradients, glossy lighting, texture, micro-accessories, detached effects, shadows, text, UI, scenery, and high-detail anti-aliased edges..

Use this prompt as an authoritative sprite-production spec. Do not expand it into a polished illustration, painterly character image, anime key art, 3D render, vector mascot, glossy app icon, realistic animal portrait, or marketing artwork.

Animation action: anticipation, lift, peak, descent, settle.


State-specific requirements:
- Show the jump through pose and vertical body position only: anticipation, lift, airborne peak, descent, settle.
- Do not draw ground shadows, contact shadows, drop shadows, oval shadows, landing marks, dust, smears, bounce pads, or motion marks under the pet.
- Keep the background outside the pet perfectly flat chroma key with no darker key-colored patches.

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
- Exactly 5 full-body frames, left to right, in one horizontal row.
- The attached layout guide shows the 5 frame boxes and inner safe area for this row. Follow its slot count, spacing, centering, and padding.
- Do not reproduce the layout guide itself: no visible boxes, guide lines, center marks, labels, guide colors, or guide background may appear in the output.
- Treat the image as 5 equal-width invisible frame slots. Fill every slot: each requested slot must contain exactly one complete full-body pose.
- Spread the 5 poses evenly across the whole image width. Do not leave any requested slot blank or create large empty gaps between poses.
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

Final Vera Clear Spinner jumping override:
- This row is not an actual jump. No vertical bounce, airborne pose, dust, shadow, impact, or squash/stretch.
- No laptop, no glasses, no props, no detached effects.
- Use Vera's own left hand consistently across all 5 frames. From the viewer's front-facing perspective, that is the hand on the viewer's right side of the sprite.
- Across 5 frames: left hand starts low, rises in front of Vera's left ear, lightly touches/gathers the side hair, sweeps the hair behind the ear, then returns to an idle-like settle pose.
- Keep the hair close to the idle silhouette. Do not fan the hair outward, widen the silhouette, shrink the character, or change the shirt/body ratio.
- Match idle and waving almost exactly in character scale, face size, outline density, shirt rendering, and dark waist hint.

Specific elbow-width repair constraints:
- Keep the total visible character width close to the accepted idle and waving rows. Target a per-frame visible bbox width near 131-138 px inside the 192x208 source cell; do not let any jumping frame expand to 140 px or wider.
- The raised elbow and forearm must stay inside Vera's existing hair silhouette width. Do not push the elbow outward beyond the side edge of the bob hair.
- The hand path must read in this exact order: low/resting hand, hand rises in front of the ear, fingers touch hair at the front edge of the ear, fingers tuck/sweep the hair behind the ear while the elbow remains tucked inward, idle-like settle.
- Avoid any frame where the hand already appears behind the ear before first appearing in front of the ear.
- Use small wrist/finger changes and a tucked elbow rather than a wide raised-arm pose.

Repair attempt 1:
- The previous `jumping` strip failed QA: visual QA rejected the row: the raised elbow expands the character width beyond the idle/waving silhouette, and the hand motion reads as ear-back to front to back instead of front-of-ear to behind-ear. Repair must keep the elbow and forearm inside the existing hair silhouette width so the visible bbox stays close to idle/waving while the hand moves from in front of the ear to behind the ear.
- Regenerate the entire row, not just one pose.
- Fill every requested frame slot with one complete centered full-body pet pose.
- Keep large gaps of pure chroma key only between slots; do not leave a requested slot empty.
- Avoid pose overlap, clipping, edge slivers, extra partial sprites, and detached fragments from neighboring poses.
- Use the canonical base image and any original references listed in `imagegen-jobs.json` as grounding inputs.
- Do not redesign the pet. Keep the exact same head shape, face design, markings, body proportions, palette, outline weight, materials, and props as the approved base pet.
- If the contact sheet shows identity drift, repair only this row while preserving the canonical base identity.

Repair attempt 2:
- The previous jumping strip still failed QA because the hair became too blocky and the face/head looked narrower than idle and waving.
- Regenerate all 5 frames from the canonical base plus the accepted idle and waving rows as style anchors. Match their face width, head height, hair volume, outline density, skin tone, shirt shape, and body ratio.
- Keep the black rounded bob hair light and layered like idle/waving. Do not turn it into one heavy helmet-like mass, do not make it longer, and do not shrink the face horizontally.
- The action remains a small hair-tuck near Vera's left ear: hand rises in front of the ear, fingers touch the hair, hair is tucked behind the ear, then she settles. No true jump, no bounce, no flying hair fan.
- Target each frame's visible character bbox width close to accepted idle/waving, roughly 131-138 px. Any frame that reads 126-129 px wide or visibly narrower than idle/waving is a failed generation.

Repair attempt 3:
- The previous jumping strip still failed user QA because Vera's body size, skin tone, hair style, and overall rendering differ from `idle` and `waving`.
- Treat the accepted `idle` and `waving` rows as the strongest style references. Match their skin color, face width, cheek shape, eye size, shoulder width, shirt neckline, waist hint, hair outline weight, and bob-hair layering.
- Do not make Vera taller, smaller, darker-skinned, glossier, sharper, or more detailed than `idle`/`waving`.
- Keep the same action intent: a small hair-tuck gesture near the ear. The movement should be readable but secondary; matching `idle`/`waving` identity is more important than dramatic motion.
- Frame rhythm: idle-like pose, hand starts to rise near ear, fingertips touch hair, tiny tuck behind ear, return to idle-like pose. No big elbow, no hair fan, no new hairstyle.
