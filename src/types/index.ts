export type WidgetData = {
	id: string
	image_url: string
	copy: {
		title: string
		subtitle: string
		cta: string
		placeholder: string
		loading: string
	}
}

export type References = Array<{
	path: string
	text: string
	page_title: string
	title: string | null
}>
