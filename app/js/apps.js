/* CleanTV app configuration — edit this file to change your home screen.
 * App IDs were read from this TV (UN50NU6900); each app's IDs are tried in order.
 * colors: tile gradient [top-left, bottom-right]; the background glow uses colors[0].
 */

/* The dock: your favourites, in this order (6 fit). */
var CLEANTV_DOCK = [
  { label: 'YouTube',     colors: ['#ff3b30', '#b3120a'], ids: ['9Ur5IzDKqV.TizenYouTube', 'com.samsung.tv.cobalt-yt'] },
  { label: 'Netflix',     colors: ['#2a0a0c', '#000000'], text: '#e50914', ids: ['org.tizen.netflix-app', 'RN1MCdNq8t.Netflix'] },
  { label: 'Prime Video', colors: ['#1aa3ff', '#0b4f8a'], ids: ['evKhCgZelL.AmazonIgnitionLauncher2', 'org.tizen.ignition'] },
  { label: 'Apple TV',    colors: ['#3a3a3e', '#0c0c0e'], ids: ['com.samsung.tv.aria-video'] },
  { label: 'Disney+',     colors: ['#1d4fd8', '#0a1a5c'], ids: ['MCmYXNxgcu.DisneyPlus'] },
  { label: 'Hulu',        colors: ['#1ce783', '#0a7a45'], text: '#0b1d12', ids: ['LBUAQX1exg.Hulu'] }
];

/* The grid below the dock (press Down). Only these apps appear — add or remove lines to change it. */
var CLEANTV_GRID = [
  { label: 'Peacock',      colors: ['#2b2b2f', '#0d0d10'], ids: ['gzcc4LRFBF.Peacock'] },
  { label: 'YouTube TV',   colors: ['#ff453a', '#7a0d07'], ids: ['com.samsung.tv.cobalt-yttv'] },
  { label: 'YouTube Kids', colors: ['#ff6b5e', '#b0261b'], ids: ['com.samsung.tv.cobalt-ytkids'] },
  { label: 'Internet',     colors: ['#30b0c7', '#11505c'], ids: ['org.tizen.browser'] }
];

/* Also add the TV's other installed apps to "More apps" (store apps only; system services hidden). */
var CLEANTV_AUTO_APPS = true;

/* Installed apps whose names match any of these never appear. Add a name here to hide an app. */
var CLEANTV_HIDE = [
  /service/i, /extension/i, /cmswebapp/i, /tizenbrew/i, /cleantv/i, /epop/i, /launcher/i,
  /e-?manual/i, /airplay/i, /smart\s*stb/i, /test/i, /^app$/i, /samsung\s*tv\s*plus/i, /gallery|mycontents/i
];

/* Friendlier names for apps whose installed names are odd. */
var CLEANTV_RENAME = { 'YoutubeKids': 'YouTube Kids', 'YoutubeTV': 'YouTube TV', 'Peacock TV': 'Peacock' };

/* Small buttons at the top right (press Up from the dock). */
var CLEANTV_PILLS = [
  { label: 'Inputs', icon: 'inputs', colors: ['#8e8e93'], ids: ['org.tizen.SMSourceAPP'] }
];

/* Where Back goes when you leave CleanTV: Samsung's home screen (Smart Hub). IDs tried in order. */
var CLEANTV_EXIT_TO = ['com.samsung.tv.csfs', 'org.tizen.tv-viewer'];

/* Clock screensaver: minutes of no remote activity on CleanTV before it appears (0 = off). */
var CLEANTV_SCREENSAVER_MINUTES = 5;
