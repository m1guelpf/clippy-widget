import useSWRImmutable from 'swr/immutable'
import root from 'react-shadow'
import Styles from '@build/index.css'
import SendIcon from './Icons/SendIcon'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, memo, useCallback, useState } from 'react'

type ClippyResponse = {
	answer: string
	sources: Array<{
		page: string
		path: string
		title: string
	}>
}

type WidgetData = {
    id: string,
    imageUrl: string,
    copy: {
        title: string,
        subtitle: string,
        cta: string,
        placeholder: string,
        loading: string,
    }
}

const Clippy = () => {
    const [query, setQuery] = useState('')
	const [isOpen, setOpen] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const [response, setResponse] = useState<ClippyResponse | null>(null)
    const { data } = useSWRImmutable<WidgetData>('https://api.clippy.help/widget', url => fetch(url).then(res => res.json()), { revalidateOnMount: true })

	const toggleOpen = useCallback(() => {
		setOpen(state => !state)
		setResponse(null)
	}, [])

	const askQuestion = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!query) return

			setLoading(true)

			const response = await fetch(`https://api.clippy.help/${data?.id}/query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			}).then(res => res.json())

			setQuery('')
			setOpen(false)
			setLoading(false)
			setResponse(response)
		},
		[query]
	)

    if (!data) return null

	return (
		<root.div mode="open">
			<motion.div
                initial={{ y: '50%' }}
                animate={{ y: 0 }}
				id="clippy-widget"
				className="fixed z-50 font-sans backdrop-blur-sm bottom-5 right-5 w-72 divide-y divide-gray-700 rounded-md border border-gray-700 shadow-md bg-gradient-to-bl from-gray-800/70 via-gray-900 to-gray-900"
			>
				<Styles hidden />
				<div>
					<AnimatePresence>
						{response ? (
							<div>
								<div className="flex gap-2 px-3 py-3 items-center overflow-hidden">
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
										<p className="mt-1 text-sm text-gray-300">{response.answer}</p>
										{response.sources?.filter(Boolean)?.length > 0 && (
											<div className="mt-2">
												<div className="text-xs text-gray-500 space-y-1">
													{response.sources.filter(Boolean).map(source => (
														<a
															key={source.page}
															href={source.path}
															className="block hover:underline"
														>
															{source.title ?? source.page} &rarr;
														</a>
													))}
												</div>
											</div>
										)}
									</motion.div>
								</div>
							</div>
						) : isLoading ? (
							<div>
								<div className="flex gap-2 px-3 py-3 items-center">
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
										<h3 className="text-sm text-gray-200 font-bold">Loading...</h3>
										<p className="mt-1 text-xs text-gray-500">{data.copy.loading}</p>
									</motion.div>
									<div className="relative w-12 h-12 flex-shrink-0">
										<motion.img
											layoutId="bunny"
											src={data.imageUrl}
											alt="avatar"
											className="rounded-full"
										/>
									</div>
								</div>
							</div>
						) : (
							<div className="flex gap-2 px-3 py-3 items-center">
								<motion.div exit={{ opacity: 0 }} className="flex-1">
									<h3 className="text-sm text-gray-200 font-bold">{data.copy.title}</h3>
									<p className="mt-1 text-xs text-gray-500">
										{data.copy.subtitle}
									</p>
								</motion.div>
								<div className="relative w-12 h-12 flex-shrink-0">
									<motion.img
										layoutId="bunny"
										src={data.imageUrl}
										alt="avatar"
										className="rounded-full"
									/>
								</div>
							</div>
						)}
					</AnimatePresence>
				</div>
				<div className="w-full">
					<AnimatePresence mode="wait">
						{isLoading ? (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.05 }}
								className="flex w-full justify-center px-5 py-3 text-sm font-medium text-white cursor-wait animate-pulse"
							>
								<p>Thinking...</p>
							</motion.div>
						) : isOpen ? (
							<motion.form
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.05 }}
								onSubmit={askQuestion}
								className="w-full relative"
								key="two"
							>
								<input
									type="text"
									value={query}
									onChange={e => setQuery(e.target.value)}
									className="w-full text-sm bg-transparent text-white px-5 pr-8 py-3 focus:outline-none"
									placeholder={data.copy.placeholder}
									autoFocus
								/>
								<motion.button
									initial={{ opacity: 0 }}
									animate={{ opacity: query ? 1 : 0 }}
									disabled={!query}
									className="absolute right-2 inset-y-0 px-2 -mx-2"
									type="submit"
								>
									<SendIcon className="w-4 h-4 text-white" />
								</motion.button>
							</motion.form>
						) : (
							<motion.button
								exit={{ opacity: 0 }}
								transition={{ duration: 0.05 }}
								onClick={toggleOpen}
								className="flex w-full justify-center px-5 py-3 text-sm font-bold text-white hover:bg-gray-800/70 transition duration-300"
							>
								<p>{data.copy.cta}</p>
							</motion.button>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</root.div>
	)
}

export default memo(Clippy)
