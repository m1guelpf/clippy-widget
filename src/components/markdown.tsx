import { AnchorHTMLAttributes } from 'react'

const components = {
	a: ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
		<a href={href} target={href?.startsWith('/') ? '' : '_blank'} rel="noopener noreferrer" className="underline">
			{children}
		</a>
	),
}

export default components
