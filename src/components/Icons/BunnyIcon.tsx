import { FC, HTMLAttributes } from 'react'

type Props = HTMLAttributes<SVGElement> & {
	fgClasses?: string
}

const BunnyIcon: FC<Props> = ({ fgClasses, ...props }) => (
	<svg {...props} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 36 36">
		<defs>
			<rect id="a" width="35.012" height="35.012" x="0" y="0" rx="17.506" />
		</defs>
		<g fill="none" fill-rule="evenodd">
			<mask id="b" fill="#fff">
				<use xlinkHref="#a" />
			</mask>
			<use xlinkHref="#a" fill="transparent" />
			<g
				fill="currentColor"
				className={fgClasses}
				fill-rule="nonzero"
				stroke="currentColor"
				stroke-width=".233"
				mask="url(#b)"
			>
				<path d="M27.597 10.27c3.268-.092-.583 7.626-2.917 14.706 4.201 3.968 2.567 10.037 1.984 12.604-4.124.7-12.488 2.895-16.69 0-4.2-2.894-2.035-9.804.39-12.604a61.6 61.6 0 0 0-.936-2.103l-.248-.53c-1.912-4.063-4.01-7.994-2.706-8.454 1.983-.7 7.709 1.668 11.443 9.837 1.751-5.641 6.413-13.363 9.68-13.456ZM17.66 30.989c-.57 0-1.033.448-1.033 1s.462 1 1.033 1c.57 0 1.033-.448 1.033-1s-.462-1-1.033-1Zm4.001-4.035c-.642 0-1.162.694-1.162 1.549s.52 1.549 1.162 1.549c.642 0 1.162-.694 1.162-1.549s-.52-1.549-1.162-1.549Zm-7.745 0c-.642 0-1.162.694-1.162 1.549s.52 1.549 1.162 1.549c.642 0 1.162-.694 1.162-1.549s-.52-1.549-1.162-1.549Z" />
			</g>
		</g>
	</svg>
)

export default BunnyIcon
