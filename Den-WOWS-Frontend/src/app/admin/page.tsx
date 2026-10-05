"use client"
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import axios from "axios";
import {useEffect, useState, useRef} from "react";
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
import teamCredentialsData from "@/data/team_credentials.json";

const normalizeTeamKey = (name: string) =>
  (name || '').replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

const credentialsMap = new Map<string, { sno: string; team: string; password: string }>(
  teamCredentialsData.map((item) => [normalizeTeamKey(item.team), item])
);

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

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTeam, setCopiedTeam] = useState<string | null>(null);

  const handleCopy = (team: string, pass: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`Team: ${team} | Password: ${pass}`);
      setCopiedTeam(team);
      setTimeout(() => setCopiedTeam(null), 2000);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between items-center flex-wrap gap-4'}>
          <div className="flex items-baseline gap-3">
            <h1 className={'text-5xl font-black text-white'}>Users</h1>
            <span className="text-xl font-bold text-white/50">
              ({filteredUsers.length}{searchQuery ? ` of ${users.length}` : ''} Teams)
            </span>
          </div>

          <div className={'flex justify-start items-center gap-3 flex-wrap'}>
            <Input
              placeholder="Search team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-neutral-900 border-white/20 text-white placeholder:text-white/40"
            />

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

        <div className={'flex justify-start flex-col gap-4 mt-6 items-start w-full'}>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-white/50 w-full border border-dashed border-white/10 rounded-xl">
              No teams found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredUsers.map((user: User) => {
              const cred = credentialsMap.get(normalizeTeamKey(user.username));
              return (
                <Card key={user._id} className={'w-full p-6'}>
                  <CardContent>
                    <div className={'flex w-full justify-between items-center flex-wrap gap-4'}>
                      <div className="flex flex-col">
                        <h1 className={'text-2xl font-black text-white'}>{user.username}</h1>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {cred ? (
                            <div className="flex items-center gap-2 text-xs bg-primary/15 border border-primary/40 px-2.5 py-1 rounded-md text-primary font-mono font-bold">
                              <span>Password: <strong>{cred.password}</strong></span>
                              <button
                                type="button"
                                onClick={() => handleCopy(user.username, cred.password)}
                                className="underline hover:text-white ml-1 text-[11px]"
                              >
                                {copiedTeam === user.username ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-white/40 italic">Custom Team</span>
                          )}
                          <span className="text-xs text-white/60 font-mono">
                            Balance: ${(user.balance || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

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
              );
            })
          )}
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
  const [createNewsDto, setCreateNewsDto] = useState<CreateNewsDto>({ headline: '', desc: '', effects: [], sequence: 0, released: false })
  const [updateNewsDto, setUpdateNewsDto] = useState<UpdateNewsDto>({ headline: '', desc: '', sequence: 0})

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const initiaiseStockEffects = (stockList: Stock[], type: 'create' | 'update'): Array<StockEffect> => {
    return (stockList || []).map((stock) => ({ id: stock._id, newBuy: type === 'create' ? -1 : stock.price }));
  };

  const getStocks = async (): Promise<Stock[]> => {
    try {
      const resp = await axios.get(`${serverUrl}/stocks/admin`, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      const data: Stock[] = resp.data || [];
      setStocks(data);
      return data;
    } catch (e) {
      console.error("Failed to fetch stocks", e);
      handleAdminAuthError(e, router);
      return [];
    }
  };

  const createNews = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreateError("");
    try {
      const validEffects = (createNewsDto.effects || []).filter(
        ev => typeof ev.newBuy === 'number' && !isNaN(ev.newBuy) && ev.newBuy !== -1
      );
      const newsToSend = {
        ...createNewsDto,
        released: false,
        effects: validEffects
      };
      delete (newsToSend as any).releasedAt;

      await axios.post(`${serverUrl}/news`, newsToSend, {
        headers: { Authorization: getAdminAuthHeader() }
      });
      setIsCreateOpen(false);
      setCreateNewsDto({ headline: '', desc: '', effects: [], sequence: 0, released: false });
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
  };

  const updateNews = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEditError("");
    try {
      const validEffects = (updateNewsDto.effects || []).filter(
        ev => typeof ev.newBuy === 'number' && !isNaN(ev.newBuy) && ev.newBuy !== -1
      );
      const newsToUpdate = {
        ...updateNewsDto,
        effects: validEffects
      };
      await axios.patch(`${serverUrl}/news/${id}`, newsToUpdate, {
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
  };

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
                  const fetchedStocks = await getStocks();
                  const currentStocks = (fetchedStocks && fetchedStocks.length > 0) ? fetchedStocks : stocks;
                  setCreateNewsDto({
                    headline: '',
                    desc: '',
                    effects: initiaiseStockEffects(currentStocks, 'create'),
                    sequence: 0,
                    released: false
                  });
                }}>
                  New News
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[85vh] h-[85vh] flex flex-col p-0 overflow-hidden z-50">
                <form onSubmit={createNews} className="flex flex-col h-full overflow-hidden">
                  <div className="p-6 pb-4 border-b border-white/10 shrink-0">
                    <DialogHeader>
                      <DialogTitle className="text-primary font-black text-xl">
                        Create News
                      </DialogTitle>
                      <DialogDescription className="text-xs text-white/60">
                        News is queued by default with released=false until manually released.
                      </DialogDescription>
                    </DialogHeader>
                    {createError && (
                      <div className="p-3 mt-3 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                        {createError}
                      </div>
                    )}
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5 pr-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-white">News Headline</Label>
                        <Input
                          className="mt-1"
                          onChange={(e) => setCreateNewsDto({...createNewsDto, headline: e.target.value})}
                          value={createNewsDto.headline}
                          placeholder="Headline title"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-white">News Description</Label>
                        <Input
                          className="mt-1"
                          onChange={(e) => setCreateNewsDto({...createNewsDto, desc: e.target.value})}
                          value={createNewsDto.desc}
                          placeholder="Description"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-white">News Sequence</Label>
                        <Input
                          className="mt-1"
                          step="any"
                          type="number"
                          onChange={(e) => setCreateNewsDto({...createNewsDto, sequence: Number(e.target.value)})}
                          value={createNewsDto.sequence}
                          placeholder="Sequence number"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold text-sm text-white">Stock Price Effects</Label>
                        <span className="text-xs text-white/50">Leave -1 for no price change</span>
                      </div>

                      {stocks.length === 0 ? (
                        <div className="p-4 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs">
                          No stocks found in the database. Please create stocks in the Stocks tab first.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stocks.map((stock) => {
                            const currentEffect = (createNewsDto.effects || []).find((ef) => ef.id === stock._id);
                            const effectVal = currentEffect !== undefined ? currentEffect.newBuy : -1;
                            return (
                              <Card key={stock._id} className="p-4 bg-neutral-900/90 border border-white/10 text-white">
                                <CardContent className="p-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <Label className="font-semibold text-primary/90">
                                      {stock.name}
                                    </Label>
                                    <span className="text-xs text-white/60">
                                      Current: <strong className="text-green-400 font-mono">${stock.price ?? 0}</strong>
                                    </span>
                                  </div>
                                  <Label className="mt-2 block text-xs text-white/70">New Price (-1 to leave unchanged)</Label>
                                  <Input
                                    className="mt-1"
                                    type="number"
                                    step="any"
                                    value={effectVal}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const existing = [...(createNewsDto.effects || [])];
                                      const idx = existing.findIndex((ef) => ef.id === stock._id);
                                      if (idx >= 0) {
                                        existing[idx] = { id: stock._id, newBuy: val };
                                      } else {
                                        existing.push({ id: stock._id, newBuy: val });
                                      }
                                      setCreateNewsDto({ ...createNewsDto, effects: existing });
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 px-6 border-t border-white/10 bg-neutral-950/95 shrink-0 flex justify-between items-center">
                    <span className="text-xs text-white/50">Status: Queued (Unreleased)</span>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => setIsCreateOpen(false)} className="text-sm" variant="outline">
                        Cancel
                      </Button>
                      <Button type="submit" className="text-sm font-semibold" variant="secondary">
                        Confirm (Save to Queue)
                      </Button>
                    </div>
                  </div>
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
                        <Button onClick={async () => {
                          setEditError("");
                          setEditingNewsId(n._id);
                          const fetchedStocks = await getStocks();
                          const currentStocks = (fetchedStocks && fetchedStocks.length > 0) ? fetchedStocks : stocks;
                          const existingEffectsMap = new Map((n.effects || []).map(e => [e.id, e.newBuy]));
                          const initialEffects = currentStocks.map(stock => ({
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
                      <DialogContent className="sm:max-w-xl max-h-[85vh] h-[85vh] flex flex-col p-0 overflow-hidden z-50">
                        <form onSubmit={(e) => updateNews(n._id, e)} className="flex flex-col h-full overflow-hidden">
                          <div className="p-6 pb-4 border-b border-white/10 shrink-0">
                            <DialogHeader>
                              <DialogTitle className="text-primary font-black text-xl">
                                Edit Headline #{n.sequence}
                              </DialogTitle>
                              <DialogDescription className="text-xs text-white/60">
                                Update news headline, description, sequence, or stock price changes.
                              </DialogDescription>
                            </DialogHeader>
                            {editError && (
                              <div className="p-3 mt-3 text-sm bg-red-500/20 border border-red-500 text-red-300 rounded">
                                {editError}
                              </div>
                            )}
                          </div>

                          <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5 pr-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-semibold text-white">News Headline</Label>
                                <Input
                                  className="mt-1"
                                  onChange={(e) => setUpdateNewsDto({...updateNewsDto, headline: e.target.value})}
                                  value={updateNewsDto.headline}
                                  placeholder="Headline title"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-white">News Description</Label>
                                <Input
                                  className="mt-1"
                                  onChange={(e) => setUpdateNewsDto({...updateNewsDto, desc: e.target.value})}
                                  value={updateNewsDto.desc}
                                  placeholder="Description"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-white">News Sequence</Label>
                                <Input
                                  className="mt-1"
                                  step="any"
                                  type="number"
                                  onChange={(e) => setUpdateNewsDto({...updateNewsDto, sequence: Number(e.target.value)})}
                                  value={updateNewsDto.sequence}
                                  placeholder="Sequence number"
                                  required
                                />
                              </div>
                            </div>

                            <div className="pt-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="font-bold text-sm text-white">Stock Price Effects</Label>
                                <span className="text-xs text-white/50">Leave -1 for no price change</span>
                              </div>

                              {stocks.length === 0 ? (
                                <div className="p-4 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs">
                                  No stocks found in the database.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {stocks.map((stock) => {
                                    const currentEffect = (updateNewsDto.effects || []).find((ef) => ef.id === stock._id);
                                    const effectVal = currentEffect !== undefined ? currentEffect.newBuy : -1;
                                    return (
                                      <Card key={stock._id} className="p-4 bg-neutral-900/90 border border-white/10 text-white">
                                        <CardContent className="p-0">
                                          <div className="flex justify-between items-center mb-1">
                                            <Label className="font-semibold text-primary/90">
                                              {stock.name}
                                            </Label>
                                            <span className="text-xs text-white/60">
                                              Current: <strong className="text-green-400 font-mono">${stock.price ?? 0}</strong>
                                            </span>
                                          </div>
                                          <Label className="mt-2 block text-xs text-white/70">New Price (-1 to leave unchanged)</Label>
                                          <Input
                                            className="mt-1"
                                            type="number"
                                            step="any"
                                            value={effectVal}
                                            onChange={(e) => {
                                              const val = Number(e.target.value);
                                              const existing = [...(updateNewsDto.effects || [])];
                                              const idx = existing.findIndex((ef) => ef.id === stock._id);
                                              if (idx >= 0) {
                                                existing[idx] = { id: stock._id, newBuy: val };
                                              } else {
                                                existing.push({ id: stock._id, newBuy: val });
                                              }
                                              setUpdateNewsDto({ ...updateNewsDto, effects: existing });
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4 px-6 border-t border-white/10 bg-neutral-950/95 shrink-0 flex justify-end gap-2">
                            <Button type="button" onClick={() => setIsEditOpen(false)} className="text-sm" variant="outline">
                              Cancel
                            </Button>
                            <Button type="submit" className="text-sm font-semibold" variant="secondary">
                              Confirm
                            </Button>
                          </div>
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
  const isEditingRef = useRef(false);

  const getFlag = async () => {
    try {
      const resp = await axios.get(`${serverUrl}/flags/global`, {
        headers: { Authorization: getAdminAuthHeader() },
        timeout: 8000,
      });
      setFlag(resp.data);
      if (!isEditingRef.current && resp.data && resp.data.roundDurationSeconds !== undefined) {
        const secs = resp.data.roundDurationSeconds || 0;
        if (secs <= 0) {
          setDurationMinutes("");
        } else {
          const mins = secs / 60;
          setDurationMinutes(mins >= 1 ? (Number.isInteger(mins) ? mins : Number(mins.toFixed(1))) : 5);
        }
      }
    } catch (e) {
      console.error("Failed to fetch flag", e);
    }
  };

  const pauseFlag = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.post(`${serverUrl}/flags/pause`, {}, {
        headers: { Authorization: getAdminAuthHeader() },
        timeout: 10000,
      });
      await getFlag();
    } catch (e) {
      console.error("Failed to pause flag", e);
    } finally {
      setActionLoading(false);
    }
  };

  const resumeFlag = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      let durationSeconds = 300;
      if (durationMinutes !== "" && !isNaN(Number(durationMinutes)) && Number(durationMinutes) > 0) {
        durationSeconds = Math.round(Number(durationMinutes) * 60);
      } else if (flag?.roundDurationSeconds && flag.roundDurationSeconds >= 60) {
        durationSeconds = flag.roundDurationSeconds;
      }

      await axios.post(`${serverUrl}/flags/start`, { durationSeconds }, {
        headers: { Authorization: getAdminAuthHeader() },
        timeout: 10000,
      });
      setDurationMinutes(Math.round(durationSeconds / 60));
      await getFlag();
    } catch (e) {
      console.error("Failed to start flag", e);
    } finally {
      setActionLoading(false);
    }
  };

  const resetFlag = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      let durationSeconds = 300;
      if (durationMinutes !== "" && !isNaN(Number(durationMinutes)) && Number(durationMinutes) > 0) {
        durationSeconds = Math.round(Number(durationMinutes) * 60);
      } else if (flag?.roundDurationSeconds && flag.roundDurationSeconds >= 60) {
        durationSeconds = flag.roundDurationSeconds;
      }

      await axios.post(`${serverUrl}/flags/reset`, { durationSeconds }, {
        headers: { Authorization: getAdminAuthHeader() },
        timeout: 10000,
      });
      setDurationMinutes(Math.round(durationSeconds / 60));
      await getFlag();
    } catch (e) {
      console.error("Failed to reset flag", e);
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

  const durationSeconds = durationMinutes !== "" && !isNaN(Number(durationMinutes)) && Number(durationMinutes) > 0
    ? Math.round(Number(durationMinutes) * 60)
    : (flag?.roundDurationSeconds && flag.roundDurationSeconds >= 60 ? flag.roundDurationSeconds : 300);

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
            <span className="text-xs text-white/40 mt-1">Duration: {Math.round(durationSeconds / 60)} min</span>
          </div>
        </div>

        {/* Controls */}
        <div className={'gap-4 flex flex-wrap items-end'}>
          <div className={'flex flex-col gap-2'}>
            <Label className="text-white">Round Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="Minutes (e.g. 5)"
              value={durationMinutes}
              onFocus={() => { isEditingRef.current = true; }}
              onBlur={() => { isEditingRef.current = false; }}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-44 text-white bg-black/50 border-primary/40 focus:border-primary"
            />
          </div>

          <Button
            disabled={actionLoading || Boolean(flag.value && !flag.isAutoPausing)}
            onClick={resumeFlag}
            className="bg-primary hover:bg-primary/90 text-black font-bold disabled:opacity-50"
          >
            {actionLoading ? 'Please wait...' : (flag.value ? 'Event Running' : 'Start Event')}
          </Button>
          <Button
            disabled={actionLoading || !flag.value}
            onClick={pauseFlag}
            variant="outline"
            className="text-white border-primary/40 hover:bg-primary/20"
          >
            Pause Event
          </Button>
          <Button
            type="button"
            disabled={actionLoading}
            onClick={resetFlag}
            variant="destructive"
            className="bg-red-600/80 hover:bg-red-600 text-white font-bold"
          >
            Reset
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