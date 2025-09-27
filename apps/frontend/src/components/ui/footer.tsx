import footer1 from '@/assets/footer1.svg';
import footer2 from '@/assets/footer2.svg';
import { Logo } from './shadcn-io/navbar-01';

const Footer: React.FC = () => {
    return (
        <div className="relative bottom-0 h-[300px] w-screen">
            <div className='relative w-full h-full'>
                <img 
                    src={footer1}
                    className='absolute right-0 w-[100px] bottom-0 h-[200px]'
                />
                <img 
                    src={footer2}
                    className='absolute left-0 w-[150px] h-[250px]'
                />
                <div className='w-full h-full flex flex-col items-center justify-center'>
                    <div className='flex pb-[20px] md:pb-[50px]'>
                        <div className="md:text-[45px] text-[35px]">
                            <div className='md:h-[3.2px] h-[3px]'></div>
                            <Logo/>
                        </div>
                        <span className="font-bold md:text-[34px] text-[24px]">Enigma</span>
                    </div>
                    <div>
                        <div className='font-bold text-[15px] md:text-[18px] pb-[10px]'>Feel free to contact us:</div>
                    </div>
                    <div className='flex md:gap-[50px] flex-col md:flex-row justify-center items-center'>
                        <div className='flex'>
                            <div className='pr-[5px] font-bold text-[13px] md:text-[16px]'>Aravind : </div>
                            <a href={`tel:+918606645976`} className='font-bold text-[13px] md:text-[16px]'>
                                +91 86606645976
                            </a>
                        </div>
                        <div className='flex'>
                            <div className='pr-[5px] font-bold md:text-[16px] text-[13px]'>
                                Vishnu :
                            </div>
                            <a href={`tel:+918606645976`} className='font-bold md:text-[16px] text-[13px]'>
                                +91 86606645976
                            </a>
                        </div>
                        <div className='flex'>
                            <div className='pr-[5px] font-bold md:text-[16px] text-[13px]'>
                                Whatsapp:
                            </div>
                            <a href={`tel:+918606645976`} className='font-bold md:text-[16px] text-[13px]'>
                                +91 86606645976
                            </a>
                        </div>
                    </div>
                    <div className='pt-[20px] text-[10px] md:text-[15px]'>
                        <div>
                            Copyright © Algorythm'22 Dept of CSE, 2022
                        </div>
                    </div>
                    <div className='text-[10px] md:text-[15px]'>
                        Created by biswaz and rakshith
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;