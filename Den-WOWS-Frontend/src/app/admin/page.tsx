"use client"
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAdminAuthHeader = () => {
  const username = typeof window !== 'undefined' ? localStorage.getItem('adminUsername') || '' : '';
  const password = typeof window !== 'undefined' ? localStorage.getItem('adminPassword') || '' : '';
  const credentials = typeof window !== 'undefined' && typeof window.btoa === 'function'
    ? window.btoa(`${username}:${password}`)
    : (typeof Buffer !== 'undefined' ? Buffer.from(`${username}:${password}`).toString('base64') : '');
  return `Basic ${credentials}`;
};

export default function Admin() {
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
  const [users, setUsers] = useState<Array<User>>([]);
  const [createUserDto, setCreateUserDto] = useState<CreateUserDto>({ username: "", password: "", balance: 0 });
  const [updateUserDto, setUpdateUserDto] = useState<UpdateUserDto>({ username: "", balance: 0 });

  const getUsers = async () => {
    const resp = await axios.get(`${serverUrl}/users/all`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      },
    });

    setUsers(resp.data);
  }

  const createUser = async () => {
    await axios.post(`${serverUrl}/auth/register`, createUserDto, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getUsers()
  }

  const deleteUser = async (id: string) => {
    await axios.delete(`${serverUrl}/users/${id}`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getUsers()
  }

  const updateUser = async (id: string) => {
    await axios.patch(`${serverUrl}/users/${id}`, updateUserDto,{
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getUsers()
  }

  useEffect(() => {
    getUsers()
  }, []);

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between flex-row'}>
          <h1 className={'text-5xl font-black text-white'}>Users</h1>
          <div className={'flex justify-start items-center gap-4'}>
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button onClick={() => setCreateUserDto({ username: "", password: "", balance: 200000})}>
                    New Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] z-50">
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create Team
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>Team Name</Label>
                      <Input id={'balance'} onChange={(e) => {setCreateUserDto({...createUserDto, username: e.target.value})}} value={createUserDto.username} placeholder={'Name'} />
                      <Label>Balance</Label>
                      <Input id={'balance'} onChange={(e) => {setCreateUserDto({...createUserDto, balance: Number(e.target.value)})}} value={createUserDto.balance} placeholder={'Starting Balance'} type={'number'} />
                      <Label>Password (More than 6 characters)</Label>
                      <Input id={'balance'} onChange={(e) => {setCreateUserDto({...createUserDto, password: e.target.value})}} value={createUserDto.password} placeholder={'Password'}/>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className={'text-sm'} variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={createUser} className={`text-sm ${createUserDto.password.length < 6 && "pointer-events-none opacity-50"}`} variant="secondary">Confirm</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </form>
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
                      <Dialog>
                        <form>
                          <DialogTrigger asChild>
                            <Button onClick={() => {setUpdateUserDto({username: user.username, balance: user.balance})}}>
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] z-50">
                            <DialogHeader>
                              <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                                Edit {user.username}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                              <div className="grid gap-3 mt-4">
                                <Label>Team Name</Label>
                                <Input id={'balance'} onChange={(e) => {
                                  setUpdateUserDto({...updateUserDto, username: e.target.value});
                                }} value={updateUserDto.username}/>
                                <Label>Balance</Label>
                                <Input id={'balance'} onChange={(e) => {
                                  setUpdateUserDto({...updateUserDto, balance: Number(e.target.value)});
                                }} value={updateUserDto.balance} type={'number'}/>
                                <div className="gap-3">
                                  {
                                    user.stocksOwned.map((stock) => (
                                      <Card key={stock.id} className={'p-4 text-white'}>
                                        <CardContent>
                                          <h1 className={'text-lg font-black'}>ERROR</h1>
                                          <Label>Amount Owned (Valued at {stock.buy} at {new Date(stock.boughtAt).toLocaleTimeString()}) (Bought At)</Label>
                                          <Input id={'balance'} onChange={() => {
                                            return;
                                          }} value={stock.amount} type={'number'} className={'mt-3'}/>
                                        </CardContent>
                                      </Card>
                                    ))
                                  }
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button className={'text-sm'} variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={() => {updateUser(user._id)}} className={'text-sm'} variant="secondary">Confirm</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </form>
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
  const [stocks, setStocks] = useState<Array<Stock>>([])
  const [createStockDto, setCreateStockDto] = useState<CreateStockDto>({ name: "", price: 0 });

  const getStocks = async () => {
    const resp = await axios.get(`${serverUrl}/stocks/admin`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    });
    setStocks(resp.data);
  }

  const createStock = async () => {
    await axios.post(`${serverUrl}/stocks`, createStockDto, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getStocks()
  }

  const deleteStock = async (id: string) => {
    await axios.delete(`${serverUrl}/stocks/${id}`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getStocks()
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
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button>
                    New Stock
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] z-50">
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create Stock
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>Stock Name</Label>
                      <Input id={'name'} onChange={(e) => {setCreateStockDto({...createStockDto, name: e.target.value})}} placeholder={'Name'} value={createStockDto.name}/>
                      <Label>Stock Price</Label>
                      <Input id={'balance'} onChange={(e) => {setCreateStockDto({...createStockDto, price: Number(e.target.value)})}} placeholder={'Starting Balance'} value={createStockDto.price} type={'number'} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className={'text-sm'} variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={createStock} className={'text-sm'} variant="secondary">Confirm</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </form>
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
                      <h1 className={'text-lg text-white'}>{stock.price}$/share</h1>
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
  const [stocks, setStocks] = useState<Array<Stock>>([])
  const [news, setNews] = useState<Array<News>>([])
  const [createNewsDto, setCreateNewsDto] = useState<CreateNewsDto>({ headline: '', desc: '', effectAt: 0, effects: [], sequence: 0})
  const [updateNewsDto, setUpdateNewsDto] = useState<UpdateNewsDto>({ headline: '', desc: '', effectAt: 0, sequence: 0})

  const initiaiseStockEffects = (type: 'create' | 'update'): Array<StockEffect> => {
    console.log()
    return stocks.map((stock) => ({ id: stock._id, newBuy: type == 'create' ? -1 : stock.price}))
  }

  const getStocks = async () => {
    const resp = await axios.get(`${serverUrl}/stocks/admin`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    });
    setStocks(resp.data);
  }

  const createNews = () => {
    const newsToSend = createNewsDto
    newsToSend.effects = newsToSend.effects.filter(e => e.newBuy !== -1)

    axios.post(`${serverUrl}/news`, newsToSend, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })
    getNews()
    getStocks()
  }

  const updateNews = (id: string) => {
    axios.patch(`${serverUrl}/news/${id}`, updateNewsDto, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    }).then(() => {
      getNews()
      getStocks()
    })
  }

  const deleteNews = (id: string) => {
    axios.delete(`${serverUrl}/news/${id}`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    }).then(() => {
      getNews()
      getStocks()
    })
  }

  const getNews = async () => {
    const resp = await axios.get(`${serverUrl}/news/admin`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    });

    setNews(resp.data)
  }

  useEffect(() => {
    getNews()
    getStocks()
  }, []);

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <div className={'flex w-full justify-between flex-row'}>
          <h1 className={'text-5xl font-black text-white'}>News</h1>
          <div className={'flex justify-start items-center gap-4'}>
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    getStocks()
                    setCreateNewsDto({ headline: '', desc: '', effectAt: 0, effects: initiaiseStockEffects('create'), sequence: 0})
                  }}>
                    New News
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] z-50">
                  <DialogHeader>
                    <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                      Create News
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <div className="grid gap-3 mt-4">
                      <Label>News Headline</Label>
                      <Input id={'headline'} onChange={(e) => {
                        setCreateNewsDto({...createNewsDto, headline: e.target.value})
                      }} value={createNewsDto.headline} placeholder={'Name'}/>
                      <Label>News Description</Label>
                      <Input id={'desc'} onChange={(e) => {
                        setCreateNewsDto({...createNewsDto, desc: e.target.value})
                      }} value={createNewsDto.desc} placeholder={'Name'}/>
                      <Label>News Sequence</Label>
                      <Input id={'sequence'} onChange={(e) => {
                        setCreateNewsDto({...createNewsDto, sequence: Number(e.target.value)})
                      }} value={createNewsDto.sequence} placeholder={'Sequence'} type={'number'}/>
                      <Label>News Timer (Seconds)</Label>
                      <Input id={'balance'} onChange={(e) => {
                        setCreateNewsDto({...createNewsDto, effectAt: Number(e.target.value)})
                      }} value={createNewsDto.effectAt} placeholder={'Seconds'} type={'number'}/>
                    </div>
                  </div>
                  <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                    <Label>Effects (Fill ALL)</Label>
                    <div className="gap-3 mt-4 flex flex-col">
                      {
                        createNewsDto.effects.map((effect) => (
                          <Card key={effect.id} className={'p-4 text-white'}>
                            <CardContent>
                              <Label>Effecting Stock</Label>
                              <Input readOnly className={'mt-2'} id={'stock'} value={stocks.find(s => s._id == effect.id)?.name || 'error'} type={'name'}/>
                              <Label className={'mt-4'}>New Price</Label>
                              <Input className={'mt-2'} id={'balance'} onChange={(e) => {
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
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className={'text-sm'} variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={createNews} className={`text-sm ${createNewsDto.effects.find(s => s.newBuy == -1 && "pointer-events-none opacity-50")}`} variant="secondary">Confirm</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        </div>
        <div className={'flex justify-start flex-col gap-4 mt-4 items-start w-full'}>
          {news.map((news) => (
            <Card key={news._id} className={'w-full p-6'}>
              <CardContent>
                <div className={'flex w-full justify-between flex-row'}>
                  <div className={'flex justify-start items-start flex-col'}>
                    <h1 className={'text-2xl font-black text-white'}>Heading #{news.sequence} ({news.headline})</h1>
                    <h1 className={'text-lg text-white'}>{news.desc}</h1>
                  </div>
                  <div className={'flex justify-start items-center gap-4'}>
                    <Dialog>
                      <form>
                        <DialogTrigger asChild>
                          <Button onClick={() => setUpdateNewsDto({
                            headline: news.headline,
                            desc: news.desc,
                            effectAt: news.effectAt,
                            sequence: news.sequence,
                          })}>
                            Edit News
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] z-50">
                          <DialogHeader>
                            <DialogTitle className={'text-primary/60 font-black flex text-xl flex-col'}>
                              Edit Headline #{news.sequence}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                            <div className="grid gap-3 mt-4">
                              <Label>News Headline</Label>
                              <Input id={'headline'} onChange={(e) => {
                                setUpdateNewsDto({...updateNewsDto, headline: e.target.value})
                              }} value={updateNewsDto.headline} placeholder={'Name'}/>
                              <Label>News Description</Label>
                              <Input id={'desc'} onChange={(e) => {
                                setUpdateNewsDto({...updateNewsDto, desc: e.target.value})
                              }} value={updateNewsDto.desc} placeholder={'Name'}/>
                              <Label>News Sequence</Label>
                              <Input id={'sequence'} onChange={(e) => {
                                setUpdateNewsDto({...updateNewsDto, sequence: Number(e.target.value)})
                              }} value={updateNewsDto.sequence} placeholder={'Sequence'} type={'number'}/>
                              <Label>News Timer (Seconds)</Label>
                              <Input id={'balance'} onChange={(e) => {
                                setUpdateNewsDto({...updateNewsDto, effectAt: Number(e.target.value)})
                              }} value={updateNewsDto.effectAt} placeholder={'Seconds'} type={'number'}/>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button className={'text-sm'} variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={() => updateNews(news._id)} className={'text-sm'} variant="secondary">Confirm</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>
                    <Button onClick={() => deleteNews(news._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const BigBlackSwitch = () => {
  const [flag, setFlag] = useState<Flag | null>(null)

  const getFlag = async () => {
    const resp = await axios.get(`${serverUrl}/flags/global`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })

    setFlag(resp.data)
  }

  const pauseFlag = async () => {
    await axios.post(`${serverUrl}/flags/pause`, {}, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })

    window.location.reload()
  }

  const resumeFlag = async () => {
    await axios.post(`${serverUrl}/flags/start`, {}, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })

    window.location.reload()
  }

  useEffect(() => {
    getFlag()
  }, [])

  return flag && (
    <Card className={'w-full p-8'}>
      <CardContent>
        <h1 className={'text-5xl font-black text-white'}>the big switch (EVENT IS {flag.value ? 'ON' : 'OFF'})</h1>
        <div className={'mt-4 gap-4 flex'}>
          <Button className={flag.value ? 'pointer-events-none opacity-50': ''} onClick={resumeFlag}>
            Ateeb says go
          </Button>
          <Button className={!flag.value ? 'pointer-events-none opacity-50' : ''} onClick={pauseFlag}>
            Ateeb says pause
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const LeaderboardAhh = () => {
  const [users, setUsers] = useState<Array<User>>([])
  const [stocks, setStocks] = useState<Array<Stock>>([])

  const getUsers = async () => {
    const resp = await axios.get(`${serverUrl}/users/all`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    })

    setUsers(resp.data)
  }

  const getStocks = async () => {
    const resp = await axios.get(`${serverUrl}/stocks/admin`, {
      headers: {
        Authorization: getAdminAuthHeader(),
      }
    });
    setStocks(resp.data);
  }

  useEffect(() => {
    // run once immediately
    getUsers();
    getStocks();
  }, []);


  const netWorth = (balance: number, stocksOwned: Array<StockUser>) => {
    let bal = balance
    stocksOwned.forEach(s => {
      bal += (s.amount * (stocks.find(sb => sb._id == s.id )?.price || 0))
    })
    return bal
  }

  return (
    <Card className={'w-full p-8'}>
      <CardContent>
        <h1 className={'text-5xl font-black text-white'}>Scoreboard (you suck) <span className={'text-2xl font-black transition duration-500 hover:opacity-50 cursor-pointer'} onClick={() => {
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
            {[...users] // make a shallow copy to avoid mutating state
              .sort(
                (a, b) =>
                  netWorth(b.balance, b.stocksOwned) -
                  netWorth(a.balance, a.stocksOwned) // descending order
              )
              .map((user, i) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>${user.balance}</TableCell>
                  <TableCell>
                    ${netWorth(user.balance, user.stocksOwned)}
                  </TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <TableCell className="text-right">Open</TableCell>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] z-50">
                      <DialogHeader>
                        <DialogTitle className="text-primary/60 font-black flex text-xl flex-col">
                          Stocks of {user.username}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
                        <div className="gap-3">
                          {user.stocksOwned.map((stock) => (
                            <Card key={stock.id} className="p-4 text-white">
                              <CardContent>
                                <h1 className="text-lg font-black">
                                  {stocks.find((s) => s._id == stock.id)?.name}
                                </h1>
                                <Label>
                                  Amount Owned {stock.buy}{" "}
                                  {new Date(stock.boughtAt).toLocaleTimeString()}
                                </Label>
                                <Input
                                  id="balance"
                                  readOnly
                                  value={stock.amount}
                                  type="number"
                                  className="mt-3"
                                />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button className="text-sm" variant="outline">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
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