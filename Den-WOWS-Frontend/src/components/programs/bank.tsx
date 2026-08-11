import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Stock, User} from "@/components/schemas";

export default function BankProgram({me, stocks} : { me: User | null, stocks: Array<Stock>}) {
  if (!me) return
  const netWorth = () => {
    let bal = me.balance
    me.stocksOwned.forEach(s => {
      bal += (s.amount * (stocks.find(sb => sb._id == s.id )?.price || 0))
    })
    return bal
  }

  return (
    <div className={'w-full flex flex-col justify-center items-center pb-8'}>
      <h1 className={'text-primary/60 text-3xl font-black text-center'}>bank of wolves</h1>
      <h1 className={'text-xl font-light text-center'}>welcome to the bank of wolves! here to tame your every need.</h1>
      <Card className={'p-0 mt-4'}>
        <CardContent className={'text-white p-4'}>
          <h1><strong>Balance</strong> : ${me.balance}</h1>
        </CardContent>
      </Card>
      <Card className={'p-0 mt-4'}>
        <CardContent className={'text-white p-4'}>
          <h1><strong>Net Worth</strong> : ${netWorth()}</h1>
        </CardContent>
      </Card>
      <h1 className={'text-primary/60 text-2xl mt-4 font-black text-center mt-8'}>stock profile</h1>
      {me.stocksOwned.length > 0 ?
        <div className={'w-full flex gap-4 justify-center items-center flex-wrap'}>
          {me.stocksOwned.map((stock) => {
            return stock.amount > 0 && (
              <Card key={stock.id} className={'p-0 gap-0 text-white transition duration-500 hover:opacity-75 cursor-pointer'}>
                <CardContent className={'p-3'}>
                  <h1 className={'text-sm font-light'}>{stocks.find(s => s._id == stock.id)?.name}</h1>
                  <h1 className={`text-xs font-light`}>Amount Of Shares : {stock.amount}</h1>
                  <h1 className={`text-xs font-light`}>Valued At : {stock.amount * (stocks.find(s => s._id == stock.id)?.price || 0)}</h1>
                </CardContent>
              </Card>
            )
          })}
        </div> :
        <p className={'mt-4 text-sm text-white/50'}>No Owned Stocks Found</p>}
    </div>
  )
}