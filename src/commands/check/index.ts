import {Args, Command, Flags, ux} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import {inRange, isFulfilled} from '../../utils/index.js'
import {prettyLogger} from '../../utils/pretty-logger.js'

export default class Check extends Command {
  static args = {
    path: Args.file({
      default: './README.md',
      description: 'Path to the file to check',
      required: true,
    }),
  }

  static description =
    'Check links in a file for their status. Fails if any links are broken (not HTTP 200-299).'

  static flags = {
    pass: Flags.integer({
      description: 'Specify a status that should pass the check',
      required: false,
      multiple: true,
      min: 100,
      max: 599,
      exclusive: ['only'],
      aliases: ['allow'],
    }),
    fail: Flags.integer({
      description: 'Specify a status that should fail the check',
      required: false,
      multiple: true,
      min: 100,
      max: 599,
      exclusive: ['only'],
      aliases: ['deny'],
    }),
    only: Flags.integer({
      description: 'Specify a status code that should be the only one to pass the check',
      required: false,
      min: 100,
      max: 599,
      exclusive: ['pass', 'fail'],
      aliases: ['just'],
    }),
    affectExit: Flags.boolean({
      description: 'Exit with a non-zero exit code if any links are broken',
      required: false,
    }),
    plain: Flags.boolean({
      description: 'Just print broken links (newline separated)',
      required: false,
    }),
  }

  prettyLog = prettyLogger

  static async checkLinks(links: RegExpExecArray[]) {
    const promises = links.map(async (link) => {
      const response = await fetch(link[2])
      return {
        link: link[2],
        status: response.status,
      }
    })
    return Promise.allSettled(promises)
  }

  static filterfulfilledResults(
    result: PromiseFulfilledResult<{link: string; status: number}>,
    flags: {fail?: number[]; only?: number; pass?: number[]},
    forwards = true,
  ) {
    let pass = false
    let fail = false

    if (flags.only !== undefined) {
      return result.value.status === flags.only ? forwards : !forwards
    }

    if (flags.fail !== undefined) {
      fail = Array.isArray(flags.fail)
        ? flags.fail.includes(result.value.status)
        : flags.fail === result.value.status
        ? forwards
        : !forwards
    }

    if (flags.pass !== undefined) {
      pass = Array.isArray(flags.pass)
        ? flags.pass.includes(result.value.status)
        : flags.pass === result.value.status
        ? forwards
        : !forwards
    }

    if (inRange(result.value.status, 200, 299) || pass) {
      if (flags.fail !== undefined && fail) return !forwards
      return forwards
    }

    return !forwards
  }

  static findLinks(content: string) {
    const regex = /\[([^[]+)]\(([^)]+)\)/g
    const links = []
    let match
    while ((match = regex.exec(content))) {
      links.push(match)
    }

    return links
  }

  async run(): Promise<void> {
    // check if node version is compatible
    const [major] = process.versions.node.split('.').map((v) => parseInt(v, 10))
    if (major < 18) {
      this.prettyLog.error('Incompatible Node Version: Node version must be >= 18.x')
      this.exit(1)
    }

    // parse the arguments and flags
    const {args, flags} = await this.parse(Check)

    this.prettyLog.action.shouldLog = !flags.plain
    this.prettyLog.action.start('Reading file')

    const file = await readFile(args.path, 'utf8').catch((error) => {
      this.prettyLog.error(error.message)
      this.exit(1)
    })

    this.prettyLog.action.stop()

    this.prettyLog.action.start(`Checking links in ${args.path}`)

    // find all links in the file
    const links = Check.findLinks(file)

    const results = await Check.checkLinks(links)
    const fulfilledResults = results.filter(isFulfilled)

    this.prettyLog.action.stop()

    const goodLinks = fulfilledResults.filter((result) => Check.filterfulfilledResults(result, flags))

    const workingLinksInfo = `${goodLinks.length} out of ${fulfilledResults.length} links are working!`

    goodLinks.length > 0
      ? this.prettyLog.success(workingLinksInfo, !flags.plain)
      : this.prettyLog.warn(workingLinksInfo, !flags.plain)

    const badLinks = fulfilledResults
      .filter((result) => Check.filterfulfilledResults(result, flags, false))
      .map((result) => result.value)

    if (badLinks.length > 0) {
      this.prettyLog.warn(`${badLinks.length} links are broken!`, !flags.plain)

      // print out the broken links
      if (flags.plain) {
        this.log(badLinks.map((link) => link.link).join('\n'))
      } else {
        this.log('\n\nBroken Links:\n')
        ux.table(badLinks, {
          link: {
            minWidth: 20,
          },
          status: {
            minWidth: 10,
          },
        })
        this.log('\n')
      }

      // exit with a non-zero exit code if the fail flag is set
      this.exit(flags.affectExit ? 1 : 0)
    }
  }
}
