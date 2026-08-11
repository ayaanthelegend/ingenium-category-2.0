import Image from "next/image";

export default function CreditsProgram() {
  return (
    <div className={'w-full flex flex-col justify-center items-center pb-8'}>
      <div className={'flex flex-row justify-center items-center w-full'}>
        <Image src={'/ateeb.jpeg'} alt={'ateeb sohail'} width={256} height={256}
               className={'rounded-full w-[200px] h-[200px] object-cover border border-primary/40'}/>
        <div className={'flex flex-col justify-start ml-4 items-start'}>
          <h1 className={'text-2xl font-black text-primary/40'}>the guy who made this weird site</h1>
          <h1 className={'font-light text-white'}>this is ateeb sohail, or rick. whatever you wanna call him. he&lsquo;s
            the autistic idiot behind the creation of the magnificent masterpiece before you. however he couldn&lsquo;t
            do it alone for sure.</h1>
        </div>
      </div>
      <h1 className={'text-2xl font-black text-primary/40 mt-12'}>meet the secretariat</h1>
      <p className={'mt-8 text-light'}>(i never got their info so just look ahead at them)</p>
    </div>
  )
}