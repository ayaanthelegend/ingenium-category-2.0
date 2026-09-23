"use client"
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import axios from "axios";
import {useEffect, useState} from "react";
import {
  CreateNewsDto,
  CreateStockDto,
  CreateUserDto,
  Stock,
  StockEffect,
  UpdateUserDto,
  User,
  News,
  Flag,
  UpdateNewsDto, StockUser
} from "@/components/schemas";
const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const serverUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`).replace(/\/+$/, '');

const getAdminAuthHeader = () => {
  const username = typeof window !== 'undefined' ? localStorage.getItem('adminUsername') || '' : '';
  const password = typeof window !== 'undefined' ? localStorage.getItem('adminPassword') || '' : '';
  const credentials = typeof window !== 'undefined' && typeof window.btoa === 'function'
    ? window.btoa(`${username}:${password}`)
    : (typeof Buffer !== 'undefined' ? Buffer.from(`${username}:${password}`).toString('base64') : '');
  return `Basic ${credentials}`;
};

const handleAdminAuthError = (e: unknown, router: any) => {
  if (axios.isAxiosError(e) && e.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminUsername');
      localStorage.removeItem('adminPassword');
    }
    router.push('/admin/login');
  }
};

import { useRouter } from "next/navigation";

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('adminUsername');
      const p = localStorage.getItem('adminPassword');
      if (!u || !p) {
        router.push('/admin/login');
      }
    }
  }, [router]);

  return (
    <div className="flex justify-between items-center flex-col min-h-screen bg-black/10 bg-black/50 text-white">
      <div className={'w-full flex justify-center items-center gap-16 flex-col p-16'}>
        <BigBlackSwitch/>
        <Users/>
        <Stocks/>
        <NewsThing/>
        <LeaderboardAhh/>
      </div>
    </div>
  );
}

const Users = () => {
  const router = useRouter();
  const [users, setUsers] = useState<Array<User>>([]);
  const [createUserDto, setCreateUserDto] = useState<CreateUserDto>({ username: "", password: "", balance: 200000 });
  const [updateUserDto, setUpdateUserDto] = useState<UpdateUserDto>({ username: "", balance: 0 });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState("");

  const getUsers = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/users/all`, {
        headers: { Authorization: getAdminAuthHeader() },
      });
      setUsers(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch users", e);
      handleAdminAuthError(e, router);
    }
  }

  const createUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreateError("");
    try {
      await axios.post(`${serverUrl}/auth/register`, createUserDto, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsCreateOpen(false);
      setCreateUserDto({ username: "", password: "", balance: 200000 });
      await getUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setCreateError(Array.isArray(msg) ? msg.join(', ') : msg || "Failed to create team");
      } else {
        setCreateError("Failed to create team");
      }
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`${serverUrl}/users/${id}`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      await getUsers();
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  }

  const updateUser = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditError("");
    try {
      await axios.patch(`${serverUrl}/users/${id}`, updateUserDto, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsEditOpen(false);
      setEditingUserId(null);
      await getUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setEditError(Array.isArray(msg) ? msg.join(', ') : msg || "Failed to update team");
      } else {
        setEditError("Failed to update team");
      }
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between flex-row'}>
          <h1 className={'text-5xl font-black text-white'}>Users</h1>
          <div className={'flex justify-start items-center gap-4'}>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setCreateError("");
                  setCreateUserDto({ username: "", password: "", balance: 200000});
                }}>
                  New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] z-50">
                <form onSubmit={createUser}>
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create Team
                    </DialogTitle>
                  </DialogHeader>
                  {createError && (
                    <div className="p-3 my-2 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                      {createError}
                    </div>
                  )}
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>Team Name</Label>
                      <Input onChange={(e) => setCreateUserDto({...createUserDto, username: e.target.value})} value={createUserDto.username} placeholder={'Name'} />
                      <Label>Balance</Label>
                      <Input onChange={(e) => setCreateUserDto({...createUserDto, balance: Number(e.target.value)})} value={createUserDto.balance} placeholder={'Starting Balance'} type={'number'} />
                      <Label>Password (More than 6 characters)</Label>
                      <Input onChange={(e) => setCreateUserDto({...createUserDto, password: e.target.value})} value={createUserDto.password} placeholder={'Password'} type={'password'}/>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" onClick={() => setIsCreateOpen(false)} className={'text-sm'} variant="outline">Cancel</Button>
                    <Button type="submit" className={`text-sm ${createUserDto.password.length < 6 && "pointer-events-none opacity-50"}`} variant="secondary">Confirm</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className={'flex justify-start flex-col gap-4 mt-4 items-start w-full'}>
          {
            users.map((user: User) => (
              <Card key={user._id} className={'w-full p-6'}>
                <CardContent>
                  <div className={'flex w-full justify-between flex-row'}>
                    <h1 className={'text-2xl font-black text-white'}>{user.username}</h1>
                    <div className={'flex justify-start items-center gap-4'}>
                      <Dialog open={isEditOpen && editingUserId === user._id} onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setEditingUserId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            setEditError("");
                            setEditingUserId(user._id);
                            setUpdateUserDto({username: user.username, balance: user.balance});
                            setIsEditOpen(true);
                          }}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] z-50">
                          <form onSubmit={(e) => updateUser(user._id, e)}>
                            <DialogHeader>
                              <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                                Edit {user.username}
                              </DialogTitle>
                            </DialogHeader>
                            {editError && (
                              <div className="p-3 my-2 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                                {editError}
                              </div>
                            )}
                            <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                              <div className="grid gap-3 mt-4">
                                <Label>Team Name</Label>
                                <Input onChange={(e) => {
                                  setUpdateUserDto({...updateUserDto, username: e.target.value});
                                }} value={updateUserDto.username}/>
                                <Label>Balance</Label>
                                <Input onChange={(e) => {
                                  setUpdateUserDto({...updateUserDto, balance: Number(e.target.value)});
                                }} value={updateUserDto.balance} type={'number'}/>
                                <div className="gap-3">
                                  {
                                    (user.stocksOwned || []).map((stock) => (
                                      <Card key={stock.id} className={'p-4 text-white mt-2'}>
                                        <CardContent>
                                          <Label>Amount Owned (Valued at ${stock.buy} - Bought {new Date(stock.boughtAt).toLocaleTimeString()})</Label>
                                          <Input readOnly value={stock.amount} type={'number'} className={'mt-2'}/>
                                        </CardContent>
                                      </Card>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="mt-4">
                              <Button type="button" onClick={() => setIsEditOpen(false)} className={'text-sm'} variant="outline">Cancel</Button>
                              <Button type="submit" className={'text-sm'} variant="secondary">Confirm</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button onClick={() => deleteUser(user._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}

const Stocks = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState<Array<Stock>>([])
  const [createStockDto, setCreateStockDto] = useState<CreateStockDto>({ name: "", price: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");

  const getStocks = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks/admin`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setStocks(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch stocks", e);
      handleAdminAuthError(e, router);
    }
  }

  const createStock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreateError("");
    try {
      await axios.post(`${serverUrl}/stocks`, createStockDto, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsCreateOpen(false);
      setCreateStockDto({ name: "", price: 0 });
      await getStocks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setCreateError(Array.isArray(msg) ? msg.join(', ') : msg || "Failed to create stock");
      } else {
        setCreateError("Failed to create stock");
      }
    }
  }

  const deleteStock = async (id: string) => {
    try {
      await axios.delete(`${serverUrl}/stocks/${id}`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      await getStocks();
    } catch (e) {
      console.error("Failed to delete stock", e);
    }
  }

  useEffect(() => {
    getStocks();
  }, []);

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between flex-row'}>
          <h1 className={'text-5xl font-black text-white'}>Stocks</h1>
          <div className={'flex justify-start items-center gap-4'}>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setCreateError("");
                  setCreateStockDto({ name: "", price: 0 });
                }}>
                  New Stock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] z-50">
                <form onSubmit={createStock}>
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create Stock
                    </DialogTitle>
                  </DialogHeader>
                  {createError && (
                    <div className="p-3 my-2 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                      {createError}
                    </div>
                  )}
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>Stock Name</Label>
                      <Input onChange={(e) => setCreateStockDto({...createStockDto, name: e.target.value})} placeholder={'Name'} value={createStockDto.name}/>
                      <Label>Stock Price</Label>
                      <Input onChange={(e) => setCreateStockDto({...createStockDto, price: Number(e.target.value)})} placeholder={'Starting Price'} value={createStockDto.price} type={'number'} />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" onClick={() => setIsCreateOpen(false)} className={'text-sm'} variant="outline">Cancel</Button>
                    <Button type="submit" className={'text-sm'} variant="secondary">Confirm</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className={'flex justify-start gap-4 mt-4 items-start flex-col w-full'}>
          {
            stocks.map((stock) => (
              <Card key={stock._id} className={'w-full p-6'}>
                <CardContent>
                  <div className={'flex w-full justify-between flex-row'}>
                    <div className={'flex justify-start items-start flex-col'}>
                      <h1 className={'text-2xl font-black text-white'}>{stock.name}</h1>
                      <h1 className={'text-lg text-white'}>${stock.price}/share</h1>
                    </div>
                    <div className={'flex justify-start items-center gap-4'}>
                      <Button onClick={() => deleteStock(stock._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </CardContent>
    </Card>
  )
}

const NewsThing = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState<Array<Stock>>([])
  const [news, setNews] = useState<Array<News>>([])
  const [createNewsDto, setCreateNewsDto] = useState<CreateNewsDto>({ headline: '', desc: '', effects: [], sequence: 0})
  const [updateNewsDto, setUpdateNewsDto] = useState<UpdateNewsDto>({ headline: '', desc: '', sequence: 0})

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const initiaiseStockEffects = (type: 'create' | 'update'): Array<StockEffect> => {
    return stocks.map((stock) => ({ id: stock._id, newBuy: type == 'create' ? -1 : stock.price}))
  }

  const getStocks = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks/admin`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setStocks(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch stocks", e);
      handleAdminAuthError(e, router);
    }
  }

  const createNews = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreateError("");
    try {
      const newsToSend = { ...createNewsDto };
      newsToSend.effects = newsToSend.effects.filter(ev => ev.newBuy !== -1);

      await axios.post(`${serverUrl}/news`, newsToSend, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsCreateOpen(false);
      await getNews();
      await getStocks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setCreateError(Array.isArray(msg) ? msg.join(', ') : msg || "Failed to create news");
      } else {
        setCreateError("Failed to create news");
      }
    }
  }

  const updateNews = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditError("");
    try {
      await axios.patch(`${serverUrl}/news/${id}`, updateNewsDto, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsEditOpen(false);
      setEditingNewsId(null);
      await getNews();
      await getStocks();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message;
        setEditError(Array.isArray(msg) ? msg.join(', ') : msg || "Failed to update news");
      } else {
        setEditError("Failed to update news");
      }
    }
  }

  const deleteNews = async (id: string) => {
    try {
      await axios.delete(`${serverUrl}/news/${id}`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      await getNews();
      await getStocks();
    } catch (e) {
      console.error("Failed to delete news", e);
      handleAdminAuthError(e, router);
    }
  }

  const getNews = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/news/admin`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setNews(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch news", e);
      handleAdminAuthError(e, router);
    }
  };

  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseErrors, setReleaseErrors] = useState<{ [id: string]: string }>({});

  const releaseSingleNews = async (id: string) => {
    if (releasingId) return;
    setReleasingId(id);
    setReleaseErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    try {
      const resp = await axios.post(`${serverUrl}/news/${id}/release`, {}, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      if (resp.data && resp.data.success) {
        setNews((prevNews) =>
          prevNews.map((item) =>
            item._id === id
              ? { ...item, released: true, releasedAt: resp.data.news?.releasedAt || new Date().toISOString() }
              : item
          )
        );
        await getStocks();
      } else {
        throw new Error(resp.data?.message || "Failed to release news");
      }
    } catch (err: unknown) {
      console.error("Failed to release news", err);
      let errMsg = "Failed to release news";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message;
        if (Array.isArray(errMsg)) errMsg = errMsg.join(', ');
      }
      setReleaseErrors((prev) => ({ ...prev, [id]: errMsg }));
    } finally {
      setReleasingId(null);
    }
  };

  useEffect(() => {
    getNews();
    getStocks();
    const interval = setInterval(() => {
      getNews();
      getStocks();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between flex-row'}>
          <h1 className={'text-5xl font-black text-white'}>News</h1>
          <div className={'flex justify-start items-center gap-4'}>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={async () => {
                  setCreateError("");
                  await getStocks();
                  setCreateNewsDto({ headline: '', desc: '', effects: initiaiseStockEffects('create'), sequence: 0});
                }}>
                  New News
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] z-50">
                <form onSubmit={createNews}>
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create News
                    </DialogTitle>
                  </DialogHeader>
                  {createError && (
                    <div className="p-3 my-2 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                      {createError}
                    </div>
                  )}
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>News Headline</Label>
                      <Input onChange={(e) => setCreateNewsDto({...createNewsDto, headline: e.target.value})} value={createNewsDto.headline} placeholder={'Name'}/>
                      <Label>News Description</Label>
                      <Input onChange={(e) => setCreateNewsDto({...createNewsDto, desc: e.target.value})} value={createNewsDto.desc} placeholder={'Name'}/>
                      <Label>News Sequence</Label>
                      <Input step="any" onChange={(e) => setCreateNewsDto({...createNewsDto, sequence: Number(e.target.value)})} value={createNewsDto.sequence} placeholder={'Sequence'} type={'number'}/>
                    </div>
                  </div>
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <Label className="mt-4 font-bold">Effects (fill in only the affected stocks, leave the rest as -1)</Label>
                    <div className="gap-3 mt-4 flex flex-col max-h-48 overflow-y-auto">
                      {
                        createNewsDto.effects.map((effect) => (
                          <Card key={effect.id} className={'p-4 text-white'}>
                            <CardContent>
                              <Label>Effecting Stock</Label>
                              <Input readOnly className={'mt-2'} value={stocks.find(s => s._id == effect.id)?.name || 'Stock'} type={'text'}/>
                              <Label className={'mt-4'}>New Price</Label>
                              <Input className={'mt-2'} onChange={(e) => {
                                const updatedEffects = createNewsDto.effects.map((ef) =>
                                  ef.id === effect.id ? { ...ef, newBuy: Number(e.target.value) } : ef
                                )
                                setCreateNewsDto({ ...createNewsDto, effects: updatedEffects })
                              }} value={effect.newBuy} type={'number'}/>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" onClick={() => setIsCreateOpen(false)} className={'text-sm'} variant="outline">Cancel</Button>
                    <Button type="submit" className={`text-sm ${createNewsDto.effects.every(s => s.newBuy === -1) && "pointer-events-none opacity-50"}`} variant="secondary">Confirm</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className={'flex justify-start flex-col gap-4 mt-4 items-start w-full'}>
          {(() => {
            const sortedUnreleased = news.filter(item => item.released === false).sort((a, b) => a.sequence - b.sequence);
            const nextQueuedSeq = sortedUnreleased[0]?.sequence;

            return news.map((n) => {
              const isReleased = n.released !== false;
              const isNextQueued = !isReleased && n.sequence === nextQueuedSeq;

              return (
                <Card key={n._id} className={`w-full p-6 transition-all duration-300 ${isNextQueued ? 'border-primary/80 bg-primary/5' : ''}`}>
                  <CardContent>
                    <div className={'flex w-full justify-between flex-row'}>
                      <div className={'flex justify-start items-start flex-col'}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className={'text-2xl font-black text-white'}>Heading #{n.sequence} ({n.headline})</h1>
                          {isReleased ? (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 border border-primary/30 text-primary/80">
                              ✓ RELEASED
                            </span>
                          ) : isNextQueued ? (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/20 border border-primary text-primary animate-pulse">
                              ⏳ QUEUED (NEXT IN LINE)
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-white/50">
                              QUEUED
                            </span>
                          )}
                        </div>
                        <h1 className={'text-lg text-white mt-1'}>{n.desc}</h1>
                      </div>
                  <div className={'flex justify-start items-center gap-4'}>
                    <Dialog open={isEditOpen && editingNewsId === n._id} onOpenChange={(open) => {
                      setIsEditOpen(open);
                      if (!open) setEditingNewsId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditError("");
                          setEditingNewsId(n._id);
                          const existingEffectsMap = new Map((n.effects || []).map(e => [e.id, e.newBuy]));
                          const initialEffects = stocks.map(stock => ({
                            id: stock._id,
                            newBuy: existingEffectsMap.has(stock._id) ? existingEffectsMap.get(stock._id)! : -1
                          }));
                          setUpdateNewsDto({
                            headline: n.headline,
                            desc: n.desc,
                            sequence: n.sequence,
                            effects: initialEffects,
                          });
                          setIsEditOpen(true);
                        }}>
                          Edit News
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] z-50">
                        <form onSubmit={(e) => updateNews(n._id, e)}>
                          <DialogHeader>
                            <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                              Edit Headline #{n.sequence}
                            </DialogTitle>
                          </DialogHeader>
                          {editError && (
                            <div className="p-3 my-2 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                              {editError}
                            </div>
                          )}
                          <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                            <div className="grid gap-3 mt-4">
                              <Label>News Headline</Label>
                              <Input onChange={(e) => setUpdateNewsDto({...updateNewsDto, headline: e.target.value})} value={updateNewsDto.headline} placeholder={'Name'}/>
                              <Label>News Description</Label>
                              <Input onChange={(e) => setUpdateNewsDto({...updateNewsDto, desc: e.target.value})} value={updateNewsDto.desc} placeholder={'Name'}/>
                              <Label>News Sequence</Label>
                              <Input step="any" onChange={(e) => setUpdateNewsDto({...updateNewsDto, sequence: Number(e.target.value)})} value={updateNewsDto.sequence} placeholder={'Sequence'} type={'number'}/>
                            </div>
                          </div>
                          <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                            <Label className="mt-4 font-bold">Effects (fill in only the affected stocks, leave the rest as -1)</Label>
                            <div className="gap-3 mt-4 flex flex-col max-h-48 overflow-y-auto">
                              {
                                (updateNewsDto.effects || []).map((effect) => (
                                  <Card key={effect.id} className={'p-4 text-white'}>
                                    <CardContent>
                                      <Label>Effecting Stock</Label>
                                      <Input readOnly className={'mt-2'} value={stocks.find(s => s._id == effect.id)?.name || 'Stock'} type={'text'}/>
                                      <Label className={'mt-4'}>New Price</Label>
                                      <Input className={'mt-2'} onChange={(e) => {
                                        const updatedEffects = (updateNewsDto.effects || []).map((ef) =>
                                          ef.id === effect.id ? { ...ef, newBuy: Number(e.target.value) } : ef
                                        );
                                        setUpdateNewsDto({ ...updateNewsDto, effects: updatedEffects });
                                      }} value={effect.newBuy} type={'number'}/>
                                    </CardContent>
                                  </Card>
                                ))
                              }
                            </div>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="button" onClick={() => setIsEditOpen(false)} className={'text-sm'} variant="outline">Cancel</Button>
                            <Button type="submit" className={'text-sm'} variant="secondary">Confirm</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {isReleased ? (
                      <Button
                        disabled
                        variant="outline"
                        className="border-primary/30 text-primary/70 opacity-70 cursor-not-allowed font-medium text-xs sm:text-sm"
                      >
                        Released{n.releasedAt ? ` (${new Date(n.releasedAt).toLocaleTimeString()})` : ''}
                      </Button>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          variant="outline"
                          disabled={releasingId === n._id}
                          className="text-primary border-primary/40 hover:bg-primary/10 font-bold"
                          onClick={() => releaseSingleNews(n._id)}
                        >
                          {releasingId === n._id ? 'Releasing...' : 'Release news'}
                        </Button>
                        {releaseErrors[n._id] && (
                          <span className="text-xs text-red-400 font-semibold">{releaseErrors[n._id]}</span>
                        )}
                      </div>
                    )}
                    <Button onClick={() => deleteNews(n._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        });
      })()}
        </div>
      </CardContent>
    </Card>
  )
}

const BigBlackSwitch = () => {
  const [flag, setFlag] = useState<Flag | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const getFlag = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/flags/global`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setFlag(resp.data);
      if (resp.data && resp.data.roundDurationSeconds !== undefined) {
        setDurationMinutes(resp.data.roundDurationSeconds ? resp.data.roundDurationSeconds / 60 : "");
      }
    } catch (e) {
      console.error("Failed to fetch flag", e);
    }
  };

  const pauseFlag = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${serverUrl}/flags/pause`, {}, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      await getFlag();
    } catch (e) {
      console.error("Failed to pause flag", e);
    } finally {
      setActionLoading(false);
    }
  };

  const resumeFlag = async () => {
    setActionLoading(true);
    try {
      const durationSeconds = durationMinutes !== "" && !isNaN(Number(durationMinutes))
        ? Math.round(Number(durationMinutes) * 60)
        : 0;
      await axios.post(`${serverUrl}/flags/start`, { durationSeconds }, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      await getFlag();
    } catch (e) {
      console.error("Failed to start flag", e);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    getFlag();
    const interval = setInterval(() => {
      getFlag();
    }, 2000);

    const ticker = setInterval(() => {
      setNow(Date.now());
    }, 500);

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
        getFlag();
      }
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('online', handleSync);

    return () => {
      clearInterval(interval);
      clearInterval(ticker);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('online', handleSync);
    };
  }, []);

  const durationSeconds = durationMinutes !== "" && !isNaN(Number(durationMinutes))
    ? Math.max(0, Math.round(Number(durationMinutes) * 60))
    : (flag?.roundDurationSeconds || 0);

  const calculateElapsed = () => {
    if (!flag) return 0;
    const accumulated = Math.max(0, flag.accumulatedSeconds || 0);
    if (!flag.value) {
      return durationSeconds > 0 ? Math.min(accumulated, durationSeconds) : accumulated;
    }
    const startTime = flag.startedAt
      ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime())
      : now;
    const currentSegment = Math.max(0, Math.floor((now - startTime) / 1000));
    const total = accumulated + currentSegment;
    return durationSeconds > 0 ? Math.min(total, durationSeconds) : total;
  };

  const elapsedSeconds = calculateElapsed();
  const remainingSeconds = durationSeconds > 0 ? Math.max(0, durationSeconds - elapsedSeconds) : 0;

  return flag && (
    <Card className={'w-full p-8'}>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className={'text-4xl font-black text-white'}>
            the big switch (EVENT IS {flag.value ? 'ON' : 'OFF'})
          </h1>
          {flag.isAutoPausing && (
            <div className="text-sm font-bold text-primary bg-primary/10 border border-primary/40 px-3 py-1 rounded-full animate-pulse">
              ⏸ AUTO-PAUSING (10s UPDATE WINDOW)
            </div>
          )}
        </div>

        {/* Live Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-black/40 border border-primary/20">
          <div className="flex flex-col">
            <span className="text-xs text-white/50 uppercase font-semibold">Event Status</span>
            <span className={`text-xl font-bold ${flag.value ? 'text-primary' : 'text-red-400/80'}`}>
              {flag.value ? (flag.isAutoPausing ? 'Auto-Pausing Update' : 'Active / Running') : 'Paused / Stopped'}
            </span>
            <span className="text-xs text-white/40 mt-1">Elapsed: {elapsedSeconds}s</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-white/50 uppercase font-semibold">Round Time Remaining</span>
            <span className="text-xl font-bold text-primary">
              {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s
            </span>
            <span className="text-xs text-white/40 mt-1">Duration: {durationSeconds ? `${durationSeconds / 60} min` : 'Unlimited'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className={'gap-4 flex flex-wrap items-end'}>
          <div className={'flex flex-col gap-2'}>
            <Label className="text-white">Round Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="Minutes (e.g. 15)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-44 text-white bg-black/50 border-primary/40 focus:border-primary"
            />
          </div>

          <Button disabled={actionLoading || flag.value} onClick={resumeFlag}>
            Event started
          </Button>
          <Button disabled={actionLoading || !flag.value} onClick={pauseFlag}>
            Event paused
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}

const LeaderboardAhh = () => {
  const router = useRouter();
  const [users, setUsers] = useState<Array<User>>([])
  const [stocks, setStocks] = useState<Array<Stock>>([])

  const getUsers = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/users/all`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setUsers(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch users for scoreboard", e);
      handleAdminAuthError(e, router);
    }
  }

  const getStocks = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks/admin`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setStocks(resp.data || []);
    } catch (e) {
      console.error("Failed to fetch stocks for scoreboard", e);
      handleAdminAuthError(e, router);
    }
  }

  useEffect(() => {
    getUsers();
    getStocks();
  }, []);

  const netWorth = (balance: number, stocksOwned: Array<StockUser> = []) => {
    let bal = balance || 0;
    (stocksOwned || []).forEach(s => {
      bal += (s.amount * (stocks.find(sb => sb._id == s.id )?.price || 0));
    });
    return bal;
  }

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <h1 className={'text-5xl font-black text-white'}>Scoreboard <span className={'text-2xl font-black transition duration-500 hover:opacity-50 cursor-pointer'} onClick={() => {
          getUsers();
          getStocks();
        }}>Refresh</span> </h1>
        <Table className={'text-white'}>
          <TableHeader className={'text-white'}>
            <TableRow className={'text-white'}>
              <TableHead className="w-[40px] text-white">Position</TableHead>
              <TableHead className="w-[100px] text-white">Team Name</TableHead>
              <TableHead className={'text-white'}>Balance</TableHead>
              <TableHead className={'text-white'}>Net Worth</TableHead>
              <TableHead className="text-right text-white">Stocks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...users]
              .sort(
                (a, b) =>
                  netWorth(b.balance, b.stocksOwned) -
                  netWorth(a.balance, a.stocksOwned)
              )
              .map((user, i) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>${(user.balance || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    ${netWorth(user.balance, user.stocksOwned).toLocaleString()}
                  </TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <TableCell className="text-right cursor-pointer underline">Open</TableCell>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] z-50">
                      <DialogHeader>
                        <DialogTitle className="text-primary/60 font-black flex text-xl flex-col">
                          Stocks of {user.username}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                        <div className="gap-3">
                          {(!user.stocksOwned || user.stocksOwned.length === 0) ? (
                            <p className="text-sm text-white/50 text-center py-4">No stocks owned</p>
                          ) : (
                            user.stocksOwned.map((stock) => (
                              <Card key={stock.id} className="p-4 text-white mt-2">
                                <CardContent>
                                  <h1 className="text-lg font-black">
                                    {stocks.find((s) => s._id == stock.id)?.name || 'Stock'}
                                  </h1>
                                  <Label>
                                    Amount Owned (Valued at ${stock.buy} - {new Date(stock.boughtAt).toLocaleTimeString()})
                                  </Label>
                                  <Input
                                    readOnly
                                    value={stock.amount}
                                    type="number"
                                    className="mt-3"
                                  />
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}