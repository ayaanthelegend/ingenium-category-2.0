"use client"
import Image from "next/image";
import {LiaAsteriskSolid, LiaAtSolid, LiaGreaterThanSolid} from "react-icons/lia";
import {InputWithIcon} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useState} from "react";
import axios from "axios";
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const serverUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`).replace(/\/+$/, '');

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const login = async () => {
    const cleanUser = username.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanUser || !password) {
      setError(true);
      setErrorMsg("Please enter both username and password");
      setTimeout(() => setError(false), 2000);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await axios.post(`${serverUrl}/auth/login`, { username: cleanUser, password });

      if (resp.data && resp.data.access_token) {
        localStorage.setItem('token', resp.data.access_token);
        router.push('/');
      } else {
        setError(true);
        setErrorMsg(resp.data?.error || "Invalid username or password");
        setTimeout(() => setError(false), 2500);
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(true);
      const message = axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : "Network error. Is the backend running?";
      setErrorMsg(typeof message === 'string' ? message : "Network error. Is the backend running?");
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
  }

  return (
    <div className={`flex justify-between items-center flex-col min-h-screen transition duration-500 ${error ? 'bg-black/80' : 'bg-black/50'}`}>
      <div className={'w-full flex justify-end items-end flex-col p-8 md:p-16'}>
        <h1 className={'text-xl font-black'}><span className={"transition duration-500 " + (error ? 'text-red-700/75' : 'text-primary/60')}>markhors</span> den</h1>
        <h1 className={'text-4xl md:text-5xl font-black'}>wolves of <span className={"transition duration-500 " + (error ? 'text-red-700/75' : 'text-primary/60')}>wall street</span>.</h1>
      </div>
      <div className={'flex flex-row justify-start items-stretch w-full p-16'}>
        <Image src={'/Logo-Alt.png'} width={150} height={100} alt={'logo'} className={`transition duration-500 rounded-full border ${error ? 'border-red-700/75' : 'border-primary'} p-2`}/>
        <div className={'flex flex-grow justify-center ml-4 items-start flex-col'}>
          <div className={'flex justify-end items-end flex-col'}>
            <div className={'flex flex-row items-baseline'}>
              <h1 className={`transition duration-500 font-black text-3xl ${error ? 'text-red-700/75' : 'text-white/80'}`}>hello there</h1>
              <h1 className={`transition duration-500 font-black ml-1 ${error ? 'text-red-700/75' : 'text-primary/40'}`}>need help?</h1>
            </div>
            {errorMsg && (
              <p className="text-red-400 font-semibold text-sm mt-1 transition duration-300">{errorMsg}</p>
            )}
          </div>
          <div className={`transition duration-500 flex flex-row mt-2 gap-2 justify-start items-start ${loading && 'pointer-events-none opacity-50'}`}>
            <InputWithIcon onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} icon={<LiaAtSolid/>} placeholder={'username'}/>
            <InputWithIcon onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} type={"password"} icon={<LiaAsteriskSolid/>} placeholder={'password'}/>
            <Button onClick={login} disabled={loading}><LiaGreaterThanSolid/></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
