"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import InfoProgram from "@/components/programs/info";
import HelpProgram from "@/components/programs/help";
import CreditsProgram from "@/components/programs/credits";
import StockProgram from "@/components/programs/stock_market";
import BankProgram from "@/components/programs/bank";
import NewsProgram from "@/components/programs/news";
import LeaderboardProgram from "@/components/programs/leaderboard";
import { News, Stock, User, Flag } from "@/components/schemas";

interface MobileLayoutProps {
  news: Array<News>;
  stocks: Array<Stock>;
  me: User | null;
  leaderboardUsers: Array<User>;
  update: string;
  timeLeft: number;
  flag: Flag | null;
  newsFlash: boolean;
  refreshAllData: () => void;
  onLogout: () => void;
  onOpenTour?: () => void;
  formatTimeLeft: (sec: number) => string;
}

export default function MobileLayout({
  news,
  stocks,
  me,
  leaderboardUsers,
  update,
  timeLeft,
  flag,
  newsFlash,
  refreshAllData,
  onLogout,
  onOpenTour,
  formatTimeLeft,
}: MobileLayoutProps) {
  const [activeProgram, setActiveProgram] = useState<string | null>(null);

  const programs = [
    { name: "stocks", label: "Stock Market", icon: AiOutlineStock },
    { name: "news", label: "News Feed", icon: RiNewspaperLine },
    { name: "bank", label: "Bank Profile", icon: RiBankFill },
    { name: "scoreboard", label: "Leaderboard", icon: LiaTrophySolid },
    { name: "tour", label: "Feature Tour", icon: LiaCompassSolid, action: onOpenTour },
    { name: "about", label: "Info / About", icon: LiaInfoSolid },
    { name: "help", label: "Help Guide", icon: LiaQuestionSolid },
    { name: "credits", label: "Credits", icon: LiaAddressBook },
    { name: "logout", label: "Log Out", icon: LiaDoorOpenSolid, action: onLogout },
  ];

  const programComponents: { [key: string]: React.ReactElement } = {
    about: <InfoProgram />,
    help: <HelpProgram />,
    credits: <CreditsProgram />,
    stocks: <StockProgram stocks={stocks} onRefresh={refreshAllData} />,
    bank: <BankProgram me={me} stocks={stocks} />,
    news: <NewsProgram articles={news} />,
    scoreboard: <LeaderboardProgram users={leaderboardUsers} stocks={stocks} />,
  };

  const getProgramTitle = (name: string) => {
    const found = programs.find((p) => p.name === name);
    return found ? found.label : name;
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-white flex flex-col p-4 pb-12 select-none overflow-x-hidden"
      style={{ backgroundImage: 'url("/bg.png")' }}
    >
      <div className="fixed inset-0 bg-black/65 backdrop-blur-[2px] pointer-events-none -z-10" />
      {/* PROGRAM OVERLAY */}
      {activeProgram ? (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col overflow-y-auto p-4">
          <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md pb-4 pt-2 border-b border-white/10 flex items-center justify-between">
            <Button
              onClick={() => setActiveProgram(null)}
              variant="outline"
              size="sm"
              className="text-primary border-primary/40 hover:bg-primary/10 font-bold"
            >
              ← Back to Apps
            </Button>
            <h1 className="text-lg font-black text-white">{getProgramTitle(activeProgram)}</h1>
          </div>
          <div className="flex-1 pt-4 pb-8 max-w-full overflow-x-auto">
            {programComponents[activeProgram] || <p>Program not found</p>}
          </div>
        </div>
      ) : (
        /* HOME DASHBOARD */
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
          {/* TOP HEADER */}
          <div className="flex flex-col items-center text-center pt-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo-Alt.png"
                width={44}
                height={44}
                alt="logo"
                className="rounded-xl border border-primary/40"
              />
              <div className="text-left">
                <h1 className="text-2xl font-black text-primary/60">wolves of wall street</h1>
                <h2 className="text-xs font-light text-white/60">mobile edition</h2>
              </div>
            </div>

            {/* EVENT STATUS */}
            <div className="w-full mt-4">
              {flag && !flag.value ? (
                flag.isAutoPausing ? (
                  <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-2 rounded-lg text-center animate-pulse">
                    ⏸ MARKET PAUSED — NEW UPDATE INCOMING
                  </div>
                ) : (
                  <div className="text-xs font-bold text-red-500/90 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg text-center">
                    [ EVENT PAUSED ]
                  </div>
                )
              ) : (
                <div className="text-xs font-medium text-white/80 bg-white/10 px-3 py-2 rounded-lg text-center border border-white/10">
                  Round Time Remaining: <span className="font-bold text-primary">{formatTimeLeft(timeLeft)}</span>
                </div>
              )}
            </div>

            <p className="text-xs font-light text-white/60 mt-2">logged in as: <span className="text-white font-medium">{me?.username || "Guest"}</span></p>
          </div>

          {/* LATEST UPDATE TICKER CARD */}
          <Card
            onClick={() => setActiveProgram("news")}
            className={`p-0 w-full cursor-pointer transition duration-300 ${
              newsFlash ? "ring-2 ring-primary bg-primary/20 animate-pulse" : "bg-black/60 border-primary/30 hover:border-primary/50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-primary font-bold mb-1">
                <span>UPDATES TICKER</span>
                {newsFlash && <span className="animate-bounce">★ NEW UPDATE</span>}
              </div>
              <h2 className={`text-sm ${update ? "text-white font-semibold" : "text-white/40"}`}>
                {update || "No Updates Found"}
              </h2>
            </CardContent>
          </Card>

          {/* APP GRID */}
          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            {programs.map((program) => {
              const IconComp = program.icon;
              const isNewsFlash = newsFlash && program.name === "news";

              return (
                <Card
                  key={program.name}
                  onClick={() => {
                    if (program.action) {
                      program.action();
                    } else {
                      setActiveProgram(program.name);
                    }
                  }}
                  className={`p-0 cursor-pointer transition duration-300 active:scale-95 bg-black/50 border border-primary/20 hover:border-primary/50 ${
                    isNewsFlash ? "ring-2 ring-primary bg-primary/20 animate-bounce" : ""
                  }`}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <IconComp size={28} className={isNewsFlash ? "text-primary" : "text-primary/70"} />
                    </div>
                    <span className="text-sm font-medium text-white">{program.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <footer className="text-center text-xs text-white/40 mt-6 pb-4">
            <span onClick={refreshAllData} className="text-white font-bold underline cursor-pointer">Refresh Data</span> • made with &lt;3 for Markhors Den
          </footer>
        </div>
      )}
    </div>
  );
}
