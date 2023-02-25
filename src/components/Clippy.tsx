import root from 'react-shadow'
import remarkGfm from 'remark-gfm'
import components from './markdown'
import Styles from '@build/index.css'
import SendIcon from './Icons/SendIcon'
import useMedia from '@/hooks/useMedia'
import { classNames } from '@/lib/utils'
import { useEffect, useMemo } from 'react'
import type { FormEvent, FC } from 'react'
import ReactMarkdown from 'react-markdown'
import useSWRImmutable from 'swr/immutable'
import { memo, useCallback, useState } from 'react'
import type { References, WidgetData } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const Clippy: FC = () => {
	const media = useMedia()
	const [query, setQuery] = useState('')
	const [isOpen, setOpen] = useState(false)
	const [isEditing, setEditing] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const [answer, setAnswer] = useState<string>('')
	const [references, setReferences] = useState<References | null>(null)

	const { data: project } = useSWRImmutable<WidgetData>(
		'https://api.clippy.help/widget',
		(url: string) => fetch(url, { referrerPolicy: 'unsafe-url' }).then(res => res.json()),
		{ revalidateOnMount: true }
	)

	useEffect(() => {
		if (!project) return
		console.groupCollapsed(`${project.name}'s AI assistant is powered by Clippy`)
		console.log(`__
/  \\
|  |    Clippy lets you add a conversational AI
@  @      assistant to your documentation in minutes.
|  |
|| |/
|| ||   Visit https://clippy.help to learn more.
|\\_/|
\\___/
    `)
		console.groupEnd()
	}, [project])

	const toggleOpen = useCallback(() => {
		setAnswer('')
		setReferences(null)
		setEditing(state => !state)
	}, [])

	const askQuestion = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!query) return

			setLoading(true)

			await fetchEventSource(`https://api.clippy.help/widget/stream`, {
				method: 'POST',
				referrerPolicy: 'unsafe-url',
				body: JSON.stringify({ query }),
				headers: {
					'Content-Type': 'application/json',
				},
				onmessage(ev) {
					switch (ev.id) {
						case 'references':
							setReferences(JSON.parse(ev.data) as References)
							break

						case 'partial_answer':
							setAnswer(answer => answer + ev.data)
							break

						case 'error':
							setAnswer('Something went wrong! Please try again.')
							break

						default:
							throw new Error('Unknown event')
					}
				},
			})

			setQuery('')
			setEditing(false)
			setLoading(false)
		},
		[query]
	)

	const sources = useMemo<References>(() => references?.slice(0, 1) ?? [], [references])

	if (!project) return null

	return (
		<root.div mode="open">
			<div className="fixed bottom-5 right-5 pl-5 md:pl-0 z-50">
				<Styles hidden />
				{media == 'desktop' || isOpen ? (
					<motion.div
						initial={{ y: '50%', width: '18rem' }}
						animate={{ y: 0, width: answer ? (media == 'mobile' ? 'auto' : '24rem') : '18rem' }}
						transition={{ width: { type: answer ? 'spring' : 'tween', duration: 0.15 } }}
						className={classNames(
							'divide-y divide-gray-700 rounded-md border border-gray-700 bg-gradient-to-bl from-gray-800/70 via-gray-900 to-gray-900 font-sans shadow-md backdrop-blur-sm'
						)}
					>
						<div>
							<AnimatePresence>
								{answer ? (
									<div>
										<div className="flex items-center gap-2 overflow-hidden p-3">
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="min-w-0 flex-1"
											>
												<ReactMarkdown
													components={components}
													remarkPlugins={[remarkGfm]}
													allowedElements={['p', 'a', 'code']}
													className="mt-1 text-sm text-gray-300"
												>
													{answer}
												</ReactMarkdown>
											</motion.div>
										</div>
									</div>
								) : isLoading ? (
									<div className="p-3">
										<div className="flex items-center gap-2">
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex-1"
											>
												<h3 className="text-sm font-bold text-gray-200">Loading...</h3>
												<p className="mt-1 text-xs text-gray-500">{project.copy.loading}</p>
											</motion.div>
											<a
												target="_blank"
												href="https://clippy.help"
												className="relative h-12 w-12 shrink-0"
											>
												<motion.img
													title="Powered by clippy.help"
													layoutId="clippyImg"
													src={project.image_url}
													alt="avatar"
													className="rounded-full"
												/>
											</a>
										</div>
										{sources.length > 0 && (
											<motion.div
												initial={{ opacity: 0, y: '50%' }}
												animate={{ opacity: 1, y: 0 }}
											>
												<div className="space-y-1 text-xs text-gray-500">
													{sources.map((source, i) => (
														<a key={i} href={source.path} className="block hover:underline">
															{source.title || source.page_title} &rarr;
														</a>
													))}
												</div>
											</motion.div>
										)}
									</div>
								) : (
									<div className="flex items-center gap-2 p-3">
										<motion.div exit={{ opacity: 0 }} className="flex-1">
											<h3 className="text-sm font-bold text-gray-200">{project.copy.title}</h3>
											<p className="mt-1 text-xs text-gray-500">{project.copy.subtitle}</p>
										</motion.div>
										<a
											target="_blank"
											href="https://clippy.help"
											className="relative h-12 w-12 shrink-0"
										>
											<motion.img
												title="Powered by clippy.help"
												layoutId="clippyImg"
												src={project.image_url}
												alt="avatar"
												className="rounded-full"
											/>
										</a>
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
										className="relative w-full m-0"
										key="two"
									>
										<input
											type="text"
											value={query}
											onChange={e => setQuery(e.target.value)}
											className="w-full bg-transparent px-5 py-3 pr-8 text-sm text-white focus:outline-none"
											placeholder={project.copy.placeholder}
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
										<p>{project.copy.cta}</p>
									</motion.button>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				) : (
					<motion.button onClick={() => setOpen(true)} className="relative h-12 w-12 shrink-0">
						<motion.img
							layoutId="clippyImg"
							src={project.image_url}
							alt="avatar"
							className="rounded-full"
						/>
					</motion.button>
				)}
			</div>
		</root.div>
	)
}

export default memo(Clippy)
