import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {News} from "@/components/schemas";

export default function NewsProgram({ articles }: { articles: Array<News>}) {
  if (!articles || articles.length === 0) {
    return <h1 className="text-white">No news available</h1>
  }
  const sorted = [...articles].sort((a, b) => b.sequence - a.sequence);
  const [latest, ...oldArticles] = sorted;

  return (
    <div className={'w-full flex flex-col justify-center items-center'}>
      <h1 className={'text-primary/60 text-3xl font-black text-center'}>the wolves paper</h1>
      <h1 className={'text-xl font-light'}>the neighbourly wolv-ey gossip is here!</h1>

      {/* Latest news */}
      <h1 className={'text-primary/60 mt-8 text-2xl font-black text-center'}>the latest news</h1>
      <Card className={'p-0 mt-4 w-full'}>
        <CardContent className={'text-white p-4'}>
          <h1 className={'font-black text-primary/60 text-xl'}>{latest.headline}</h1>
          <h1 className={'font-light text-white'}>Headline #{latest.sequence}</h1>
          <h1 className={'font-light text-white text-sm'}>{latest.desc}</h1>
        </CardContent>
      </Card>

      {/* Old news */}
      {oldArticles.length > 0 && (
        <>
          <h1 className={'text-primary/60 mt-8 text-2xl font-black text-center'}>old news</h1>
          {oldArticles.map((article) => (
            <Card key={article._id} className={'p-0 mt-4 w-full'}>
              <CardContent className={'text-white p-4'}>
                <h1 className={'font-black text-primary/60 text-xl'}>{article.headline}</h1>
                <h1 className={'font-light text-white'}>Headline #{article.sequence}</h1>
                <h1 className={'font-light text-white text-sm'}>{article.desc}</h1>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
