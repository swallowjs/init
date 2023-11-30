import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: process.env.GITHUB_AUTH_TOKEN })

const GULP_REPOS_FILE = './gulp-repos.json'
const GARDEN_FILE = './garden.yaml'

{
	if (!existsSync(GULP_REPOS_FILE)) {
		const gulpRepos = []
		const iterator = octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
			org: 'gulpjs'
		})
		for await (const { data: repos } of iterator) {
			for (const repo of repos) {
				gulpRepos.push(repo)
			}
		}
		await fs.writeFile(GULP_REPOS_FILE, JSON.stringify({ repos: gulpRepos }, null, '\t'))
	}
}

const gulpRepos = JSON.parse(await fs.readFile(GULP_REPOS_FILE, 'utf-8'))
for (const repo of gulpRepos.repos) {
	const full_name = repo.full_name.replaceAll('gulp', 'swallow')
	console.log(full_name)
}

let yamlContent = `---
garden:
  root: '\${GARDEN_CONFIG_DIR}'

trees:
`
for (const repo of gulpRepos.repos) {
	const full_name = repo.full_name.replaceAll('gulp', 'swallow')
	yamlContent += `  ${full_name}:
    url: 'https://github.com/${repo.full_name}'\n`
}
yamlContent += `
groups:
  all:
`
for (const repo of gulpRepos.repos) {
	const full_name = repo.full_name.replaceAll('gulp', 'swallow')
	yamlContent += `    - '${full_name}'\n`
}
yamlContent += `
gardens:
  all:
    groups: 'all'
`
await fs.writeFile(GARDEN_FILE, yamlContent)
