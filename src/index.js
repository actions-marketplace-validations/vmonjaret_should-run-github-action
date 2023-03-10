// @ts-check
const core = require('@actions/core')
const debug = require('debug')('should-run-github-action')


const target = core.getInput('target');
if (target === '') {
  console.log('target is required');
  process.exit(0);
}

if (!process.env.GITHUB_EVENT) {
  console.log('GITHUB_EVENT is not defined')
  process.exit(0)
}
const ghEvent = JSON.parse(process.env.GITHUB_EVENT)

let branch
if (ghEvent.pull_request) {
  debug('pull_request event')
  branch = ghEvent.pull_request.head.ref
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
} else {
  debug('push event branch "%s"', ghEvent.ref)
  branch = ghEvent.ref.replace('refs/heads/', '')
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
}

if (ghEvent.action !== 'edited') {
  debug('GITHUB_EVENT.action is not edited')
  process.exit(0)
}

// TODO check if this was really an edit of the PR body
debug('PR body before')
debug(ghEvent.changes.body.from)
debug('PR body after')
debug(ghEvent.pull_request.body)
const commit = ghEvent.pull_request.head.sha
debug('PR head commit SHA %s', commit)

const checkboxUnfilled = '[ ]'
const checkboxFilled = '[x]'

if (
  ghEvent.changes.body.from.includes(`${checkboxUnfilled} ${target}`) &&
  ghEvent.pull_request.body.includes(`${checkboxFilled} ${target}`)
) {
  console.log(
    'Should run GH action on branch "%s" and commit %s',
    branch,
    commit,
  )
  core.setOutput('shouldRun', true)
  core.setOutput('commit', commit)
} else {
  console.log('Should not run GH action')
  core.setOutput('shouldRun', false)
}
