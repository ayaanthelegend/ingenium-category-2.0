import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stock, StockUser, User } from "@/components/schemas";

export default function LeaderboardProgram({ users = [], stocks = [] }: { users: Array<User>; stocks: Array<Stock> }) {
  const netWorth = (balance: number, stocksOwned: Array<StockUser> = []) => {
    let bal = balance || 0;
    (stocksOwned || []).forEach((s) => {
      bal += s.amount * (stocks.find((sb) => sb._id === s.id)?.price || 0);
    });
    return bal;
  };

  const sortedUsers = [...users].sort(
    (a, b) => netWorth(b.balance, b.stocksOwned) - netWorth(a.balance, a.stocksOwned)
  );

  return (
    <div className="w-full flex flex-col justify-center items-center pb-8">
      <h1 className="text-primary/60 text-3xl font-black text-center">wolves leaderboard</h1>
      <h1 className="text-xl font-light text-center">see where your team stands against the pack</h1>

      <Card className="w-full p-4 mt-6 bg-black/40 border-primary/20">
        <CardContent className="p-2">
          {sortedUsers.length === 0 ? (
            <p className="text-center text-white/50 py-4">No teams found</p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="w-[60px] text-white font-bold">Rank</TableHead>
                  <TableHead className="text-white font-bold">Team Name</TableHead>
                  <TableHead className="text-white font-bold">Balance</TableHead>
                  <TableHead className="text-white font-bold">Net Worth</TableHead>
                  <TableHead className="text-right text-white font-bold">Holdings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user, i) => (
                  <TableRow key={user._id || i} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="font-bold text-primary">{i + 1}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>${(user.balance || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-400">
                      ${netWorth(user.balance, user.stocksOwned).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 text-xs border-primary/40">
                            View Stocks
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] z-50">
                          <DialogHeader>
                            <DialogTitle className="text-primary/60 font-black text-xl">
                              Stocks of {user.username}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-3 mt-2">
                            {(!user.stocksOwned || user.stocksOwned.filter((s) => s.amount > 0).length === 0) ? (
                              <p className="text-sm text-white/50 text-center py-4">No stocks owned</p>
                            ) : (
                              user.stocksOwned
                                .filter((s) => s.amount > 0)
                                .map((stock) => {
                                  const stockInfo = stocks.find((s) => s._id === stock.id);
                                  return (
                                    <Card key={stock.id} className="p-3 text-white bg-black/50 border-white/10">
                                      <CardContent className="p-2">
                                        <h1 className="text-md font-bold text-primary">
                                          {stockInfo?.name || "Unknown Stock"}
                                        </h1>
                                        <Label className="text-xs text-white/70">
                                          Shares: {stock.amount} | Valued at: ${(stock.amount * (stockInfo?.price || 0)).toLocaleString()}
                                        </Label>
                                      </CardContent>
                                    </Card>
                                  );
                                })
                            )}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
