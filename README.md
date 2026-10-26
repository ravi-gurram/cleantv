# CleanTV

A clean, ad-free home screen for Samsung Tizen TVs, packaged as a [TizenBrew](https://github.com/reisxd/TizenBrew) app module.

- Big title area for the selected app, with the background tinted to match it.
- First row: your favourite streaming apps. Second row and below: every other installed app, plus Live TV.
- Navigate with the remote's arrows and OK. Back jumps to the first tile.

Built for a 2018 Samsung UN50NU6900 (Tizen 4). The app IDs in `app/js/apps.js` were read from that TV.

## Install on the TV

1. Install TizenBrew on the TV (TizenBrew Installer).
2. Open TizenBrew → **Module Manager** → add a **GitHub** module: `ravi-gurram/cleantv@v1.0.0`
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

Edit `app/js/apps.js` (favourites, colours, renamed or hidden apps), commit, tag a new version, and re-add the module in TizenBrew with the new tag.

## Licence

MIT
