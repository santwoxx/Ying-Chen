import { useState, useEffect } from "react";
import { Globe, Coins, Flame, Clock, Languages, Award, BellRing, Sparkles } from "lucide-react";

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
      couponTip: "Ative seu Cupom de Boas-Vindas da Alta Costura",
      countdownTitle: "Descontos da Temporada de Seda",
      secSecure: "Acesso Restrito para Associados Autorizados",
      announcement: "BOUTIQUE LUXO YING & CHEN • COLECÇÃO SEDA E LINHO AUTÊNTICA"
    },
    zh: {
      freeShipping: "尊享 VIP 航空免邮包税（满 ¥199）",
      couponTip: "点击领取高级定制春日迎新大礼包",
      countdownTitle: "春季蚕丝大赏倒计时",
      secSecure: "尊享会员安全加密端",
      announcement: "樱晨女装 • 东方雅韵之美 • 高级蚕丝面料成衣系列"
    },
    en: {
      freeShipping: "Complimentary Express VIP Shipping on orders above $99",
      couponTip: "Unlock your Haute Couture Welcome Voucher",
      countdownTitle: "Silk Season Private Event",
      secSecure: "Restricted Access • Authenticated Portal",
      announcement: "YING & CHEN LUXURY BOUTIQUE • AUTHENTIC SILK & CASHMERE COLLECTION"
    }
  }[language];

  return (
    <header className="w-full bg-[#1c1815] border-b border-[#2e2621] text-[#ebdcc6] select-none">
      {/* Top Banner Ticker */}
      <div className="bg-[#b39063] text-[#1c1815] text-[8px] md:text-[10px] font-black py-1.5 md:py-2 px-2 md:px-4 text-center tracking-widest uppercase overflow-hidden">
        <div className="animate-marquee inline-flex whitespace-nowrap gap-6 md:gap-10 items-center justify-center">
          <span className="flex items-center gap-1 md:gap-1.5 font-semibold text-white">
            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse text-[#1c1815]" /> {trans.announcement}
          </span>
          <span className="opacity-50 text-[#1c1815] hidden md:inline">•</span>
          <span className="text-[#1c1815] font-semibold hidden md:inline">{trans.freeShipping}</span>
          <span className="opacity-50 text-[#1c1815]">•</span>
          <span className="text-white font-serif italic hidden xs:inline">{trans.couponTip}</span>
          <span className="opacity-50 text-[#1c1815] hidden md:inline">•</span>
          <span className="hidden lg:inline font-mono text-[9px] text-[#1c1815] font-semibold">{trans.secSecure}</span>
        </div>
      </div>

      {/* Navigation Layer */}
      <div className="max-w-7xl mx-auto px-3 md:px-8 h-auto min-h-[56px] md:h-20 py-2 md:py-0 flex items-center justify-between gap-2 md:gap-4">
        {/* Left Side: Boutique Elegant Serif Monogram & Brand Logo */}
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0 flex-shrink">
          <div className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11 bg-gradient-to-tr from-[#cfab7c] to-[#ebdcc6] shadow-sm transform hover:scale-105 transition-transform rounded-none border border-[#6b583f]/30 flex-shrink-0">
            <span className="text-[#1c1815] font-serif font-light text-base md:text-xl italic">Y</span>
            <span className="absolute -bottom-1 -right-1 text-[7px] md:text-[9px] bg-[#1c1815] text-[#ebdcc6] px-1 font-mono">C</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2">
              <h1 className="font-serif font-normal text-white text-sm md:text-lg lg:text-xl tracking-[0.15em] md:tracking-[0.25em] truncate">
                YING & CHEN
              </h1>
              <span className="hidden xs:inline text-[#cfab7c] text-[7px] md:text-[9px] font-mono font-medium tracking-widest border border-[#cfab7c]/30 px-1 md:px-1.5 py-0.5 rounded-sm uppercase bg-white/5 flex-shrink-0">
                BOUTIQUE
              </span>
            </div>
            <p className="hidden md:block text-[9px] text-[#b09e8b] tracking-[0.3em] uppercase font-mono mt-0.5 truncate">
              {language === "zh" ? "江浙沪精致桑蚕丝品牌 • 私享体验" : "Seda Natural & Alta Costura Chinesa"}
            </p>
          </div>
        </div>

        {/* Middle Side: Live Event Countdown */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3.5 bg-white/[0.02] border border-[#cfab7c]/20 px-3 lg:px-5 py-1.5 lg:py-2">
          <span className="text-[8px] lg:text-[10px] text-[#cfab7c] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 lg:gap-2 font-mono">
            <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#cfab7c]" />
            <span className="hidden lg:inline">{trans.countdownTitle}:</span>
            <span className="lg:hidden">{trans.countdownTitle?.split(" ")[0]}</span>
          </span>
          <div className="flex items-center gap-1 lg:gap-1.5">
            <span className="font-mono text-[10px] lg:text-xs bg-[#cfab7c] text-[#1c1815] px-1.5 lg:px-2 py-0.5 font-bold">
              {formatNum(timeLeft.h)}
            </span>
            <span className="text-[#cfab7c] font-serif font-light">:</span>
            <span className="font-mono text-[10px] lg:text-xs bg-[#cfab7c] text-[#1c1815] px-1.5 lg:px-2 py-0.5 font-bold">
              {formatNum(timeLeft.m)}
            </span>
            <span className="text-[#cfab7c] font-serif font-light">:</span>
            <span className="font-mono text-[10px] lg:text-xs bg-[#cfab7c] text-[#1c1815] px-1.5 lg:px-2 py-0.5 font-bold">
              {formatNum(timeLeft.s)}
            </span>
          </div>
          <span className="hidden lg:inline text-[9px] bg-white/10 text-white px-2 py-0.5 font-mono tracking-widest uppercase">
            UP TO 90% OFF
          </span>
          <span className="lg:hidden text-[8px] bg-white/10 text-white px-1.5 py-0.5 font-mono tracking-widest uppercase">
            90% OFF
          </span>
        </div>

        {/* Right Side: Options & Toggles */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {/* Language selector */}
          <div className="flex items-center gap-1 md:gap-1.5 bg-[#25201c] px-2 md:px-3 py-1 md:py-1.5 border border-[#3e352e]">
            <Languages className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ebdcc6]/60" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[10px] md:text-[11px] font-medium text-slate-200 focus:outline-none cursor-pointer border-none"
            >
              <option value="pt" className="bg-[#1c1815] text-[#ebdcc6]">🇧🇷</option>
              <option value="zh" className="bg-[#1c1815] text-[#ebdcc6]">🇨🇳</option>
              <option value="en" className="bg-[#1c1815] text-[#ebdcc6]">🇺🇸</option>
            </select>
          </div>

          {/* Currency picker */}
          <div className="hidden sm:flex items-center gap-1 md:gap-1.5 bg-[#25201c] px-2 md:px-3 py-1 md:py-1.5 border border-[#3e352e]">
            <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ebdcc6]/60" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[10px] md:text-[11px] font-medium text-slate-200 focus:outline-none cursor-pointer border-none"
            >
              <option value="BRL" className="bg-[#1c1815] text-[#ebdcc6]">R$</option>
              <option value="CNY" className="bg-[#1c1815] text-[#ebdcc6]">¥</option>
              <option value="USD" className="bg-[#1c1815] text-[#ebdcc6]">$</option>
            </select>
          </div>

          {/* Secret Admin Trigger */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-[9px] md:text-[10px] font-mono font-bold text-[#b09e8b]/40 hover:text-[#cfab7c] transition-colors tracking-widest cursor-pointer bg-transparent border-none"
            title="Admin Panel"
          >
            US
          </button>
        </div>
      </div>
    </header>
  );
}
