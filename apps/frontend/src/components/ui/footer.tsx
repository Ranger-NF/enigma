const Footer: React.FC = () => {
    return (
        <div className="bottom-0 h-[50px] w-screen z-50 text-white/50 bg-gradient-to-t from-black to-transparent pb-6">
            <div className='relative w-full h-full pb-2'>

                <div className='w-full h-full flex flex-col items-center justify-center'>
                    <div className='text-sm'>
                        Created by Biswaz and Rakshith
                    </div>
                    <div className='text-[12px]'>
                      Modified by Team Enigma 2025
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
