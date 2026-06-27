# Run For Glory 2026 Asset Inventory

Source sheet analyzed: `ChatGPT Image Jun 23, 2026, 11_30_40 AM.png`

The sheet contains runner animation frames, collectibles, obstacles, environment props, a park background, and a score UI panel. The extracted PNGs preserve alpha transparency for cutout sprites. `environment/background.png` is intentionally opaque because it is a rectangular scene backdrop.

## Extracted Assets

| Category | File | Dimensions | Recommended use |
| --- | --- | ---: | --- |
| Characters | `characters/runner_run_1.png` | 239x324 | Run animation frame 1 |
| Characters | `characters/runner_run_2.png` | 208x289 | Run animation frame 2 |
| Characters | `characters/runner_run_3.png` | 240x284 | Run animation frame 3 |
| Characters | `characters/runner_slide.png` | 338x192 | Slide, dodge, fall, or crash recovery state |
| Collectibles | `collectibles/water_bottle.png` | 96x167 | Health, stamina, or hydration bonus |
| Collectibles | `collectibles/energy_drink.png` | 102x157 | Speed boost, shield, or temporary power-up |
| Obstacles | `obstacles/traffic_cone.png` | 122x159 | Low obstacle; jump over |
| Obstacles | `obstacles/barricade.png` | 256x139 | Wide obstacle; jump timing challenge |
| Environment | `environment/tree.png` | 251x346 | Foreground or midground scenery |
| Environment | `environment/bush_1.png` | 176x85 | Foreground decoration |
| Environment | `environment/bush_2.png` | 188x77 | Foreground decoration variation |
| Environment | `environment/background.png` | 706x192 | Repeating/parallax park backdrop |
| UI | `ui/score_panel.png` | 327x316 | Fixed HUD backing panel |

## PhaserJS Usage Notes

- Load each file with `this.load.image(...)`; these are individual PNG textures, not a Phaser spritesheet.
- Build the run cycle with an animation that references the three separate runner frame keys.
- Use `runner_slide.png` as a distinct texture for a slide/dodge state, a fall state, or a future crouch mechanic.
- Use Arcade Physics groups for obstacles and collectibles. Tune collision bodies manually because the artwork has transparent padding and soft shadows.
- Use `background.png` as a `tileSprite` or repeated parallax strip. Scale it up to match the game viewport.
- Use `tree.png`, `bush_1.png`, and `bush_2.png` as non-colliding scenery with slower scroll speeds for depth.
- Use `score_panel.png` with `setScrollFactor(0)` for HUD placement. The panel has baked-in sample numbers, so overlay live Phaser text or replace it later with a blank panel.

## Recommended Missing Assets

- Additional runner frames: jump, fall, hurt, landing, idle/start pose, and game-over pose.
- More run frames for smoother motion, ideally 6 to 8 frames instead of 3.
- Blank score/HUD panel without baked sample numbers.
- Separate UI icons for lives, distance, pause, resume, retry, sound, and mute.
- Ground/road tile that can repeat cleanly under the runner.
- More obstacle variety: hurdle, signboard, puddle, rolling bottle, and crowd barrier.
- Reward feedback assets: sparkle, pickup burst, speed trail, shield glow, and pickup pop animation.
- Event branding assets: Run For Glory 2026 logo, corporate marathon banner, sponsor/logo slots, and finish-line marker.
- Audio assets: jump, collect, obstacle hit, countdown, milestone, and loopable background music.
