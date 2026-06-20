import { useState, useEffect } from "react";
import { Globe, Coins, Flame, Clock, Languages, Award, BellRing, Sparkles, ChevronDown } from "lucide-react";

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
      freeShipping: "Frete VIP Expresso Cortesia nas compras acima de R$199",
      couponTip: "Ative seu Cupom de Boas-Vindas de Skincare, Calçados & Acessórios",
      countdownTitle: "Ofertas Especiais Femininas",
      secSecure: "Acesso Restrito para Associados Autorizados",
      announcement: "BOUTIQUE YING & CHEN • PRODUTOS DE BELEZA, CALÇADOS MACIOS & ACESSÓRIOS COBIÇADOS"
    },
    zh: {
      freeShipping: "尊享 VIP 航空免邮包税（满 ¥199）",
      couponTip: "点击领取美妆护肤、舒适美鞋与饰品大礼包",
      countdownTitle: "女性好物特惠倒计时",
      secSecure: "尊享会员安全加密端",
      announcement: "樱晨服饰 • 巴西热销美妆护肤、休闲美鞋与精致配饰系列"
    },
    en: {
      freeShipping: "Complimentary Express VIP Shipping on orders above $99",
      couponTip: "Unlock your Skincare, Footwear & Jewelry Welcome Voucher",
      countdownTitle: "Women's Favorites Private Event",
      secSecure: "Restricted Access • Authenticated Portal",
      announcement: "YING & CHEN BOUTIQUE • TOP-SELLING COSMETICS, CASUAL FOOTWEAR & GOLD JEWELRY"
    }
  }[language];

  return (
    <header className="w-full bg-[#0d0908] border-b border-[#cfab7c]/15 text-[#ebdcc6] select-none relative z-30">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-[#8b1e1a] via-[#b39063] to-[#8b1e1a] text-[#1c1815] text-[9px] md:text-[10px] font-bold py-2 px-4 text-center tracking-widest uppercase overflow-hidden shadow-md">
        <div className="animate-marquee inline-flex whitespace-nowrap gap-6 md:gap-10 items-center justify-center text-white">
          <span className="flex items-center gap-1.5 font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> {trans.announcement}
          </span>
          <span className="opacity-60 text-white">•</span>
          <span className="text-stone-100 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{trans.freeShipping}</span>
          <span className="opacity-60 text-white">•</span>
          <span className="text-yellow-100 font-serif italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{trans.couponTip}</span>
          <span className="opacity-60 text-white">•</span>
          <span className="font-mono text-[9px] text-[#ebdcc6] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{trans.secSecure}</span>
        </div>
      </div>

      {/* Navigation Layer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-auto min-h-[64px] md:h-24 py-3 md:py-0 flex items-center justify-between gap-4">
        
        {/* Left Side: Boutique Elegant Serif Monogram & Brand Logo */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-shrink">
          <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-[#8b1e1a] via-[#cfab7c] to-[#ebdcc6] shadow-[0_4px_12px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-350 rounded-none border border-[#cfab7c]/40 flex-shrink-0">
            <span className="text-[#0d0908] font-serif font-semibold text-lg md:text-2xl italic leading-none select-none">Y</span>
            <span className="absolute -bottom-1 -right-1 text-[7px] md:text-[9px] bg-[#0d0908] text-[#cfab7c] px-1 font-mono font-bold border border-[#cfab7c]/35 shadow-sm">C</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-medium text-white text-base md:text-xl lg:text-2xl tracking-[0.18em] md:tracking-[0.28em] truncate">
                YING & CHEN
              </h1>
              <span className="hidden xs:inline text-[#cfab7c] text-[8px] md:text-[9px] font-mono font-bold tracking-widest border border-[#cfab7c]/40 px-2 py-0.5 rounded-none uppercase bg-[#cfab7c]/5 flex-shrink-0 animate-pulse-soft">
                BOUTIQUE
              </span>
            </div>
            <p className="hidden md:block text-[9px] text-[#cfab7c]/70 tracking-[0.3em] uppercase font-mono mt-1 truncate">
              {language === "zh" ? "风靡巴西的热销女性美妆护肤与舒适好物专区" : "Beleza, Skincare & Moda Feminina"}
            </p>
          </div>
        </div>

        {/* Middle Side: Live Event Countdown */}
        <div className="hidden md:flex items-center gap-3 bg-stone-900/60 border border-[#cfab7c]/25 px-4 py-2 shadow-inner">
          <span className="text-[9px] lg:text-[10px] text-[#cfab7c] font-bold uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#cfab7c] animate-pulse" />
            <span className="hidden lg:inline">{trans.countdownTitle}:</span>
            <span className="lg:hidden">{trans.countdownTitle?.split(" ")[0]}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] lg:text-xs bg-[#cfab7c] text-[#0d0908] px-2 py-0.5 font-bold shadow-[0_0_8px_rgba(207,171,124,0.4)]">
              {formatNum(timeLeft.h)}
            </span>
            <span className="text-[#cfab7c] font-serif font-light">:</span>
            <span className="font-mono text-[11px] lg:text-xs bg-[#cfab7c] text-[#0d0908] px-2 py-0.5 font-bold shadow-[0_0_8px_rgba(207,171,124,0.4)]">
              {formatNum(timeLeft.m)}
            </span>
            <span className="text-[#cfab7c] font-serif font-light">:</span>
            <span className="font-mono text-[11px] lg:text-xs bg-[#cfab7c] text-[#0d0908] px-2 py-0.5 font-bold shadow-[0_0_8px_rgba(207,171,124,0.4)]">
              {formatNum(timeLeft.s)}
            </span>
          </div>
          <span className="hidden lg:inline text-[9px] bg-[#8b1e1a] text-white px-2 py-0.5 font-mono tracking-widest uppercase border border-red-500/20 font-bold shadow-md">
            90% OFF VIP
          </span>
        </div>

        {/* Right Side: Options & Toggles */}
        <div className="flex items-center gap-2 md:gap-3.5 flex-shrink-0">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-[#171311] px-2.5 py-1.5 border border-[#cfab7c]/20 hover:border-[#cfab7c]/45 transition-colors group">
            <Languages className="w-3.5 h-3.5 text-[#ebdcc6]/60 group-hover:text-[#cfab7c] transition-colors" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] md:text-[11px] font-medium text-slate-200 focus:outline-none cursor-pointer border-none font-mono focus:ring-0 pr-1"
            >
              <option value="pt" className="bg-[#1c1815] text-[#ebdcc6]">PT-BR</option>
              <option value="zh" className="bg-[#1c1815] text-[#ebdcc6]">中文</option>
              <option value="en" className="bg-[#1c1815] text-[#ebdcc6]">EN-US</option>
            </select>
          </div>

          {/* Currency picker */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#171311] px-2.5 py-1.5 border border-[#cfab7c]/20 hover:border-[#cfab7c]/45 transition-colors group">
            <Coins className="w-3.5 h-3.5 text-[#ebdcc6]/60 group-hover:text-[#cfab7c] transition-colors" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[10px] md:text-[11px] font-medium text-slate-200 focus:outline-none cursor-pointer border-none font-mono focus:ring-0 pr-1"
            >
              <option value="BRL" className="bg-[#1c1815] text-[#ebdcc6]">BRL (R$)</option>
              <option value="CNY" className="bg-[#1c1815] text-[#ebdcc6]">CNY (¥)</option>
              <option value="USD" className="bg-[#1c1815] text-[#ebdcc6]">USD ($)</option>
            </select>
          </div>

          {/* Secret Admin Trigger (US Badge) */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1c1815] hover:bg-[#cfab7c] text-[#cfab7c] hover:text-[#0d0908] border border-[#cfab7c]/30 font-mono text-[9px] font-bold tracking-tighter transition-all duration-300 shadow-md transform hover:rotate-12 cursor-pointer"
            title="Painel de Controle Administrador"
          >
            US
          </button>
        </div>
      </div>
    </header>
  );
}
