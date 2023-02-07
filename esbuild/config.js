import fs from 'fs'
import { createRequire } from 'node:module'
import { transformFileAsync as babelTransformFileAsync } from '@babel/core'
const require = createRequire(import.meta.url)

const packageJson = require('../package.json')

/**
 * @type {import('esbuild').Plugin}
 */
const babelTransforms = {
	name: 'babelTransformations',
	setup(build) {
		if (!build.initialOptions.minify) return

		build.onLoad({ filter: /\.tsx/i }, async args => {
			const result = await babelTransformFileAsync(args.path, {
				plugins: [['@babel/plugin-syntax-typescript', { isTSX: true }]],
				configFile: false,
				babelrc: false,
			})
			return { contents: result.code, loader: 'tsx' }
		})
	},
}

const styleLoader = {
	name: 'style',
	setup(build) {
		build.onLoad({ filter: /\.css$/ }, async args => {
			const contents = await fs.promises.readFile(args.path, 'utf8')
			return {
				contents: `
					const styles = \`${contents.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`
					export default (props) => (<style {...props}>{styles}</style>)
                `,
				loader: 'jsx',
			}
		})
	},
}

export default /** @type {import('esbuild').BuildOptions} */ ({
	bundle: true,
	loader: {},
	logLevel: 'info',
	define: {
		global: 'globalThis',
		ClippyVersion: JSON.stringify(packageJson.version),
	},
	entryPoints: [require.resolve('../src/index.ts')],
	globalName: 'Clippy',
	inject: [require.resolve('./react-shim.js')],
	target: ['chrome58', 'firefox57', 'safari11', 'edge18'],
	plugins: [styleLoader, babelTransforms],
})
