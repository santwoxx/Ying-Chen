import { useState, useEffect } from "react";
import { Globe, Coins, Flame, Clock, Languages, Award, BellRing, Sparkles, Search, ShoppingCart, User as UserIcon } from "lucide-react";

interface ChineseEcommHeaderProps {
  language: "pt" | "zh" | "en";
  setLanguage: (lang: "pt" | "zh" | "en") => void;
  currency: string;
  setCurrency: (curr: string) => void;
  onOpenAdmin: () => void;
}

export default function ChineseEcommHeader({ language, setLanguage, currency, setCurrency, onOpenAdmin }: ChineseEcommHeaderProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 11, s: 11 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) {
          s--;
        } else {
          s = 59;
          if (m > 0) {
            m--;
          } else {
            m = 59;
            if (h > 0) {
              h--;
            } else {
              h = 11;
            }
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => String(num).padStart(2, "0");

  const trans = {
    pt: {
      freeShipping: "Frete Grátis Expresso acima de R$99 • Remessa Conforme Garantida",
      couponTip: "Ganhe R$ 15 OFF no seu primeiro pedido com cupom",
      countdownTitle: "Oferta Relâmpago Exclusiva",
      secSecure: "Portal Protegido SHEIN SSL",
      announcement: "MOTF PREMIUM • SEDA NATURAL, ALTA COSTURA E BELEZA DE LUXO"
    },
    zh: {
      freeShipping: "限时包邮 • 满 ¥99 免除跨境关税",
      couponTip: "首单立减 ¥15，使用双十一优惠码",
      countdownTitle: "限时秒杀倒计时",
      secSecure: "安全加密数据通道",
      announcement: "MOTF 尊享系列 • 真丝桑蚕丝、高定服装与高端美妆"
    },
    en: {
      freeShipping: "Free Express Shipping above $49 • Duty-free Guarantee",
      couponTip: "Get $5 OFF your first order with VIP voucher",
      countdownTitle: "Limited Flash Deal Event",
      secSecure: "SHEIN Secure Gateway Node",
      announcement: "MOTF PREMIUM • EXQUISITE SILK, FINE COUTURE & ELEGANT BEAUTY"
    }
  }[language];

  return (
    <header className="w-full bg-white border-b border-stone-200 text-[#222] select-none relative z-30">
      {/* Top Banner Ticker */}
      <div className="bg-[#222] text-white text-[9px] md:text-[10px] font-bold py-2 px-4 text-center tracking-widest uppercase overflow-hidden">
        <div className="animate-marquee inline-flex whitespace-nowrap gap-6 md:gap-10 items-center justify-center">
          <span className="flex items-center gap-1.5 text-white">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> {trans.announcement}
          </span>
          <span className="opacity-40 text-white">•</span>
          <span className="text-[#cfab7c] font-semibold">{trans.freeShipping}</span>
          <span className="opacity-40 text-white">•</span>
          <span className="text-stone-200 font-serif italic">{trans.couponTip}</span>
          <span className="opacity-40 text-white">•</span>
          <span className="font-mono text-[9px] text-[#ebdcc6] font-semibold">{trans.secSecure}</span>
        </div>
      </div>

      {/* Main Row: Logo, Search Bar, and Controls */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: MOTF Premium Branding */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-serif font-bold text-black text-2xl lg:text-3xl tracking-[0.25em]">
                MOTF
              </h1>
              <span className="text-[9px] font-mono font-bold tracking-widest text-stone-500 uppercase border border-stone-300 px-1 py-0.5 bg-stone-50">
                PREMIUM
              </span>
            </div>
            <p className="text-[8px] text-stone-400 tracking-[0.35em] uppercase font-mono mt-1 select-none">
              BY YING & CHEN
            </p>
          </div>
        </div>

        {/* Center: SHEIN Mock Search Bar */}
        <div className="w-full max-w-md md:max-w-lg relative flex items-center">
          <div className="w-full flex items-center bg-stone-100 border border-stone-200 rounded-none focus-within:border-black transition-colors">
            <input
              type="text"
              placeholder={language === "zh" ? "搜索高定真丝, 巴西球衣, SHEGLAM美妆..." : language === "en" ? "Search for Premium Silk, Brazil Jersey, Cosmetics..." : "Pesquisar por Seda, Vestido Midi, Camisa do Brasil, Blush..."}
              className="w-full bg-transparent text-xs text-stone-800 px-4 py-2.5 outline-none placeholder:text-stone-400"
              disabled
            />
            <button type="button" className="px-4.5 py-2.5 text-stone-600 hover:text-black transition-colors" disabled>
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Language, Currency, Cart, Account and Secret admin trigger */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Language select */}
          <div className="flex items-center gap-1 bg-stone-50 px-2 py-1.5 border border-stone-200 hover:border-stone-400 transition-colors">
            <Languages className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold text-stone-700 focus:outline-none cursor-pointer border-none pr-1"
            >
              <option value="pt">PT-BR</option>
              <option value="zh">中文</option>
              <option value="en">EN-US</option>
            </select>
          </div>

          {/* Currency picker */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-50 px-2 py-1.5 border border-stone-200 hover:border-stone-400 transition-colors">
            <Coins className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-stone-700 focus:outline-none cursor-pointer border-none pr-1"
            >
              <option value="BRL">BRL (R$)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          {/* Mock Cart and Account */}
          <div className="flex items-center gap-1.5 text-stone-600 border-l border-stone-200 pl-3">
            <button className="p-1.5 hover:bg-stone-100 text-stone-700 transition-all rounded-full" title="Carrinho">
              <ShoppingCart className="w-4 h-4" />
            </button>
            
            {/* Secret Admin trigger built to look like a VIP account button */}
            <button
              onClick={onOpenAdmin}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-900 hover:bg-stone-700 text-white font-mono text-[9px] font-bold transition-all cursor-pointer border-none shadow-sm"
              title="Minha Conta VIP / Painel Admin"
            >
              US
            </button>
          </div>

        </div>
      </div>

      {/* Sub-Navigation: Ticker Toggles */}
      <div className="bg-stone-50 border-t border-stone-150 py-2.5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-6 text-[10px] md:text-xs font-bold text-stone-700 uppercase tracking-wider overflow-x-auto whitespace-nowrap">
          <span className="text-black border-b border-black pb-0.5 cursor-pointer">Categorias</span>
          <span className="hover:text-black cursor-pointer">Só para você</span>
          <span className="hover:text-black cursor-pointer text-[#8b1e1a]">Novo em</span>
          <span className="hover:text-black cursor-pointer">Envio nacional</span>
          <span className="hover:text-black cursor-pointer text-[#8b1e1a]">Promoção</span>
          <span className="hover:text-black cursor-pointer">Roupas femininas</span>
          <span className="hover:text-black cursor-pointer">Moda praia</span>
          <span className="hover:text-black cursor-pointer">Sapatos</span>
          <span className="hover:text-black cursor-pointer">Infantil</span>
          <span className="hover:text-black cursor-pointer">Roupas masculinas</span>
          <span className="hover:text-black cursor-pointer">Casa & Decoração</span>
          <span className="hover:text-black cursor-pointer">Tamanhos Grandes</span>
          <span className="hover:text-black cursor-pointer">Joias e acessórios</span>
          <span className="hover:text-black cursor-pointer">Beleza e saúde</span>
        </div>
      </div>
    </header>
  );
}
