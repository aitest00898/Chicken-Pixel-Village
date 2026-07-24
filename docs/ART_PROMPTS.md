# Original Art Generation Prompts

Mode: built-in Codex image generation tool. These are the exact revised prompts recorded for the four final master assets.

## `dawn-village.png`

```text
Use case: stylized-concept
Asset type: mobile game loading-screen environment art
Primary request: an original top-down 16-bit pixel-art dawn village for a Taiwanese poultry management app, evoking the general era of early 1990s Japanese pixel RPGs without copying any known game, franchise, character, menu, logo, font, object, or composition
Scene/backdrop: peaceful rural poultry village at sunrise with rice-field edges, stone paths, a small open-air market stall, a records guild hall, a manager cottage, a hatchery, and distant single-row, double-row, and triple-row chicken houses
Subject: one original chibi poultry-house manager in practical jacket and boots near a cheerful original market merchant opening a wooden stall; a few tiny chickens in the yard
Style/medium: polished handcrafted 16-bit pixel art, crisp pixel clusters, limited but rich palette, readable silhouettes, subtle tile texture, original visual language
Composition/framing: portrait 9:16 establishing view suitable behind mobile loading UI, upper half has calm sky and dawn light, lower half has village activity, leave clear low-detail breathing room around the upper-center for app title rendered later in HTML
Lighting/mood: gentle peach sunrise, teal shadows, warm window lights, optimistic and industrious
Color palette: sunrise peach, muted teal, moss green, warm straw yellow, dark navy outlines
Constraints: no text, no logos, no watermark, no copied Final Fantasy imagery, no blue RPG menu frame, no crystals, no airships, no copyrighted characters, no blurry anti-aliased painting; preserve intentional pixel grid and mobile readability
```

## `village-map.png`

```text
Use case: stylized-concept
Asset type: interactive mobile game village-map background
Primary request: an original top-down 16-bit pixel-art poultry village map for a management app, laid out as a practical tappable game board
Scene/backdrop: a compact rural village with six clearly separated destinations connected by paths: market pavilion, hatchery, archive guild hall, manager cottage, and three empty chicken-house plots; fields, irrigation stream, bridge, fences, trees and small flower beds around the perimeter
Subject: environment only, no people; each destination has a distinct strong silhouette and enough open space around it for HTML interaction markers
Style/medium: polished handcrafted 16-bit pixel art, crisp pixel clusters, limited rich palette, original early-1990s-inspired RPG sensibility without copying any game
Composition/framing: near-isometric top-down view, portrait 4:5 map, all destinations visible at once, center path hub, uncluttered edges, mobile-readable at 360 px width
Lighting/mood: clear late-morning light, friendly, industrious and cozy
Color palette: moss green, wheat gold, warm timber, slate teal roofs, terracotta accents, dark navy outlines
Constraints: no text, no labels, no logos, no watermark, no copyrighted characters, no Final Fantasy-specific imagery, no crystals, no airships, no exact blue RPG frames; no photographic blur; preserve pixel-grid clarity
```

## `sprite-atlas.png`

```text
Use case: stylized-concept
Asset type: game character and building sprite atlas for a mobile poultry-management RPG interface
Primary request: a single coherent original 16-bit pixel-art sprite atlas containing: a chibi poultry-house manager facing front and back; a respectful foster-farmer NPC in work cap, coveralls and rain boots facing front; a cheerful market merchant facing front; one white hen; four wearable equipment icons (straw hat, work jacket, feed scoop, small canvas backpack); and three poultry-house building sprites representing single-row, double-row and triple-row capacity tiers
Scene/backdrop: perfectly flat solid #ff00ff chroma-key background for local background removal
Style/medium: handcrafted 16-bit pixel art with crisp hard pixel edges, consistent 3-head-tall chibi proportions, strong silhouettes, original visual identity
Composition/framing: orderly atlas grid, generous empty padding between every sprite, no overlap, every sprite fully visible, buildings on their own bottom row
Lighting/mood: neutral game-sprite lighting, friendly and practical
Color palette: deep teal, warm straw, workwear olive, cream, rust and dark navy outlines; do not use #ff00ff inside any sprite
Constraints: background must be exactly one uniform #ff00ff with no shadows, gradients, texture, reflections or floor plane; no text, no labels, no logos, no watermark; no cast shadows; no copyrighted characters; no Final Fantasy-specific clothing, symbols or objects; preserve crisp pixel grid
```

The final PNG uses a hard chroma-key removal pass; the source with magenta background is intentionally excluded from Git.

## `app-icon-master.png`

```text
Create a production-quality square mobile app icon for an original Taiwanese poultry management game titled conceptually “Chicken Pixel Village”. Original artwork only, no text, no logos, no existing game or franchise references. Centered heraldic red-feather rooster head in clean expressive 16-bit pixel-art style, facing three-quarters, confident but friendly. Behind it: a small golden sunrise disk and one subtle teal village roof silhouette. Deep blue-green background, warm ivory, muted rust red, and gold palette matching an elegant rural JRPG interface. Strong iconic silhouette readable at 48 px, crisp pixel clusters, symmetrical balanced composition, generous safe margin, no tiny details near edges. Square 1024x1024, opaque background, no transparency, no lettering, no watermark, no mockup frame, no rounded-corner mask (the OS will mask it).
```
