import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {Stock} from "@/components/schemas";
import {useState} from "react";
import {Label} from "@/components/ui/label";
import axios from "axios";

const getPercentage = (price: number, old: number): string => {
  if (price > old) {
    return `+${(((price / old) * 100) - 100).toFixed(2)}%`;
  } else if (price < old) {
    return `-${(100 - ((price / old) * 100)).toFixed(2)}%`;
  } else return '0%';
};

const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StockProgram({ stocks, onRefresh } : {stocks: Array<Stock>; onRefresh?: () => void}) {
  return (
    <div className={'w-full flex flex-col justify-center items-center pb-8'}>
      <h1 className={'text-primary/60 text-3xl font-black text-center'}>wolves stock exchange</h1>
      <h1 className={'text-xl font-light'}>buy or sell. your ultimate demise</h1>
      <p className={'text-light text-center w-full mt-4 text-sm'}>
        welcome to the market! choose the stock you wanna interact with and it shall be yours to trade with!
      </p>
      <div className={'flex flex-row flex-wrap justify-center items-center w-full gap-2 mt-8'}>
        {stocks.map((stock) => (
          <StockCard key={stock._id} stock={stock} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}

export function StockCard({ stock, onRefresh }: { stock: Stock; onRefresh?: () => void }) {
  let oldPrice = stock.price;
  if (stock.priceHistory.length >= 2) {
    oldPrice = stock.priceHistory[stock.priceHistory.length - 2];
  }

  const chartData = stock.priceHistory.map((price, i) => ({
    name: i + 1,
    value: price,
  }));

  const [amount, setAmount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const buyStock = async () => {
    setDisabled(true);
    try {
      await axios.post(`${serverUrl}/stocks/buy/${stock._id}`, { amount }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setOpen(false);
      setError('');
      setAmount(0);
      onRefresh?.();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.message || "Error buying stock");
      } else {
        setError("Error buying stock");
      }
    }
    setDisabled(false);
  };

  const sellStock = async () => {
    setDisabled(true);
    try {
      await axios.post(`${serverUrl}/stocks/sell/${stock._id}`, { amount }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setOpen(false);
      setError('');
      setAmount(0);
      onRefresh?.();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.message || "Error selling stock");
      } else {
        setError("Error selling stock");
      }
    }
    setDisabled(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Card className="p-0 gap-0 text-white transition duration-500 hover:opacity-75 cursor-pointer">
            <CardContent className="p-3">
              <h1 className="text-sm font-light">{stock.name}</h1>
              <h1
                className={`text-xs font-light ${
                  stock.price > oldPrice
                    ? "text-green-500"
                    : stock.price < oldPrice
                      ? "text-red-500"
                      : "text-white"
                }`}
              >
                ${oldPrice.toFixed(2)} → ${stock.price.toFixed(2)}
              </h1>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] z-50">
          <DialogHeader>
            <DialogTitle className="text-primary/60 font-black flex text-xl flex-col">
              <span>buy {stock.name}</span>
              <span className="font-light text-white text-sm">
                ${stock.price}{" "}
                <span
                  className={`${
                    stock.price > oldPrice
                      ? "text-green-500"
                      : stock.price < oldPrice
                        ? "text-red-500"
                        : "text-white"
                  }`}
                >
                  ({getPercentage(stock.price, oldPrice)})
                </span>
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid focus:outline-none focus:ring-0 [&_*]:focus:outline-none [&_*]:focus:ring-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#fff"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fill: "#fff", fontSize: 12 }}
                />
                <YAxis stroke="#fff" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black text-white rounded-md p-2 text-sm shadow-md">
                          <p className="font-semibold">headline {Number(label || 0) - 1}</p>
                          <p>${payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: "transparent" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ffdb5855"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: "#ffdb58", fill: "#ffdb58" }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <h1 className="text-white/50 w-full text-center">headline #</h1>
            <div className="grid gap-3 mt-4">
              {error && (
                <h1 className="w-full p-3 rounded border border-red-500 text-red-500 bg-red-300">
                  {error}
                </h1>
              )}
              <Label># of shares to sell/purchase</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="# of shares to sell/purchase"
                type="number"
              />
            </div>
          </div>
          <DialogFooter
            className={`transition duration-500 ${
              disabled && "pointer-events-none opacity-50"
            }`}
          >
            <DialogClose asChild>
              <Button className="text-sm" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={sellStock} className="text-sm" variant="destructive" type="submit">
              Sell
            </Button>
            <Button onClick={buyStock} className="text-sm" variant="secondary">
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}