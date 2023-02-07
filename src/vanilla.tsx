import Clippy from './components/Clippy'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'

let root: Root
let isInitialized = false

const init = (): void => {
	if (isInitialized) throw new Error('Clippy is already initialized')

	const startApp = () => {
		try {
			if (!isInitialized) {
				const node = document.createElement('div')
				node.id = 'clippy-widget'
				document.body.appendChild(node)

				root = createRoot(node)
				root.render(<Clippy />)

				isInitialized = true
			}
		} catch (error) {
			console.error('Error while rendering Clippy', error)
		}
	}

	if (/complete|interactive|loaded/.test(document.readyState)) {
		// In case the document has finished parsing, document's readyState will
		// Be one of "complete", "interactive" or (non-standard) "loaded".
		startApp()
	} else {
		// The document is not ready yet, so wait for the DOMContentLoaded event
		document.addEventListener('DOMContentLoaded', startApp, false)
	}
}

init()
