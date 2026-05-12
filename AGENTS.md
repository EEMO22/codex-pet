# Codex Pet Project Guide

## Scope

This project is for creating Codex desktop pets and pet references. Prefer the local `hatch-pet` skill for actual pet packaging, pose rows, validation, and QA.

## Actual Codex Pet Rendering

Codex pet sprites are authored as an 8 by 9 atlas:

- Final spritesheet: `1536 x 1872px`
- Frame cell: `192 x 208px`
- Layout: `8` columns by `9` rows

The Codex desktop app renders each frame through the avatar CSS:

```css
.codex-avatar-root {
  aspect-ratio: 192 / 208;
  width: 7.04rem;
  image-rendering: pixelated;
  background-repeat: no-repeat;
  background-size: 800% 900%;
}
```

At the default `16px` rem size, the on-screen pet frame box is about `112.64 x 122.03 CSS px`, effectively `113 x 122px`. If the app root font size changes, this scales with `rem`, but the useful design target is still roughly a `113 x 122px` frame.

Do not confuse the rendered frame box with the visible character size. The pet artwork usually has transparent padding inside the `192 x 208px` cell, so the visible character is smaller than the frame. A reference preview that fills most of the full `192 x 208px` source cell can look much larger than the actual pet overlay. Always measure the non-transparent bounding box of the character and preview that visible area after the app scale is applied.

Because the app uses `image-rendering: pixelated`, tiny antialiased details do not smooth out when displayed. Thin seams, hair strands, lens reflections, tiny jewelry, subtle facial lines, small text, and dense costume details will either disappear or turn into noisy pixels. Judge all designs at the actual display size, not only at high resolution.

## Reference-To-Pet Workflow

When creating a new character:

1. Start with a high-quality reference image only to settle the character identity.
2. Before turning it into a pet, simplify the character for the final display size:
   - thick outer silhouette
   - large readable head and face shapes
   - very limited palette
   - big clothing color blocks
   - no tiny asymmetric accessories unless they are essential
   - no details that only work at high resolution
3. After generating the pet-optimized character image, provide an actual render-size preview.

## Required Display Preview

After making the reference image and then converting it into a pet-ready character, always provide a preview that shows:

- the simulated `192 x 208px` source cell, clearly labeled as source-cell size and not actual on-screen size
- the actual app frame size, approximately `113 x 122px`
- the visible character bounding box at that app scale
- a zoomed version of the actual display render for inspection

Save these previews under `previews/` with descriptive names. The preview should make it easy to answer whether the pet still reads at real overlay size and whether it is visually larger or smaller than existing pets.

Do not present multiple fill-size candidates as if they are separate render modes unless the user explicitly asks for alternatives. Choose one baseline scale, state the baseline, and provide a single calibrated preview. A good default baseline is the built-in pet range: visible character height around `170-180px` inside the `192 x 208px` source cell, which displays around `100-106px` tall in the app. If matching a specific existing custom pet, measure that pet's actual non-transparent bounding box and use it as the baseline instead.

The readability target at actual display size should be stated plainly. For example:

- hair silhouette
- glasses or face marker
- main outfit color block
- leg/body silhouette
- one or two identity-defining accents at most

If those elements are not readable inside the roughly `113 x 122px` frame, or if the visible bounding box is noticeably out of scale with existing pets, revise the design before starting pose rows.
