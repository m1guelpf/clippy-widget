import { References } from '@/types'

export const search = async (query: string): Promise<References> => {
	const response = await fetch(`https://api.clippy.help/widget/search`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ query }),
	})

	if (response.ok) return response.json()

	throw new Error('Something went wrong! Please try again.')
}
