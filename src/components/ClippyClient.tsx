import { ClippyStore } from '@/lib/store'
import { FC, memo, useEffect } from 'react'

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
		if (document.getElementById('clippy-script')) return

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

export default memo(ClippyClient)
