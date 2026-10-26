/* CleanTV app configuration — edit this file to change your home screen.
 *
 * FAVOURITES: the first shelf row, in this order.
 *   ids    — app IDs read from this TV (UN50NU6900); tried in order until one opens.
 *   colors — tile gradient [top-left, bottom-right]; the background tints to colors[0].
 *
 * EXTRAS: shown in "All apps" if the installed-app list can't be read.
 * HIDE:   apps whose names match any of these never appear in "All apps".
 */
var CLEANTV_FAVOURITES = [
  { label: 'YouTube',     colors: ['#ff3b30', '#b3120a'], ids: ['9Ur5IzDKqV.TizenYouTube', 'com.samsung.tv.cobalt-yt'] },
  { label: 'Netflix',     colors: ['#2a0a0c', '#000000'], text: '#e50914', ids: ['org.tizen.netflix-app', 'RN1MCdNq8t.Netflix'] },
  { label: 'Prime Video', colors: ['#1aa3ff', '#0b4f8a'], ids: ['evKhCgZelL.AmazonIgnitionLauncher2', 'org.tizen.ignition'] },
  { label: 'Apple TV',    colors: ['#3a3a3e', '#0c0c0e'], ids: ['com.samsung.tv.aria-video'] },
  { label: 'Disney+',     colors: ['#1d4fd8', '#0a1a5c'], ids: ['MCmYXNxgcu.DisneyPlus'] },
  { label: 'Hulu',        colors: ['#1ce783', '#0a7a45'], text: '#0b1d12', ids: ['LBUAQX1exg.Hulu'] }
];

var CLEANTV_EXTRAS = [
  { label: 'Peacock',      ids: ['gzcc4LRFBF.Peacock'] },
  { label: 'YouTube TV',   ids: ['com.samsung.tv.cobalt-yttv'] },
  { label: 'YouTube Kids', ids: ['com.samsung.tv.cobalt-ytkids'] },
  { label: 'Live TV',      ids: ['org.tizen.tv-viewer'] },
  { label: 'Internet',     ids: ['org.tizen.browser'] },
  { label: 'Gallery',      ids: ['com.samsung.tv.mycontents'] }
];

/* Always shown at the start of "All apps". */
var CLEANTV_ALWAYS = [
  { label: 'Live TV', ids: ['org.tizen.tv-viewer'] }
];

/* Friendlier names for apps whose installed names are raw IDs. */
var CLEANTV_RENAME = {
  'YoutubeKids': 'YouTube Kids',
  'YoutubeTV': 'YouTube TV',
  'org.tizen.mycontents': 'Gallery',
  'Peacock TV': 'Peacock'
};

var CLEANTV_HIDE = [
  /cleantv/i, /tizenbrew/i, /samsung\s*tv\s*plus/i, /promotion/i, /e-?manual/i,
  /googleplaymovie/i, /airplay/i,
  /service/i, /daemon/i, /widget/i, /setting/i, /test/i, /^app$/i, /^ui-application$/i,
  /keyboard/i, /player/i, /chromium/i, /popup/i, /^\s*$/
];
