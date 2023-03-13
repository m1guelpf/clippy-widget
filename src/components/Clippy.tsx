import root from 'react-shadow'
import { useEffect } from 'react'
import remarkGfm from 'remark-gfm'
import components from './markdown'
import Styles from '@build/index.css'
import SendIcon from './Icons/SendIcon'
import useMedia from '@/hooks/useMedia'
import { classNames } from '@/lib/utils'
import { memo, useCallback } from 'react'
import type { FormEvent, FC } from 'react'
import ReactMarkdown from 'react-markdown'
import useSWRImmutable from 'swr/immutable'
import type { References, WidgetData } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import useClippyStore, { ClippyState, ClippyStore } from '@/lib/store'

const getParams = (store: ClippyStore) => ({
	reset: store.reset,
	theme: store.theme,
	query: store.query,
	state: store.state,
	answer: store.answer,
	setState: store.setState,
	setQuery: store.setQuery,
	addToAnswer: store.addToAnswer,
	showOnMobile: store.showOnMobile,
	setReferences: store.setReferences,
	setMobileShow: store.setMobileShow,
	overwriteAnswer: store.overwriteAnswer,
	sources: store.references?.slice(0, 1) ?? [],
})

const Clippy: FC = () => {
	const media = useMedia()
	const {
		state,
		reset,
		theme,
		query,
		answer,
		sources,
		setState,
		setQuery,
		addToAnswer,
		showOnMobile,
		setMobileShow,
		setReferences,
		overwriteAnswer,
	} = useClippyStore(getParams)

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
		if (state != ClippyState.Splash) return reset()

		setState(ClippyState.UserTyping)
	}, [])

	const askQuestion = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (!query) return

			setState(ClippyState.Loading)

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
							addToAnswer(ev.data)
							break

						case 'error':
							overwriteAnswer('Something went wrong! Please try again.')
							break

						default:
							throw new Error('Unknown event')
					}
				},
			})

			setQuery('')
			setState(ClippyState.Finished)
		},
		[query]
	)

	if (!project) return null

	return (
		<root.div mode="open">
			<div className={classNames(theme == 'dark' && 'dark', 'fixed bottom-5 right-5 pl-5 md:pl-0 z-50')}>
				<Styles hidden />
				{media == 'desktop' || showOnMobile ? (
					<motion.div
						initial={{ y: '50%', width: '18rem' }}
						animate={{
							y: 0,
							width: state == ClippyState.Finished ? (media == 'mobile' ? 'auto' : '24rem') : '18rem',
						}}
						transition={{
							width: { type: state == ClippyState.Finished ? 'spring' : 'tween', duration: 0.15 },
						}}
						className={classNames(
							'divide-y dark:divide-gray-700 rounded-md border dark:border-gray-700 bg-gradient-to-bl from-gray-100/70 via-white to-white dark:from-gray-800/70 dark:via-gray-900 dark:to-gray-900 font-sans shadow backdrop-blur-sm'
						)}
					>
						<div>
							<AnimatePresence>
								{state == ClippyState.Finished ? (
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
													className="mt-1 text-sm dark:text-gray-300"
												>
													{answer}
												</ReactMarkdown>
											</motion.div>
										</div>
									</div>
								) : state == ClippyState.Loading ? (
									<div className="p-3">
										<div className="flex items-center gap-2">
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex-1"
											>
												<h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
													Loading...
												</h3>
												<p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
													{project.copy.loading}
												</p>
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
											<h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
												{project.copy.title}
											</h3>
											<p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
												{project.copy.subtitle}
											</p>
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
								{state == ClippyState.Loading ? (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.05 }}
										className="flex w-full animate-pulse cursor-wait justify-center px-5 py-3 text-sm font-medium text-gray-800 dark:text-white"
									>
										<p>Thinking...</p>
									</motion.div>
								) : state == ClippyState.UserTyping ? (
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
											className="w-full bg-transparent px-5 py-3 pr-8 text-sm text-gray-700 dark:text-white focus:outline-none"
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
											<SendIcon className="h-4 w-4 text-gray-700 dark:text-white" />
										</motion.button>
									</motion.form>
								) : (
									<motion.button
										exit={{ opacity: 0 }}
										transition={{ duration: 0.05 }}
										onClick={toggleOpen}
										className="flex w-full justify-center px-5 py-3 text-sm text-gray-800 font-bold dark:text-white transition duration-300 hover:bg-gray-100 rounded-b dark:hover:bg-gray-800/70"
									>
										<p>{project.copy.cta}</p>
									</motion.button>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				) : (
					<motion.button onClick={() => setMobileShow(true)} className="relative h-12 w-12 shrink-0">
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
