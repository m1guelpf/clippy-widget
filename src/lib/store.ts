import { create } from 'zustand'
import { References } from '@/types'

export enum ClippyState {
	Splash = 'splash',
	Loading = 'loading',
	Finished = 'finished',
	UserTyping = 'user_typing',
}

export type ClippyStore = {
	query: string
	answer: string
	state: ClippyState
	showOnMobile: boolean
	theme: 'light' | 'dark'
	references: References | null

	setQuery: (query: string) => void
	addToAnswer: (text: string) => void
	setMobileShow: (open: boolean) => void
	setState: (state: ClippyState) => void
	overwriteAnswer: (answer: string) => void
	setTheme: (theme: 'light' | 'dark') => void
	setReferences: (references: References) => void

	reset: () => void
}

const useClippyStore = create<ClippyStore>()(set => ({
	query: '',
	answer: '',
	theme: 'dark',
	references: null,
	showOnMobile: false,
	state: ClippyState.Splash,

	setState: state => set({ state }),
	setTheme: theme => set({ theme }),
	setQuery: query => set({ query }),
	overwriteAnswer: answer => set({ answer }),
	setReferences: references => set({ references }),
	setMobileShow: showOnMobile => set({ showOnMobile }),
	addToAnswer: text => set(state => ({ answer: (state.answer + text).replace('\\n', '\n') })),

	reset: () => set({ query: '', answer: '', state: ClippyState.Splash, references: null }),
}))

export default useClippyStore
