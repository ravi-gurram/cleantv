# CleanTV

A clean, ad-free home screen for Samsung Tizen TVs, packaged as a [TizenBrew](https://github.com/reisxd/TizenBrew) app module.

- Glass look: deep-navy background, a glass dock, and a floating glass highlight
  (translucent fill, bright top sheen, crisp rim tinted to the app, faint glow) that
  glides between tiles. Drawn without blur, so it runs on 2018 Tizen TVs.
- A "horizon" glow in the selected app's colour rises behind the dock.
- Greeting, thin clock and date; the selected app's name in large type.
- A "More apps" grid slides up when you press Down: your chosen extras plus any store
  apps installed on the TV (system services are filtered out).
- Clock screensaver after 5 idle minutes: a thin clock drifting over black.
- Icon-only Inputs button at the top right (press Up from the dock).
- Navigate with the remote's arrows and OK. Back jumps to the first dock tile; Back twice more leaves CleanTV for Samsung's home screen.

Built for a 2018 Samsung UN50NU6900 (Tizen 4). The app IDs in `app/js/apps.js` were read from that TV.

## Install on the TV

1. Install TizenBrew on the TV (TizenBrew Installer).
2. Open TizenBrew → **Module Manager** → add a **GitHub** module: `ravi-gurram/cleantv@v1.2.1`
3. Open **CleanTV** from TizenBrew.
4. Optional: TizenBrew **Settings → Autolaunch → CleanTV**, so TizenBrew opens straight into it.

## How it works

The page (`app/`) can't call the TV's `tizen` APIs directly, so `service.js` runs inside TizenBrew's Node service and exposes a localhost-only API on port 8095:

| Endpoint | Purpose |
| --- | --- |
| `GET /status` | Service health |
| `GET /apps` | Installed apps |
| `GET /launch?id=APPID` | Open an app |

## Customise

Edit `app/js/apps.js`: dock favourites, the More apps list, `CLEANTV_AUTO_APPS` (add installed
apps automatically), `CLEANTV_HIDE` (names to hide), and `CLEANTV_SCREENSAVER_MINUTES` (0 = off), commit, tag a new version, and re-add the module in TizenBrew with the new tag.

## Licence

MIT

## Cinematic home (1.3.0)

Six favourites use bundled brand artwork. Landscape backgrounds are bundled with the module and crossfade every 60 seconds; no remote image service or video stream is needed. Edit `CLEANTV_BACKGROUNDS` and `CLEANTV_BACKGROUND_SECONDS` in `app/js/apps.js` to change them (0 pauses rotation). Rotation pauses while the launcher is hidden or its clock screensaver is active.

Remote controls: Left/Right choose an app, OK opens it, Down opens More apps, Up from the favourites opens Inputs, and Back returns to the first favourite. Back twice there exits. The clock screensaver remains enabled after five idle minutes.

Inputs now opens a CleanTV picker backed by the platform's VIDEOSOURCE and tvwindow APIs. If TizenBrew does not expose these APIs or the necessary privilege, the picker shows an error and directs you to the remote's Source button. Switching and viewer handoff still require testing on the TV.

For a desktop preview, serve `app/` and open it with `?preview=1`. Preview mode disables device calls and explicitly labels app launch attempts. The production module does not use this query parameter.

Regression checks: `node tests/sources.js` and `node tests/input-ui.js`. These simulate the Tizen APIs and browser DOM; they do not certify TV performance or firmware compatibility. Asset sources are listed in `ASSETS.md`.
