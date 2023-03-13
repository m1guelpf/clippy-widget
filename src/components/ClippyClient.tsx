import { FC, useEffect } from 'react'
import { ClippyStore } from '@/lib/store'

declare global {
	interface Window {
		Clippy?: {
			setTheme: (theme?: ClippyStore['theme']) => void
		}
	}
}

type Props = {
	theme?: ClippyStore['theme']
}

const ClippyClient: FC<Props> = ({ theme }) => {
	useEffect(() => {
		if (document.getElementById('clippy-widget')) return

		const script = document.createElement('script')
		script.src = 'https://unpkg.com/clippy-widget'
		script.async = true
		script.id = 'clippy-script'
		if (theme) script.setAttribute('data-theme', theme)
		document.body.appendChild(script)
	}, [])

	useEffect(() => {
		window.Clippy?.setTheme(theme)
	}, [theme])

	return null
}

export default ClippyClient
