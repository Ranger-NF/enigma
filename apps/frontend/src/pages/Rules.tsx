import glassImage1 from '@/assets/rules-1-photo.svg';
import glassImage2 from '@/assets/rules-2-photo.svg';

export default function Rules() {
	
	const rulesAndRegulations: string[] = [
		"Only students will be given prizes. You can be from anywhere from India.",
		"Winners should go through verification to claim their prizes.",
		"The ranking will be based on who finishes the most questions, in minimum time.",
		"Answer should be in full forms. The answer format is no spaces, all lower case and no special characters.",
		"Eg: Algorythm'22 should be answered as algorythm22, 1000.10 is 1000.10 itself",
		"Hints will be provided from time to time on the question page itself.",
		"The clock will start ticking when your account is created. This time will be taken into account in the leaderboard.",
		"The team deserves all rights to take necessary action for the smooth conduction of the event.",
		"Google is your best friend. Yo Boolean!",
		"Let the source be with you.",
		"Dear hackers, we ban like hell ;)"
	]

	return (
		<div className="w-full pt-[100px]">
			<img
				className='absolute left-0 h-[600px]'
				src={glassImage1}
			/>
			<img
				className='absolute right-0 h-[600px]'
				src={glassImage2}
			/>
			<div className='flex h-full w-full items-center justify-center'>
				<div className='flex flex-col gap-[20px] items-center bg-card border z-10 rounded-lg p-[50px]'>
					<div className='text-[30px] font-bold pt-[10px]'>Rules and Regulations</div>
					<ul className="list-disc list-inside space-y-2">
						{rulesAndRegulations.map((rule, index) => (
						<li key={index} className="text-white">
							{rule}
						</li>
						))}
					</ul>

				</div>
			</div>
		</div>
	);
}
