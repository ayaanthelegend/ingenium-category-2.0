"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LiaAddressBook,
  LiaCompassSolid,
  LiaDoorOpenSolid,
  LiaInfoSolid,
  LiaQuestionSolid,
  LiaTrophySolid,
} from "react-icons/lia";
import { AiOutlineStock } from "react-icons/ai";
import { RiBankFill, RiNewspaperLine } from "react-icons/ri";
import { useEffect, useState, useRef } from "react";
import {motion, useDragControls} from 'framer-motion';
import 'react-resizable/css/styles.css';
import InfoProgram from "@/components/programs/info";
import { Resizable } from "re-resizable";
import HelpProgram from "@/components/programs/help";
import CreditsProgram from "@/components/programs/credits";
import StockProgram from "@/components/programs/stock_market";
import BankProgram from "@/components/programs/bank";
import NewsProgram from "@/components/programs/news";
import LeaderboardProgram from "@/components/programs/leaderboard";
import {News, Stock, User, Flag} from "@/components/schemas";
import axios from "axios";
import MobileLayout from "@/components/mobile_layout";
import FeatureTour from "@/components/feature_tour";


const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const serverUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`).replace(/\/+$/, '');

export default function Home() {
  const [news, setNews] = useState<Array<News>>([]);
  const [stocks, setStocks] = useState<Array<Stock>>([]);
  const [me, setMe] = useState<User | null>(null);
  const [leaderboardUsers, setLeaderboardUsers] = useState<Array<User>>([]);
  const [update, setUpdate] = useState('')
  const [timeLeft, setTimeLeft] = useState(0);
  const [flag, setFlag] = useState<Flag | null>(null);
  const [newsFlash, setNewsFlash] = useState(false);
  const prevLatestNewsIdRef = useRef<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem("feature_tour_completed");
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

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
      const resp = await axios.get(`${serverUrl}/news`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      const newsList: News[] = resp.data || [];
      const sortedNews = [...newsList].sort((a, b) => a.sequence - b.sequence)
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
      setNews(newsList)
    } catch {}
  }

  const getStocks = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setStocks(resp.data || [])
    } catch {}
  }

  const getMe = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setMe(resp.data)
    } catch {}
  }

  const getLeaderboard = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/users/leaderboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setLeaderboardUsers(resp.data || [])
    } catch {}
  }

  const refreshAllData = () => {
    getNews();
    getStocks();
    getMe();
    getLeaderboard();
    getFlag();
  };

  const programComponents: { [key: string]: React.ReactElement } = {
    about: <InfoProgram/>,
    help: <HelpProgram/>,
    credits: <CreditsProgram/>,
    stocks: <StockProgram stocks={stocks} onRefresh={refreshAllData}/>,
    bank: <BankProgram me={me} stocks={stocks}/>,
    news: <NewsProgram articles={news}/>,
    scoreboard: <LeaderboardProgram users={leaderboardUsers} stocks={stocks}/>,
  };

  const router = useRouter();
  type WindowState = { name: string; z: number };

  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [zCounter, setZCounter] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token == 'null') router.push("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshAllData();

    const interval = setInterval(() => {
      refreshAllData();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getNews();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const programs: {
    name: string;
    item: React.ElementType;
    click?: () => void;
  }[] = [
    { name: "about", item: LiaInfoSolid },
    { name: "tour", item: LiaCompassSolid, click: () => setIsTourOpen(true) },
    { name: "help", item: LiaQuestionSolid },
    { name: "credits", item: LiaAddressBook },
    { name: "stocks", item: AiOutlineStock },
    { name: "bank", item: RiBankFill },
    { name: "news", item: RiNewspaperLine },
    { name: "scoreboard", item: LiaTrophySolid },
    { name: "log out", item: LiaDoorOpenSolid, click: () => router.push("/login") },
  ];

  const openProgram = (name: string, click?: () => void) => {
    if (name === "tour") {
      setIsTourOpen(true);
      return;
    }
    if (name === "log out") {
      click?.();
      return;
    }

    setOpenWindows((prev) => {
      const exists = prev.find((w) => w.name === name);
      if (exists) return prev; // Already open

      return [...prev, { name, z: zCounter }];
    });

    setZCounter((prev) => prev + 1);
  };

  const [tourCamera, setTourCamera] = useState({ scale: 1, x: 0, y: 0 });
  const [tourTarget, setTourTarget] = useState<string | null>(null);

  const handleTourStep = (
    stepIndex: number,
    target: string,
    camera: { scale: number; x: number; y: number }
  ) => {
    setTourCamera(camera);
    setTourTarget(target);
    if (["stocks", "bank", "news", "scoreboard"].includes(target)) {
      openProgram(target);
      bringToFront(target);
    }
  };

  const bringToFront = (name: string) => {
    setOpenWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.z));
      return prev.map((w) =>
        w.name === name ? { ...w, z: maxZ + 1 } : w
      );
    });
    setZCounter((prev) => prev + 1);
  };

  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const closeWindow = (name: string) => {
    setOpenWindows((prev) => prev.filter((n) => n.name !== name));
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <MobileLayout
        news={news}
        stocks={stocks}
        me={me}
        leaderboardUsers={leaderboardUsers}
        update={update}
        timeLeft={timeLeft}
        flag={flag}
        newsFlash={newsFlash}
        refreshAllData={refreshAllData}
        onLogout={() => router.push("/login")}
        onOpenTour={() => setIsTourOpen(true)}
        formatTimeLeft={formatTimeLeft}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <motion.div
        animate={{
          scale: isTourOpen ? tourCamera.scale : 1,
          x: isTourOpen ? tourCamera.x : 0,
          y: isTourOpen ? tourCamera.y : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 85,
          damping: 18,
          mass: 0.9,
        }}
        style={{ transformOrigin: "center center" }}
        className="h-full w-full flex flex-col justify-between items-center p-16 bg-black/50 relative overflow-hidden"
      >
        <h1 className="fixed bottom-4 z-50 right-4 text-xs text-white/50 font-light">
          <span className={'text-white font-black transition duration-500 hover:opacity-50 cursor-pointer'} onClick={() => {
            getNews()
            getStocks()
            getMe()
          }}>Refresh</span> made with &lt;3 for Markhors Den
        </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed top-16 right-16 flex flex-col items-end"
      >
        <h1 className="text-3xl font-black text-primary/40">wolves of wall street</h1>
        <h2 className="text-xl font-light text-white/60">desktop edition</h2>
        {flag && !flag.value ? (
          flag.isAutoPausing ? (
            <h2 className="text-lg font-bold text-primary mt-1 animate-pulse">[ MARKET PAUSED — NEW UPDATE INCOMING ]</h2>
          ) : (
            <h2 className="text-lg font-bold text-red-500/80 mt-1">[ EVENT PAUSED ]</h2>
          )
        ) : (
          <div className="flex flex-col items-end mt-1 text-sm text-white/80 font-light">
            <h2>Round Time Remaining: <span className="font-bold text-primary">{formatTimeLeft(timeLeft)}</span></h2>
          </div>
        )}
        <h2 className="text-sm font-light text-white/60 mt-2">logged in as : {me?.username}</h2>
        <motion.div
          initial={{ opacity: 0, translateY: '50%' }}
          animate={{ opacity: 1, translateY: '0%' }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          <Card className={`p-0 w-96 mt-8 transition-all duration-500 ${newsFlash ? 'ring-2 ring-primary bg-primary/20 animate-pulse' : ''}`}>
            <CardContent className={'p-4'}>
              <h1 className={'w-full text-start text-white/80 font-black text-xl flex items-center justify-between'}>
                <span>Updates</span>
                {newsFlash && <span className="text-xs text-primary animate-bounce font-bold">★ NEW UPDATE</span>}
              </h1>
              <h1 className={`w-full text-start ${update ? 'text-white' : 'text-white/30'}`}>{update || "No Updates Found"}</h1>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* DESKTOP ICONS */}
      <div className="h-11/12 w-full">
        <div className="flex flex-row gap-x-6">
          {
            chunkArray(programs, 5).map((column, colIndex) => (
              <div
                key={colIndex}
                className="flex flex-col gap-y-6">
                {column.map((program, index) => (
                  <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 1.5, delay: 0.25 * (index + (colIndex * 5))}}
                    key={index}
                  >
                    <DesktopIcon
                      name={program.name}
                      Icon={program.item}
                      clickEvent={() => openProgram(program.name, program.click)}
                    />
                  </motion.div>
                ))}
              </div>
            ))
          }
        </div>
      </div>

      {/* PROGRAM WINDOWS */}
      {openWindows.map((win) => {
        const ProgramComponent = programComponents[win.name];
        return (
          <WindowFrame
            key={win.name}
            name={win.name}
            zIndex={win.z}
            isTourTarget={isTourOpen && tourTarget === win.name}
            onClose={() => closeWindow(win.name)}
            onClick={() => bringToFront(win.name)}
            offset={openWindows.findIndex(w => w.name === win.name) * 7}
          >
            {ProgramComponent ? ProgramComponent : <p>Unknown program: {win.name}</p>}
          </WindowFrame>
        );
      })}

      {/* Taskbar */}
      <motion.div
        initial={{opacity: 0, translateY: '100%'}}
        animate={{opacity: 1, translateY: '0%'}}
        transition={{duration: 1.5}}
        className="fixed bottom-4 w-full flex justify-center items-end"
      >
        <Card className="transition duration-500 hover:scale-105 p-0">
          <CardContent className="p-4 flex gap-4 items-center justify-center">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="w-[48px] h-[48px] flex justify-center items-center bg-primary/10 border border-primary/40 rounded-xl transition duration-500 hover:-translate-y-6 hover:scale-125 cursor-pointer">
                  <Image
                    src="/Logo-Alt.png"
                    width={48}
                    height={48}
                    alt="logo"
                    className="rounded-xl"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>home</p>
              </TooltipContent>
            </Tooltip>

            {programs.map((program, index) => (
              <motion.div
                initial={{ opacity: 0, translateY: '100%' }}
                animate={{ opacity: 1, translateY: '0%' }}
                transition={{ duration: 1.5, delay: (0.25 * index) + 1.5 }}
                key={index}
              >
                <Tooltip>
                  <TooltipTrigger onClick={() => openProgram(program.name, program.click)}>
                    <div className={`w-[48px] h-[48px] flex justify-center items-center bg-primary/10 border border-primary/40 rounded-xl transition duration-500 hover:-translate-y-6 hover:scale-125 cursor-pointer ${
                      newsFlash && program.name === 'news' ? 'ring-2 ring-primary bg-primary/30 animate-bounce' : ''
                    }`}>
                      <program.item className={newsFlash && program.name === 'news' ? "text-primary" : "text-primary/40"} size={32} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{program.name}</p>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>

      <FeatureTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          setTourCamera({ scale: 1, x: 0, y: 0 });
          setTourTarget(null);
        }}
        onStepChange={handleTourStep}
      />
    </div>
  );
}

type DesktopIconProps = {
  name: string;
  Icon: React.ElementType;
  clickEvent: () => void;
};

function DesktopIcon({ name, Icon, clickEvent }: DesktopIconProps) {
  return (
    <div
      onClick={clickEvent}
      className="w-[96px] flex flex-col items-center select-none cursor-pointer transition duration-500 hover:scale-105 active:scale-90"
    >
      <div className="w-[96px] h-[96px] flex justify-center items-center bg-primary/10 border border-primary/40 rounded-xl">
        <Icon className="text-primary/40" size={64} />
      </div>
      <h1 className="mt-2 text-white font-medium text-center">{name}</h1>
    </div>
  );
}

function WindowFrame({name, children, onClose, onClick, offset = 0, zIndex, isTourTarget}: {
  name: string;
  children: React.ReactNode;
  onClose: () => void;
  onClick: () => void;
  offset?: number;
  zIndex: number;
  isTourTarget?: boolean;
}) {
  const dragControls = useDragControls();

  const [maxSize, setMaxSize] = useState({
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.8,
  });

  useEffect(() => {
    const update = () =>
      setMaxSize({
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8,
      });

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <motion.div
      drag={true}
      onClick={onClick}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 1000, top: 0, bottom: 800 }}
      className="absolute top-20 left-20 z-50"
      style={{top: `${20 + offset}px`, left: `${20 + offset}px`, zIndex: zIndex, touchAction: "none" }}
    >
      <Resizable
        defaultSize={{ width: 320, height: 240 }}
        minWidth={600}
        minHeight={400}
        maxWidth={maxSize.width}
        maxHeight={maxSize.height}
        enable={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        handleStyles={{
          top: { cursor: "ns-resize", height: "4px", top: "-2px" },
          bottom: { cursor: "ns-resize", height: "4px", bottom: "-2px" },
          left: { cursor: "ew-resize", width: "4px", left: "-2px" },
          right: { cursor: "ew-resize", width: "4px", right: "-2px" },
        }}
      >
        <div className="relative h-full w-full">
          {isTourTarget && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 left-2 z-50 flex items-center gap-1.5 bg-neutral-950 border border-neutral-700 text-white px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wider shadow-lg pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              FOCUS: {name.toUpperCase()}
            </motion.div>
          )}
          <Card className={`h-full flex flex-col overflow-hidden p-0 text-white transition-all duration-300 ${
            isTourTarget ? 'ring-2 ring-white shadow-[0_0_40px_rgba(255,255,255,0.35)]' : ''
          }`}>
            <CardHeader
              onPointerDown={(e) => dragControls.start(e)}
              className="bg-primary/20 flex flex-row items-center justify-between px-4 py-2 cursor-move"
            >
              <CardTitle className="text-sm">{name}.exe</CardTitle>
              <button
                onClick={onClose}
                className="text-primary font-bold hover:text-primary/50 transition"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto px-4 py-2 select-text">
              {children}
            </CardContent>
          </Card>
        </div>
      </Resizable>
    </motion.div>
  );
}