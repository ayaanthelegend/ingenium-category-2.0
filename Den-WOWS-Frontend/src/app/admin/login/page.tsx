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
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    const u = username.trim();
    const p = password.trim();
    if (!u || !p) {
      setError("Please enter both username and password");
      return;
    }
    setLoading(true);
    const credentials = typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(`${u}:${p}`)
      : (typeof Buffer !== 'undefined' ? Buffer.from(`${u}:${p}`).toString('base64') : '');

    try {
      await axios.get(`${serverUrl}/users/all`, {
        headers: { Authorization: `Basic ${credentials}` }
      });
      localStorage.setItem('adminUsername', u);
      localStorage.setItem('adminPassword', p);
      router.push('/admin');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid admin username or password.");
      } else {
        localStorage.setItem('adminUsername', u);
        localStorage.setItem('adminPassword', p);
        router.push('/admin');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-between items-center flex-col min-h-screen bg-black/10 bg-black/50">
      <div className={'w-full flex justify-end items-end flex-col p-16'}>
        <h1 className={'text-xl font-black'}><span className={'text-primary/60'}>markhors</span> den admin panel</h1>
        <h1 className={'text-5xl font-black'}>wolves of <span className={'text-primary/60'}>wall street</span>.</h1>
      </div>
      <div className={'flex flex-row justify-start items-stretch w-full p-16'}>
        <Image src={'/Logo-Alt.png'} width={150} height={100} alt={'logo'} className={'rounded-full border border-primary p-2'}/>
        <div className={'flex flex-grow justify-center ml-4 items-start flex-col'}>
          <div className={'flex justify-end items-end'}>
            <h1 className={'font-black text-3xl text-white/80'}>hello there</h1>
            <h1 className={'font-black ml-1 text-primary/40'}>admins only</h1>
          </div>
          <form onSubmit={login} className={'flex flex-col mt-2 justify-start items-start w-full'}>
            <div className={'flex flex-row gap-2 justify-start items-center'}>
              <InputWithIcon icon={<LiaAtSolid/>} onChange={(e) => setUsername(e.target.value)} value={username} placeholder={'username'}/>
              <InputWithIcon type={"password"} icon={<LiaAsteriskSolid/>} onChange={(e) => setPassword(e.target.value)} value={password} placeholder={'password'}/>
              <Button type="submit" disabled={loading}><LiaGreaterThanSolid/></Button>
            </div>
            {error && (
              <div className="p-2 mt-3 text-xs bg-red-500/20 border border-red-500 text-red-300 rounded font-semibold">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
