import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Globe, DollarSign, Coins } from "lucide-react";

interface MarketData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export default function GlobalMarkets() {
  // International Indices
  const asiaIndices: MarketData[] = [
    { name: "Nikkei 225", value: 33464, change: 245, changePercent: 0.74 },
    { name: "Hang Seng", value: 17408, change: -123, changePercent: -0.70 },
    { name: "Shanghai Composite", value: 3027, change: 15, changePercent: 0.50 },
    { name: "KOSPI", value: 2456, change: 8, changePercent: 0.33 },
    { name: "SET (Thailand)", value: 1425, change: -5, changePercent: -0.35 },
  ];

  const europeIndices: MarketData[] = [
    { name: "FTSE 100", value: 7532, change: 42, changePercent: 0.56 },
    { name: "DAX", value: 15890, change: 78, changePercent: 0.49 },
    { name: "CAC 40", value: 7234, change: -12, changePercent: -0.17 },
    { name: "FTSE MIB", value: 28456, change: 134, changePercent: 0.47 },
  ];

  const americasIndices: MarketData[] = [
    { name: "S&P 500", value: 4567, change: 23, changePercent: 0.51 },
    { name: "Dow Jones", value: 35421, change: 156, changePercent: 0.44 },
    { name: "NASDAQ", value: 14234, change: 89, changePercent: 0.63 },
    { name: "Russell 2000", value: 1876, change: -8, changePercent: -0.43 },
  ];

  // Currency Pairs
  const currencies: MarketData[] = [
    { name: "EUR/USD", value: 1.0875, change: 0.0023, changePercent: 0.21 },
    { name: "GBP/USD", value: 1.2634, change: -0.0012, changePercent: -0.09 },
    { name: "USD/JPY", value: 149.45, change: 0.78, changePercent: 0.52 },
    { name: "USD/CNY", value: 7.2456, change: 0.0234, changePercent: 0.32 },
    { name: "AUD/USD", value: 0.6523, change: -0.0045, changePercent: -0.68 },
    { name: "USD/CHF", value: 0.8876, change: 0.0015, changePercent: 0.17 },
  ];

  // Commodities
  const commodities: MarketData[] = [
    { name: "Gold", value: 2034, change: 12.5, changePercent: 0.62 },
    { name: "Silver", value: 23.45, change: -0.23, changePercent: -0.97 },
    { name: "Crude Oil (WTI)", value: 78.34, change: 1.45, changePercent: 1.89 },
    { name: "Brent Oil", value: 82.67, change: 1.23, changePercent: 1.51 },
    { name: "Natural Gas", value: 2.87, change: -0.12, changePercent: -4.01 },
    { name: "Copper", value: 3.84, change: 0.05, changePercent: 1.32 },
  ];

  const MarketCard = ({ title, data, icon: Icon }: { title: string; data: MarketData[]; icon: any }) => (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-2xl font-bold mt-1">{item.value.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-bold">{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}</span>
              </div>
              <div className={`text-sm mt-1 ${item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  // Currency Strength Meter
  const currencyStrength = [
    { currency: "USD", strength: 75, change: 0.5 },
    { currency: "EUR", strength: 68, change: 0.3 },
    { currency: "JPY", strength: 62, change: -0.4 },
    { currency: "GBP", strength: 71, change: -0.2 },
    { currency: "CHF", strength: 65, change: 0.1 },
    { currency: "AUD", strength: 58, change: -0.6 },
    { currency: "CAD", strength: 60, change: 0.2 },
    { currency: "CNY", strength: 55, change: -0.3 },
  ];

  // Market Hours Status
  const marketHours = [
    { region: "Asia", status: "Closed", nextOpen: "in 2h 15m" },
    { region: "Europe", status: "Open", closes: "in 5h 30m" },
    { region: "Americas", status: "Pre-market", opens: "in 45m" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Global Markets</h1>
        </div>

        {/* Market Hours Status */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {marketHours.map((market, index) => (
            <Card key={index} className="p-4 bg-zinc-900/50 border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">{market.region}</div>
                  <div className="text-xl font-bold mt-1">{market.status}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {market.status === "Open" ? `Closes ${market.closes}` : 
                     market.status === "Closed" ? `Opens ${market.nextOpen}` : 
                     `Opens ${market.opens}`}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  market.status === "Open" ? 'bg-green-500' : 
                  market.status === "Pre-market" ? 'bg-yellow-500' : 
                  'bg-zinc-600'
                }`}></div>
              </div>
            </Card>
          ))}
        </div>

        {/* International Indices */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <MarketCard title="Asia Pacific" data={asiaIndices} icon={Globe} />
          <MarketCard title="Europe" data={europeIndices} icon={Globe} />
          <MarketCard title="Americas" data={americasIndices} icon={Globe} />
        </div>

        {/* Currencies */}
        <div className="mb-6">
          <MarketCard title="Major Currency Pairs" data={currencies} icon={DollarSign} />
        </div>

        {/* Currency Strength Meter */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800 mb-6">
          <h2 className="text-xl font-bold mb-4">Currency Strength Meter</h2>
          <div className="space-y-3">
            {currencyStrength.sort((a, b) => b.strength - a.strength).map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.currency}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.strength}/100</span>
                    <span className={`text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.strength >= 70 ? 'bg-green-500' :
                      item.strength >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.strength}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Commodities */}
        <div className="mb-6">
          <MarketCard title="Commodities" data={commodities} icon={Coins} />
        </div>

        {/* Global Economic Calendar */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Global Economic Calendar (Today)</h2>
          <div className="space-y-3">
            {[
              { time: "09:30", region: "EUR", event: "ECB Interest Rate Decision", impact: "High" },
              { time: "13:30", region: "USD", event: "Non-Farm Payrolls", impact: "High" },
              { time: "15:00", region: "USD", event: "ISM Manufacturing PMI", impact: "Medium" },
              { time: "23:50", region: "JPY", event: "BoJ Policy Meeting Minutes", impact: "Medium" },
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-zinc-400 font-mono text-sm">{event.time}</div>
                  <div className="w-12 text-center">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                      {event.region}
                    </span>
                  </div>
                  <div className="font-medium">{event.event}</div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    event.impact === "High" ? 'bg-red-500/20 text-red-400' :
                    event.impact === "Medium" ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-zinc-300">
            <strong>Note:</strong> Market data is updated in real-time during trading hours. 
            Currency strength is calculated based on multiple currency pairs. 
            Economic calendar shows high-impact events that may affect global markets.
          </p>
        </div>
      </div>
    </div>
  );
}
