import root from 'react-shadow'
import Styles from '@build/index.css'
import type { FormEvent } from 'react'
import SendIcon from './Icons/SendIcon'
import useMedia from '@/hooks/useMedia'
import useSWRImmutable from 'swr/immutable'
import { memo, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ClippyResponse = {
	answer: string
	sources: Array<{
		page: string
		path: string
		title: string | null
	}>
}

type WidgetData = {
	id: string
	imageUrl: string
	copy: {
		title: string
		subtitle: string
		cta: string
		placeholder: string
		loading: string
	}
}

const Clippy = () => {
	const media = useMedia()
	const [query, setQuery] = useState('')
	const [isOpen, setOpen] = useState(false)
	const [isEditing, setEditing] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const [response, setResponse] = useState<ClippyResponse | null>(null)
	const { data } = useSWRImmutable<WidgetData>(
		'https://api.clippy.help/widget',
		(url: string) => fetch(url).then(res => res.json()),
		{ revalidateOnMount: true }
	)

	const toggleOpen = useCallback(() => {
		setEditing(state => !state)
		setResponse(null)
	}, [])

	const askQuestion = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!query) return

			setLoading(true)

			const response = (await fetch(`https://api.clippy.help/${data?.id}/ask`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			}).then(res => res.json())) as ClippyResponse

			setQuery('')
			setEditing(false)
			setLoading(false)
			setResponse(response)
		},
		[data?.id, query]
	)

	if (!data) return null

	return (
		<root.div mode="open">
			<div className="fixed bottom-5 right-5 z-50">
				<Styles hidden />
				{media == 'desktop' || isOpen ? (
					<motion.div
						animate={{ y: 0 }}
						initial={{ y: '50%' }}
						className="w-72 divide-y divide-gray-700 rounded-md border border-gray-700 bg-gradient-to-bl from-gray-800/70 via-gray-900 to-gray-900 font-sans shadow-md backdrop-blur-sm"
					>
						<div>
							<AnimatePresence>
								{response ? (
									<div>
										<div className="flex items-center gap-2 overflow-hidden p-3">
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="min-w-0 flex-1"
											>
												<p className="mt-1 text-sm text-gray-300">{response.answer}</p>
												{response.sources.filter(Boolean).length > 0 && (
													<div className="mt-2">
														<div className="space-y-1 text-xs text-gray-500">
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
										<div className="flex items-center gap-2 p-3">
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex-1"
											>
												<h3 className="text-sm font-bold text-gray-200">Loading...</h3>
												<p className="mt-1 text-xs text-gray-500">{data.copy.loading}</p>
											</motion.div>
											<div className="relative h-12 w-12 shrink-0">
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
									<div className="flex items-center gap-2 p-3">
										<motion.div exit={{ opacity: 0 }} className="flex-1">
											<h3 className="text-sm font-bold text-gray-200">{data.copy.title}</h3>
											<p className="mt-1 text-xs text-gray-500">{data.copy.subtitle}</p>
										</motion.div>
										<div className="relative h-12 w-12 shrink-0">
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
										className="flex w-full animate-pulse cursor-wait justify-center px-5 py-3 text-sm font-medium text-white"
									>
										<p>Thinking...</p>
									</motion.div>
								) : isEditing ? (
									<motion.form
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.05 }}
										onSubmit={e => void askQuestion(e)}
										className="relative w-full"
										key="two"
									>
										<input
											type="text"
											value={query}
											onChange={e => setQuery(e.target.value)}
											className="w-full bg-transparent px-5 py-3 pr-8 text-sm text-white focus:outline-none"
											placeholder={data.copy.placeholder}
											// eslint-disable-next-line jsx-a11y/no-autofocus
											autoFocus
										/>
										<motion.button
											initial={{ opacity: 0 }}
											animate={{ opacity: query ? 1 : 0 }}
											disabled={!query}
											className="absolute inset-y-0 right-2 -mx-2 px-2"
											type="submit"
										>
											<SendIcon className="h-4 w-4 text-white" />
										</motion.button>
									</motion.form>
								) : (
									<motion.button
										exit={{ opacity: 0 }}
										transition={{ duration: 0.05 }}
										onClick={toggleOpen}
										className="flex w-full justify-center px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-gray-800/70"
									>
										<p>{data.copy.cta}</p>
									</motion.button>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				) : (
					<motion.button onClick={() => setOpen(true)} className="relative h-12 w-12 shrink-0">
						<motion.img layoutId="bunny" src={data.imageUrl} alt="avatar" className="rounded-full" />
					</motion.button>
				)}
			</div>
		</root.div>
	)
}

export default memo(Clippy)
