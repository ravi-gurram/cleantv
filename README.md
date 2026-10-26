# CleanTV

A clean, ad-free home screen for Samsung Tizen TVs, packaged as a [TizenBrew](https://github.com/reisxd/TizenBrew) app module.

- Glass look: deep-navy background, a glass dock, and a floating glass highlight
  (translucent fill, bright top sheen, crisp rim tinted to the app, faint glow) that
  glides between tiles. Drawn without blur, so it runs on 2018 Tizen TVs.
- A "horizon" glow in the selected app's colour rises behind the dock.
- Greeting, thin clock and date; the selected app's name in large type.
- A short "More apps" grid slides up when you press Down.
- Icon-only Inputs button at the top right (press Up from the dock).
- Navigate with the remote's arrows and OK. Back jumps to the first dock tile.

Built for a 2018 Samsung UN50NU6900 (Tizen 4). The app IDs in `app/js/apps.js` were read from that TV.

## Install on the TV

1. Install TizenBrew on the TV (TizenBrew Installer).
2. Open TizenBrew → **Module Manager** → add a **GitHub** module: `ravi-gurram/cleantv@v1.1.0`
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

Edit `app/js/apps.js` (dock favourites, the More apps grid, colours and app IDs), commit, tag a new version, and re-add the module in TizenBrew with the new tag.

## Licence

MIT
