import { useEffect } from 'react'

const ClippyClient = () => {
	useEffect(() => {
		if (document.getElementById('clippy-widget')) return

		const script = document.createElement('script')
		script.src = 'https://unpkg.com/clippy-widget'
		script.async = true
		script.id = 'clippy-widget'
		document.body.appendChild(script)
	}, [])

	return null
}

export default ClippyClient
