#!/usr/bin/env zx
import 'zx/globals'
import { minimatch } from 'minimatch'
import cfg from '../rome.json' assert { type: 'json' }

// Append stars
const ignored = cfg.files.ignore.concat(
  cfg.files.ignore.filter((p) => !p.endsWith('**')).map((p) => `${p}/**`),
)

const reExtension = /.+\.[cm]?[jt]s$/

const filtered = argv._.map((path) =>
  path.startsWith('./') ? path : `./${path}`,
)
  .filter((path) => !ignored.some((ignored) => minimatch(path, ignored, { dot: true })))
  .filter((path) => reExtension.test(path))

if (filtered.length) {
  await $`ROME_TARGETS="${filtered}" && npx rome format --write $ROME_TARGETS && npx rome check --apply $ROME_TARGETS && git add $ROME_TARGETS`
}
