"use client"
import Image from "next/image";
import {LiaAsteriskSolid, LiaAtSolid, LiaGreaterThanSolid} from "react-icons/lia";
import {InputWithIcon} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {motion} from "framer-motion";
import {Flag, News} from "@/components/schemas";
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

  const [update, setUpdate] = useState("")
  const [flag, setFlag] = useState<Flag | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [newsFlash, setNewsFlash] = useState(false)
  const prevLatestNewsIdRef = useRef<string | null>(null)

  const getFlag = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/flags/global`);
      setFlag(resp.data);
      if (resp.data) {
        setTimeLeft(resp.data.timeLeft ?? 0);
      }
    } catch {}
  };

  const getNews = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const resp = await axios.get(`${serverUrl}/news`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const newsList: News[] = resp.data || [];
      const sortedNews = [...newsList].sort((a, b) => a.sequence - b.sequence);
      if (sortedNews.length > 0) {
        const latest = sortedNews[sortedNews.length - 1];
        setUpdate(latest.headline || '');
        if (prevLatestNewsIdRef.current !== null && prevLatestNewsIdRef.current !== latest._id) {
          setNewsFlash(true);
          setTimeout(() => setNewsFlash(false), 3000);
        }
        prevLatestNewsIdRef.current = latest._id;
      } else {
        setUpdate('');
      }
    } catch {}
  };

  useEffect(() => {
    getNews();
    getFlag();

    const flagInterval = setInterval(() => {
      getFlag();
    }, 5000);

    const newsInterval = setInterval(() => {
      getNews();
    }, 2000);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(flagInterval);
      clearInterval(newsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const login = async () => {
    const cleanUser = username.trim();
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

        {flag && !flag.value ? (
          flag.isAutoPausing ? (
            <h2 className="text-sm font-bold text-primary mt-2 animate-pulse">[ MARKET PAUSED — NEW UPDATE INCOMING ]</h2>
          ) : (
            <h2 className="text-sm font-bold text-red-500/80 mt-2">[ EVENT PAUSED ]</h2>
          )
        ) : (
          timeLeft > 0 ? (
            <div className="flex flex-col items-end mt-2 text-xs text-white/80 font-light">
              <h2>Round Time Remaining: <span className="font-bold text-primary">{formatTimeLeft(timeLeft)}</span></h2>
            </div>
          ) : null
        )}

        <motion.div
          initial={{ opacity: 0, translateY: '20%' }}
          animate={{ opacity: 1, translateY: '0%' }}
          transition={{ duration: 1 }}
        >
          <Card className={`p-0 w-80 md:w-96 mt-6 transition-all duration-500 bg-black/40 border-primary/20 ${newsFlash ? 'ring-2 ring-primary bg-primary/20 animate-pulse' : ''}`}>
            <CardContent className={'p-4'}>
              <h1 className={'w-full text-start text-white/80 font-black text-lg flex items-center justify-between'}>
                <span>Updates</span>
                {newsFlash && <span className="text-xs text-primary animate-bounce font-bold">★ NEW UPDATE</span>}
              </h1>
              <h1 className={`w-full text-start text-sm mt-1 ${update ? 'text-white' : 'text-white/30'}`}>{update || "No Updates Found"}</h1>
            </CardContent>
          </Card>
        </motion.div>
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
