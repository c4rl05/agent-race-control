// The Preview themes' fonts (kickoff doc, "Preview themes"), self-hosted like
// every font here: the CSP forbids remote fonts and the app works offline.
// Latin subset only; the variable cut wherever Fontsource has one (one face
// covers every weight a theme asks for), the static cuts otherwise. Keep this
// in step with previewTheme.ts's THEME_FONTS.
//
// Registering a FontFace costs nothing at startup: a face with a url source
// stays unloaded until text actually uses it, so the 44 families cost installer
// size, not boot time. Inter and IBM Plex Sans live here too — their variable
// cuts replaced the chrome's static 400/600/700 faces, which they cover. The
// terminal monos (main.ts) keep their static faces, untouched.
import interVarNormal from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url'
import interVarItalic from '@fontsource-variable/inter/files/inter-latin-wght-italic.woff2?url'
import interTightVarNormal from '@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2?url'
import interTightVarItalic from '@fontsource-variable/inter-tight/files/inter-tight-latin-wght-italic.woff2?url'
import sourceSerif4VarNormal from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?url'
import sourceSerif4VarItalic from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2?url'
import sourceSans3VarNormal from '@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2?url'
import sourceSans3VarItalic from '@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-italic.woff2?url'
import sourceCodeProVarNormal from '@fontsource-variable/source-code-pro/files/source-code-pro-latin-wght-normal.woff2?url'
import sourceCodeProVarItalic from '@fontsource-variable/source-code-pro/files/source-code-pro-latin-wght-italic.woff2?url'
import literataVarNormal from '@fontsource-variable/literata/files/literata-latin-wght-normal.woff2?url'
import literataVarItalic from '@fontsource-variable/literata/files/literata-latin-wght-italic.woff2?url'
import newsreaderVarNormal from '@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url'
import newsreaderVarItalic from '@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2?url'
import ibmPlexSansVarNormal from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url'
import ibmPlexSansVarItalic from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-italic.woff2?url'
import frauncesVarNormal from '@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url'
import frauncesVarItalic from '@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2?url'
import geistVarNormal from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistVarItalic from '@fontsource-variable/geist/files/geist-latin-wght-italic.woff2?url'
import geistMonoVarNormal from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
import geistMonoVarItalic from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-italic.woff2?url'
import atkinsonHyperlegibleNextVarNormal from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2?url'
import atkinsonHyperlegibleNextVarItalic from '@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-italic.woff2?url'
import atkinsonHyperlegibleMonoVarNormal from '@fontsource-variable/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-wght-normal.woff2?url'
import atkinsonHyperlegibleMonoVarItalic from '@fontsource-variable/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-wght-italic.woff2?url'
import instrumentSansVarNormal from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?url'
import instrumentSansVarItalic from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-italic.woff2?url'
import dmSansVarNormal from '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url'
import dmSansVarItalic from '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-italic.woff2?url'
import figtreeVarNormal from '@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2?url'
import figtreeVarItalic from '@fontsource-variable/figtree/files/figtree-latin-wght-italic.woff2?url'
import spaceGroteskVarNormal from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url'
import hankenGroteskVarNormal from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url'
import hankenGroteskVarItalic from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-italic.woff2?url'
import loraVarNormal from '@fontsource-variable/lora/files/lora-latin-wght-normal.woff2?url'
import loraVarItalic from '@fontsource-variable/lora/files/lora-latin-wght-italic.woff2?url'
import manropeVarNormal from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url'
import karlaVarNormal from '@fontsource-variable/karla/files/karla-latin-wght-normal.woff2?url'
import karlaVarItalic from '@fontsource-variable/karla/files/karla-latin-wght-italic.woff2?url'
import crimsonProVarNormal from '@fontsource-variable/crimson-pro/files/crimson-pro-latin-wght-normal.woff2?url'
import crimsonProVarItalic from '@fontsource-variable/crimson-pro/files/crimson-pro-latin-wght-italic.woff2?url'
import workSansVarNormal from '@fontsource-variable/work-sans/files/work-sans-latin-wght-normal.woff2?url'
import workSansVarItalic from '@fontsource-variable/work-sans/files/work-sans-latin-wght-italic.woff2?url'
import redHatTextVarNormal from '@fontsource-variable/red-hat-text/files/red-hat-text-latin-wght-normal.woff2?url'
import redHatTextVarItalic from '@fontsource-variable/red-hat-text/files/red-hat-text-latin-wght-italic.woff2?url'
import redHatDisplayVarNormal from '@fontsource-variable/red-hat-display/files/red-hat-display-latin-wght-normal.woff2?url'
import redHatDisplayVarItalic from '@fontsource-variable/red-hat-display/files/red-hat-display-latin-wght-italic.woff2?url'
import redHatMonoVarNormal from '@fontsource-variable/red-hat-mono/files/red-hat-mono-latin-wght-normal.woff2?url'
import redHatMonoVarItalic from '@fontsource-variable/red-hat-mono/files/red-hat-mono-latin-wght-italic.woff2?url'
import bricolageGrotesqueVarNormal from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url'
import martianMonoVarNormal from '@fontsource-variable/martian-mono/files/martian-mono-latin-wght-normal.woff2?url'
import merriweatherVarNormal from '@fontsource-variable/merriweather/files/merriweather-latin-wght-normal.woff2?url'
import merriweatherVarItalic from '@fontsource-variable/merriweather/files/merriweather-latin-wght-italic.woff2?url'
import libreFranklinVarNormal from '@fontsource-variable/libre-franklin/files/libre-franklin-latin-wght-normal.woff2?url'
import libreFranklinVarItalic from '@fontsource-variable/libre-franklin/files/libre-franklin-latin-wght-italic.woff2?url'
import publicSansVarNormal from '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2?url'
import publicSansVarItalic from '@fontsource-variable/public-sans/files/public-sans-latin-wght-italic.woff2?url'
import onestVarNormal from '@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url'
import gelasioVarNormal from '@fontsource-variable/gelasio/files/gelasio-latin-wght-normal.woff2?url'
import gelasioVarItalic from '@fontsource-variable/gelasio/files/gelasio-latin-wght-italic.woff2?url'
import ibmPlexSerif400Normal from '@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-normal.woff2?url'
import ibmPlexSerif500Normal from '@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-500-normal.woff2?url'
import ibmPlexSerif600Normal from '@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-600-normal.woff2?url'
import ibmPlexSerif700Normal from '@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-700-normal.woff2?url'
import ibmPlexSerif400Italic from '@fontsource/ibm-plex-serif/files/ibm-plex-serif-latin-400-italic.woff2?url'
import instrumentSerif400Normal from '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url'
import instrumentSerif400Italic from '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2?url'
import dmSerifDisplay400Normal from '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff2?url'
import dmSerifDisplay400Italic from '@fontsource/dm-serif-display/files/dm-serif-display-latin-400-italic.woff2?url'
import dmMono300Normal from '@fontsource/dm-mono/files/dm-mono-latin-300-normal.woff2?url'
import dmMono400Normal from '@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2?url'
import dmMono500Normal from '@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2?url'
import dmMono400Italic from '@fontsource/dm-mono/files/dm-mono-latin-400-italic.woff2?url'
import spaceMono400Normal from '@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?url'
import spaceMono700Normal from '@fontsource/space-mono/files/space-mono-latin-700-normal.woff2?url'
import spaceMono400Italic from '@fontsource/space-mono/files/space-mono-latin-400-italic.woff2?url'
import spectral300Normal from '@fontsource/spectral/files/spectral-latin-300-normal.woff2?url'
import spectral400Normal from '@fontsource/spectral/files/spectral-latin-400-normal.woff2?url'
import spectral500Normal from '@fontsource/spectral/files/spectral-latin-500-normal.woff2?url'
import spectral600Normal from '@fontsource/spectral/files/spectral-latin-600-normal.woff2?url'
import spectral700Normal from '@fontsource/spectral/files/spectral-latin-700-normal.woff2?url'
import spectral400Italic from '@fontsource/spectral/files/spectral-latin-400-italic.woff2?url'
import youngSerif400Normal from '@fontsource/young-serif/files/young-serif-latin-400-normal.woff2?url'

const FACES: [family: string, weight: string, style: 'normal' | 'italic', url: string][] = [
  ['Inter', '100 900', 'normal', interVarNormal],
  ['Inter', '100 900', 'italic', interVarItalic],
  ['Inter Tight', '100 900', 'normal', interTightVarNormal],
  ['Inter Tight', '100 900', 'italic', interTightVarItalic],
  ['Source Serif 4', '100 900', 'normal', sourceSerif4VarNormal],
  ['Source Serif 4', '100 900', 'italic', sourceSerif4VarItalic],
  ['Source Sans 3', '100 900', 'normal', sourceSans3VarNormal],
  ['Source Sans 3', '100 900', 'italic', sourceSans3VarItalic],
  ['Source Code Pro', '100 900', 'normal', sourceCodeProVarNormal],
  ['Source Code Pro', '100 900', 'italic', sourceCodeProVarItalic],
  ['Literata', '100 900', 'normal', literataVarNormal],
  ['Literata', '100 900', 'italic', literataVarItalic],
  ['Newsreader', '100 900', 'normal', newsreaderVarNormal],
  ['Newsreader', '100 900', 'italic', newsreaderVarItalic],
  ['IBM Plex Sans', '100 900', 'normal', ibmPlexSansVarNormal],
  ['IBM Plex Sans', '100 900', 'italic', ibmPlexSansVarItalic],
  ['Fraunces', '100 900', 'normal', frauncesVarNormal],
  ['Fraunces', '100 900', 'italic', frauncesVarItalic],
  ['Geist', '100 900', 'normal', geistVarNormal],
  ['Geist', '100 900', 'italic', geistVarItalic],
  ['Geist Mono', '100 900', 'normal', geistMonoVarNormal],
  ['Geist Mono', '100 900', 'italic', geistMonoVarItalic],
  ['Atkinson Hyperlegible Next', '100 900', 'normal', atkinsonHyperlegibleNextVarNormal],
  ['Atkinson Hyperlegible Next', '100 900', 'italic', atkinsonHyperlegibleNextVarItalic],
  ['Atkinson Hyperlegible Mono', '100 900', 'normal', atkinsonHyperlegibleMonoVarNormal],
  ['Atkinson Hyperlegible Mono', '100 900', 'italic', atkinsonHyperlegibleMonoVarItalic],
  ['Instrument Sans', '100 900', 'normal', instrumentSansVarNormal],
  ['Instrument Sans', '100 900', 'italic', instrumentSansVarItalic],
  ['DM Sans', '100 900', 'normal', dmSansVarNormal],
  ['DM Sans', '100 900', 'italic', dmSansVarItalic],
  ['Figtree', '100 900', 'normal', figtreeVarNormal],
  ['Figtree', '100 900', 'italic', figtreeVarItalic],
  ['Space Grotesk', '100 900', 'normal', spaceGroteskVarNormal],
  ['Hanken Grotesk', '100 900', 'normal', hankenGroteskVarNormal],
  ['Hanken Grotesk', '100 900', 'italic', hankenGroteskVarItalic],
  ['Lora', '100 900', 'normal', loraVarNormal],
  ['Lora', '100 900', 'italic', loraVarItalic],
  ['Manrope', '100 900', 'normal', manropeVarNormal],
  ['Karla', '100 900', 'normal', karlaVarNormal],
  ['Karla', '100 900', 'italic', karlaVarItalic],
  ['Crimson Pro', '100 900', 'normal', crimsonProVarNormal],
  ['Crimson Pro', '100 900', 'italic', crimsonProVarItalic],
  ['Work Sans', '100 900', 'normal', workSansVarNormal],
  ['Work Sans', '100 900', 'italic', workSansVarItalic],
  ['Red Hat Text', '100 900', 'normal', redHatTextVarNormal],
  ['Red Hat Text', '100 900', 'italic', redHatTextVarItalic],
  ['Red Hat Display', '100 900', 'normal', redHatDisplayVarNormal],
  ['Red Hat Display', '100 900', 'italic', redHatDisplayVarItalic],
  ['Red Hat Mono', '100 900', 'normal', redHatMonoVarNormal],
  ['Red Hat Mono', '100 900', 'italic', redHatMonoVarItalic],
  ['Bricolage Grotesque', '100 900', 'normal', bricolageGrotesqueVarNormal],
  ['Martian Mono', '100 900', 'normal', martianMonoVarNormal],
  ['Merriweather', '100 900', 'normal', merriweatherVarNormal],
  ['Merriweather', '100 900', 'italic', merriweatherVarItalic],
  ['Libre Franklin', '100 900', 'normal', libreFranklinVarNormal],
  ['Libre Franklin', '100 900', 'italic', libreFranklinVarItalic],
  ['Public Sans', '100 900', 'normal', publicSansVarNormal],
  ['Public Sans', '100 900', 'italic', publicSansVarItalic],
  ['Onest', '100 900', 'normal', onestVarNormal],
  ['Gelasio', '100 900', 'normal', gelasioVarNormal],
  ['Gelasio', '100 900', 'italic', gelasioVarItalic],
  ['IBM Plex Serif', '400', 'normal', ibmPlexSerif400Normal],
  ['IBM Plex Serif', '500', 'normal', ibmPlexSerif500Normal],
  ['IBM Plex Serif', '600', 'normal', ibmPlexSerif600Normal],
  ['IBM Plex Serif', '700', 'normal', ibmPlexSerif700Normal],
  ['IBM Plex Serif', '400', 'italic', ibmPlexSerif400Italic],
  ['Instrument Serif', '400', 'normal', instrumentSerif400Normal],
  ['Instrument Serif', '400', 'italic', instrumentSerif400Italic],
  ['DM Serif Display', '400', 'normal', dmSerifDisplay400Normal],
  ['DM Serif Display', '400', 'italic', dmSerifDisplay400Italic],
  ['DM Mono', '300', 'normal', dmMono300Normal],
  ['DM Mono', '400', 'normal', dmMono400Normal],
  ['DM Mono', '500', 'normal', dmMono500Normal],
  ['DM Mono', '400', 'italic', dmMono400Italic],
  ['Space Mono', '400', 'normal', spaceMono400Normal],
  ['Space Mono', '700', 'normal', spaceMono700Normal],
  ['Space Mono', '400', 'italic', spaceMono400Italic],
  ['Spectral', '300', 'normal', spectral300Normal],
  ['Spectral', '400', 'normal', spectral400Normal],
  ['Spectral', '500', 'normal', spectral500Normal],
  ['Spectral', '600', 'normal', spectral600Normal],
  ['Spectral', '700', 'normal', spectral700Normal],
  ['Spectral', '400', 'italic', spectral400Italic],
  ['Young Serif', '400', 'normal', youngSerif400Normal]
]

export function registerPreviewFonts(): void {
  for (const [family, weight, style, url] of FACES) {
    document.fonts.add(new FontFace(family, `url(${url})`, { weight, style, display: 'swap' }))
  }
}
