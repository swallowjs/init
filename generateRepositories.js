import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: process.env.GITHUB_AUTH_TOKEN_WRITE })

const GULP_REPOS_FILE = './gulp-repos.json'

const gulpRepos = JSON.parse(await fs.readFile(GULP_REPOS_FILE, 'utf-8'))



for (const repo of gulpRepos.repos) {
	const org = 'swallowjs'
	const name = repo.name.replaceAll('gulp', 'swallow')
	
	try {
		await octokit.rest.repos.get({
			org,
			owner: name
		})
		console.log(`Repository already exists: ${org}/${name}`)
	} catch (err) {
		if (err.status === 404) {
			console.log(`Creating repository: ${org}/${name}`)
			await octokit.rest.repos.createInOrg({
				org,
				name,
			})
		} else {
			console.log(`Repository already exists: ${org}/${name}`)
		}
	}
}
