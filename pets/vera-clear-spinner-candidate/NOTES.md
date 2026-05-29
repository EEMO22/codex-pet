# Vera Clear Spinner

Vera Clear variant with the OpenAI-style laptop mark replaced by a generic browser loading spinner.

## Changed Rows

- `idle`: rebuilt as a quiet blink/breathing loop with the locked Vera Clear scale.
- `running-right` and `running-left`: rebuilt as matched directional movement rows.
- `waving`: rebuilt as the blown-kiss gesture, not a generic hand wave.
- `jumping`: rebuilt as a compact mouseover hair-tuck gesture close to the idle silhouette, with the hand moving from in front of the ear to behind the ear.
- `failed`: rebuilt with laptop failure, popped lid, heavier face/body soot, vertical hammer-fist impact, and annoyed recovery beats that do not return to chin-rest.
- `waiting`: rebuilt as a quieter chin-rest waiting loop where Vera looks down at the laptop with only tiny head movement.
- `running`: rebuilt as the active laptop work loop with a `waiting`-matched laptop size, focused downward laptop gaze, and clockwise spinner.
- `review`: rebuilt as a laptop review loop with a screen-left -> center -> screen-right -> center head tilt, downward laptop focus, and a `waiting`-matched laptop/spinner.

`idle`, `jumping`, `waving`, `waiting`, `running`, and `review` also received a canonical-base consistency pass to reduce row-to-row render drift.

The left movement row is derived from the right movement row so the two directions keep matched hair motion, body tilt, scale, and timing.

Laptop rows use a generic browser-style spinner mark instead of any brand logo.

## QA

- Atlas size: `1536 x 1872`
- Cell size: `192 x 208`
- Contact sheet: `pet-runs/vera-clear-spinner-rebuild/qa/contact-sheet.png`
- Display preview: `previews/vera-clear-spinner-final-display-preview.png`
- Jumping preview: `previews/vera-clear-spinner-jumping-front-back-preview.png`
- Validation: passed with no errors or warnings during local packaging.
