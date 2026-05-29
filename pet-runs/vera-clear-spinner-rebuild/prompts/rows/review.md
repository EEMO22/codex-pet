Create a single horizontal sprite strip for the Codex app digital pet `vera-clear-spinner` in the state `review`.

Use the attached reference image(s) for pet identity and the attached base pet image as the canonical design. Use the attached layout guide image only for frame count, slot spacing, centering, and safe padding. Simplify any high-resolution reference details into the Codex digital pet sprite style. Do not simply copy the still reference pose. Generate distinct animation poses that create a readable cycle.

Identity lock:
- Do not redesign the pet. Only change pose/action for the `review` animation.
- Preserve the exact head shape, ear/horn/limb shape, face design, markings, palette, outline weight, body proportions, prop design, and overall silhouette from the canonical base pet.
- Keep every frame recognizably the same individual pet, not a related variant.
- If the pet has a prop or accessory, preserve its size, side, palette, and attachment style unless the row action requires a small pose-only adjustment.
- Prefer a subtler animation over any change that mutates the pet identity.

Output exactly 6 separate animation frames arranged left-to-right in one single row. Each frame must show the same pet: Adult anime-style female chibi bust-only Codex pet named Vera Clear Spinner, using the existing Vera Clear canonical base as the immutable character identity. Black rounded bob hair, large readable head, slim compact upper body, warm gray-brown eyes, thick eyelids, tiny readable mouth, deep V-neck fitted short-sleeve white shirt, dark lower torso hint only, no legs. No laptop in idle, waving, jumping, running-right, or running-left. Laptop appears only in running, review, waiting, and failed rows. When laptop appears, it is dark charcoal or black and shows one large centered generic browser loading spinner mark, not an OpenAI logo, not text. Running state uses no glasses or added eyewear. Preserve canonical base line art, outline weight, face, proportions, palette, scale, and character size across every row. Failed may be regenerated, but the existing failed action is an approved fallback if a new row does not match the style..

Style contract: Codex digital pet sprite style: pixel-art-adjacent low-resolution mascot sprite, compact chibi proportions, chunky whole-body silhouette, thick dark 1-2 px outline, visible stepped/pixel edges, limited palette, flat cel shading with at most one small highlight and one shadow step, simple readable face, tiny limbs, and no detail that disappears at 192x208. Avoid polished illustration, painterly rendering, anime key art, 3D render, vector app-icon polish, glossy lighting, soft gradients, realistic fur or material texture, anti-aliased high-detail edges, and complex tiny accessories. Additional user style notes: Codex digital pet sprite style optimized for the actual app render around 113 x 122 CSS pixels. Thick dark 1-2 px outlines, pixel-art-adjacent stepped edges, flat cel shading, limited palette, compact chibi bust-only silhouette, high-contrast readable eyes and mouth. In each 192 x 208 source cell, maximize useful space while preserving safe padding; target visible character height around 170-180 px and keep idle, jumping, and waving almost identical in character size, ratio, face, line style, and silhouette. Avoid polished anime key art, painterly rendering, soft gradients, glossy lighting, texture, micro-accessories, detached effects, shadows, text, UI, scenery, and high-detail anti-aliased edges..

Use this prompt as an authoritative sprite-production spec. Do not expand it into a polished illustration, painterly character image, anime key art, 3D render, vector mascot, glossy app icon, realistic animal portrait, or marketing artwork.

Animation action: focused inspecting or review loop.


State-specific requirements:
- Show review through lean, blink, narrowed eyes, head tilt, or paw position.
- Do not add magnifying glasses, papers, code, UI, punctuation, symbols, or other new props unless they already exist in the base pet identity.

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

Final Vera Clear Spinner review override:
- Laptop required in all 6 frames.
- Match the laptop body size, lid angle, thickness, and placement to the accepted `waiting` row reference. The review laptop should look like the same laptop, not a different prop.
- The laptop is dark charcoal/black and its lid shows one large centered generic browser loading spinner mark. The spinner must match the accepted `waiting` row spinner: same simple segmented ring, same ring thickness, same bright arc/head shape, and the bright head should advance clockwise across frames. Do not draw a different loader style, an OpenAI knot, brand logo, text, UI, or code.
- Vera is not typing. She has put the laptop down in front of her, crosses her arms, and looks serious.
- Across 6 frames: serious stare, slight head tilt one way, deeper skeptical tilt, return through center, slight tilt the other way, settle.
- Keep the arms-crossed pose, laptop size/angle, character scale, and app-readable facial expression close to the current spinner review row, but fix any style drift against idle.

Repair attempt 2:
- Regenerate this row only after the new waiting row is available, using that waiting row as the laptop/spinner scale reference.
- The head tilt must clearly go both directions: center, small left, return, small right, return, settle. Do not tilt only to one side for most of the loop.
- Vera and the laptop must match the new waiting and running rows in perceived size: same visible character height, same laptop width, same lid angle, and same vertical placement.
- The spinner must match the new waiting spinner exactly in ring thickness, gray ring color, single bright white arc/head, and clockwise progression. Do not make the spinner head swing back and forth or duplicate into two heads.

Latest laptop-gaze override:
- Vera is reviewing what is on the laptop, so her eyes should aim at the laptop screen/keyboard area, not at the viewer.
- Keep the serious arms-crossed pose, but make the head tilt subtle and skeptical rather than playful or exaggerated.
- Match the accepted laptop-row scale: waiting, running, and review should look like the same person with the same laptop.

Repair attempt 3:
- The previous review strip failed user QA because the head tilt did not clearly travel left -> center -> right.
- Keep the laptop and arms-crossed serious review pose, but make the head movement sequence readable:
  frame 1 slight tilt left, frame 2 return toward center, frame 3 center/blink, frame 4 slight tilt right, frame 5 hold/inspect right tilt, frame 6 settle near center.
- The tilt should be visible at app size but not exaggerated. Do not turn it into a playful sway.
- Eyes should stay focused on the laptop area, not directly at the viewer.

Repair attempt 4:
- The last strip still failed user QA: it read as Vera simply crossing her arms and glaring, with no clear left-center-right head tilt.
- The head tilt is now the highest priority action. It must be visible through the whole head silhouette, not only through eye direction or expression.
- Use this exact readable sequence from the viewer's perspective: frame 1 head top leans to viewer-left, frame 2 still viewer-left but easing back, frame 3 upright center, frame 4 head top leans to viewer-right, frame 5 still viewer-right while inspecting, frame 6 upright center.
- Show the tilt with the face centerline, bangs, ear height, jaw angle, and shoulder/neck connection. The laptop must remain stable so the head motion is obvious.
- Keep Vera focused on the laptop, not looking at the viewer. The expression should be skeptical/concentrating, not angry glaring.
- Arms may stay crossed, but do not let crossed arms become the only readable action. If needed, loosen the arms slightly so the head/neck tilt is visually dominant.
- Keep laptop size, lid angle, spinner ring style, and character scale consistent with waiting/running.

Repair attempt 5:
- The previous attempt failed user QA again because frames 4 and 5 still leaned to the viewer's LEFT. It looked like: left tilt -> center -> deeper left tilt -> center.
- Interpret directions strictly in screen/image coordinates, not character anatomy. Viewer-left means the LEFT side of the output image. Viewer-right means the RIGHT side of the output image.
- Required 6-frame head/crown positions:
  frame 1: hair crown/top of head clearly shifted toward the LEFT side of its frame, chin/neck counterbalances slightly RIGHT.
  frame 2: still shifted LEFT but closer to upright.
  frame 3: upright CENTER; hair crown above neck.
  frame 4: hair crown/top of head clearly shifted toward the RIGHT side of its frame, chin/neck counterbalances slightly LEFT.
  frame 5: still shifted RIGHT, a little deeper or held while inspecting.
  frame 6: upright CENTER; hair crown above neck.
- Frames 4 and 5 must visually oppose frames 1 and 2. They should look like the head tilt direction has changed sides on screen.
- If the model cannot preserve crossed arms while making the right-side tilt clear, prioritize the right-side head tilt and laptop focus over crossed arms.
- Keep the laptop steady in nearly the same screen position across all frames, so only Vera's head/neck tilt changes.
