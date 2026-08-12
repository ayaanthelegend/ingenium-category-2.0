"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LiaAddressBook,
  LiaDoorOpenSolid,
  LiaInfoSolid,
  LiaQuestionSolid,
} from "react-icons/lia";
import { AiOutlineStock } from "react-icons/ai";
import { RiBankFill, RiNewspaperLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import {motion, useDragControls} from 'framer-motion';
import 'react-resizable/css/styles.css';
import InfoProgram from "@/components/programs/info";
import { Resizable } from "re-resizable";
import HelpProgram from "@/components/programs/help";
import CreditsProgram from "@/components/programs/credits";
import StockProgram from "@/components/programs/stock_market";
import BankProgram from "@/components/programs/bank";
import NewsProgram from "@/components/programs/news";
import {News, Stock, User} from "@/components/schemas";
import axios from "axios";


const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [news, setNews] = useState<Array<News>>([]);
  const [stocks, setStocks] = useState<Array<Stock>>([]);
  const [me, setMe] = useState<User | null>(null);
  const [update, setUpdate] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  const getNews = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/news`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      const sortedNews = [...resp.data].sort((a, b) => a.sequence - b.sequence)
      let time = 0
      sortedNews.forEach(s => time += s.effectAt)
      await getTimeLeft(time)
      setUpdate(sortedNews[sortedNews.length - 1].headline);
      setNews(resp.data)
    } catch {}
  }

  const getStocks = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      setStocks(resp.data)
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

  const getTimeLeft = async (totalTime: number) => {
    try {

      const resp = await axios.get(`${serverUrl}/news/time-left`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })

      setTimeLeft(resp.data.timeLeft)
    } catch {}
  }

  useEffect(() => {
    getNews();
    getStocks();
    getMe()
  }, []);

  const programComponents: { [key: string]: React.ReactElement } = {
    about: <InfoProgram/>,
    help: <HelpProgram/>,
    credits: <CreditsProgram/>,
    stocks: <StockProgram stocks={stocks}/>,
    bank: <BankProgram me={me} stocks={stocks}/>,
    news: <NewsProgram articles={news}/>,
  };

  const router = useRouter();
  const [time, setTime] = useState("");
  type WindowState = { name: string; z: number };

  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [zCounter, setZCounter] = useState(1);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      setTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      getNews()
      getStocks()
      getMe()
      return
    };

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token == 'null') router.push("/login");
  }, []);

  useEffect(() => {
    getNews();
    getStocks();
    getMe();

    const interval = setInterval(() => {
      getNews();
      getStocks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const programs: {
    name: string;
    item: React.ElementType;
    click?: () => void;
  }[] = [
    { name: "about", item: LiaInfoSolid },
    { name: "help", item: LiaQuestionSolid },
    { name: "credits", item: LiaAddressBook },
    { name: "stocks", item: AiOutlineStock },
    { name: "bank", item: RiBankFill },
    { name: "news", item: RiNewspaperLine },
    { name: "log out", item: LiaDoorOpenSolid, click: () => router.push("/login") },
  ];

  const openProgram = (name: string, click?: () => void) => {
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

  return (
    <div className="h-screen flex flex-col justify-between items-center p-16 bg-black/50">
      <h1 className="fixed bottom-4 z-50 right-4 text-xs text-white/50 font-light">
        <span className={'text-white font-black transition duration-500 hover:opacity-50 cursor-pointer'} onClick={() => {
          getNews()
          getStocks()
          getMe()
        }}>Refresh</span> made with &lt;3 by ateeb sohail
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="fixed top-16 right-16 flex flex-col items-end"
      >
        <h1 className="text-3xl font-black text-[#FFBF00]">Goldmans Gambit</h1>
        <h2 className="text-xl font-light text-white/60">desktop edition</h2>
        <h2 className="text-xl font-light text-white/60">{timeLeft}</h2>
        <h2 className="text-xl font-light text-white/60 mt-2">logged in as : {me?.username}</h2>
        <motion.div
          initial={{ opacity: 0, translateY: '50%' }}
          animate={{ opacity: 1, translateY: '0%' }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          <Card className={'p-0 w-96 mt-8'}>
            <CardContent className={'p-4'}>
              <h1 className={'w-full text-start text-white/80 font-black text-xl'}>Updates</h1>
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
                    src="/logowithbg.png"
                    width={48}
                    height={48}
                    alt="logo"
                    className="rounded-xl object-cover"
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
                    <div className="w-[48px] h-[48px] flex justify-center items-center bg-primary/10 border border-primary/40 rounded-xl transition duration-500 hover:-translate-y-6 hover:scale-125 cursor-pointer">
                      <program.item className="text-primary/40" size={32} />
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

function WindowFrame({name, children, onClose, onClick, offset = 0, zIndex}: {
  name: string;
  children: React.ReactNode;
  onClose: () => void;
  onClick: () => void;
  offset?: number;
  zIndex: number;
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
        <Card className="h-full flex flex-col overflow-hidden p-0 text-white">
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
      </Resizable>
    </motion.div>
  );
}