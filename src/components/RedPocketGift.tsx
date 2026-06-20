import { useState } from "react";
import { Gift, Sparkles, X, Flame, CheckCircle, Ticket, Copy } from "lucide-react";

interface RedPocketGiftProps {
  language: "pt" | "zh" | "en";
  onApplyCoupon: (code: string) => void;
}

export default function RedPocketGift({ language, onApplyCoupon }: RedPocketGiftProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenedPocket, setIsOpenedPocket] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toggle state
  const handleToggle = () => setIsOpen(!isOpen);

  const couponCode = "CHINA666";

  const trans = {
    pt: {
      tag: "Resgatar Cupons VIP",
      claim: "Receber Cupom Especial 🎁",
      congrats: "Parabéns! Você ganhou 90% de Desconto VIP",
      couponTitle: "Cupom Exclusivo SHEIN MOTF",
      useCode: "Aplique o código abaixo na hora de finalizar:",
      loginTip: "O cashback será ativado no seu saldo JSON após o login.",
      clickToCopy: "Copiar Código do Cupom",
      copied: "Código Copiado com Sucesso!",
      cta: "Ir para Login e Rastreamento"
    },
    zh: {
      tag: "领取特惠优惠券",
      claim: "一键领取专属礼券 🎁",
      congrats: "恭喜！您获得了双十一专享 1 折满减券",
      couponTitle: "MOTF 尊享新星体验券",
      useCode: "在结算或登录界面使用以下优惠码：",
      loginTip: "成功登录后，系统会自动激活您的现金红包奖励。",
      clickToCopy: "复制优惠券代码",
      copied: "已成功复制优惠码！",
      cta: "返回账户登录"
    },
    en: {
      tag: "Claim VIP Vouchers",
      claim: "Unlock Special Voucher 🎁",
      congrats: "Congrats! You secured a 90% VIP Discount",
      couponTitle: "SHEIN MOTF Exclusive Ticket",
      useCode: "Apply this voucher during sign-in:",
      loginTip: "Your cashback refund will be added to your balance upon login.",
      clickToCopy: "Copy Coupon Code",
      copied: "Coupon Copied!",
      cta: "Proceed to Sign In Portal"
    }
  }[language];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    onApplyCoupon(couponCode);
    setTimeout(() => setCopied(false), 3050);
  };

  return (
    <>
      {/* Floating Red Pocket Trigger Box in bottom right */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-45 flex items-center gap-3 px-5 py-4 bg-black hover:bg-stone-850 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border border-stone-200 cursor-pointer animate-pulse-soft"
        title="Cupons de Desconto SHEIN"
      >
        <span className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b1e1a] opacity-75"></span>
          <Gift className="relative inline-flex w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
        </span>
        <span className="text-xs font-bold tracking-widest text-white pr-0.5 uppercase">
          {language === "zh" ? "領券 福" : language === "pt" ? "Pegar Cupom" : "Get Coupon"}
        </span>
      </button>

      {/* Main Red Envelope Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative w-full max-w-[370px] md:max-w-md bg-white border border-stone-200 rounded-none overflow-hidden p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            
            {/* Closes the dialogue */}
            <button
              onClick={handleToggle}
              className="absolute top-3 right-3 text-stone-500 hover:text-black p-1.5 rounded-full hover:bg-stone-100 transition-all z-20 cursor-pointer border border-stone-200/50 bg-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Red Envelope Styling Canvas */}
            <div className="bg-stone-50 rounded-none relative p-8 text-center text-stone-800 border border-stone-100">
              
              {!isOpenedPocket ? (
                /* Unopened state: Big Golden Button */
                <div className="py-6 flex flex-col items-center animate-scale-up">
                  <div 
                    onClick={() => {
                      setIsOpenedPocket(true);
                      onApplyCoupon(couponCode);
                    }}
                    className="w-20 h-20 rounded-full bg-black shadow-lg flex items-center justify-center text-white font-serif font-black text-4xl animate-bounce mb-8 cursor-pointer hover:rotate-12 transition-all duration-300"
                  >
                    福
                  </div>
                  
                  <h3 className="text-xl font-serif text-black font-bold tracking-[0.1em] uppercase">
                    {trans.tag}
                  </h3>
                  <p className="text-xs text-stone-500 mt-3 max-w-[240px] leading-relaxed font-serif italic">
                    "Coleção Premium MOTF. Clique no botão de resgate para receber 90% de desconto nos tecidos e cosméticos."
                  </p>

                  <button
                    onClick={() => {
                      setIsOpenedPocket(true);
                      onApplyCoupon(couponCode);
                    }}
                    className="mt-8 w-full py-3.5 bg-black hover:bg-stone-850 text-white font-mono font-bold text-xs rounded-none shadow-md tracking-widest uppercase hover:scale-101 active:scale-99 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span>{trans.claim}</span>
                  </button>
                </div>
              ) : (
                /* Opened Pocket state shows the voucher */
                <div className="py-2 animate-scale-up">
                  <div className="flex items-center justify-center gap-2 text-xs text-[#8b1e1a] font-bold tracking-widest uppercase mb-1 font-mono">
                    <Flame className="w-4 h-4 animate-pulse text-[#8b1e1a]" />
                    <span>SHEIN VIP PROMO</span>
                  </div>
                  
                  <h3 className="text-base font-serif text-black border-b border-stone-200 pb-3 mb-5 uppercase tracking-wider leading-snug font-bold">
                    {trans.congrats}
                  </h3>

                  {/* Golden Ticket graphic */}
                  <div className="relative bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 text-stone-800 px-5 py-6 rounded-none shadow-[0_6px_15px_rgba(0,0,0,0.03)] border-dashed border-2 border-stone-300 mb-6 text-center overflow-hidden">
                    {/* Punch holes on sides */}
                    <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-stone-200"></div>
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-stone-200"></div>

                    <p className="text-[9px] font-black text-[#8b1e1a] uppercase tracking-[0.2em] font-mono">
                      {trans.couponTitle}
                    </p>
                    
                    <div className="text-3xl font-black tracking-[0.15em] text-black mt-2.5 flex items-center justify-center gap-2 font-mono">
                      <Ticket className="w-6 h-6 text-black" />
                      <span>{couponCode}</span>
                    </div>

                    <div className="w-2/3 mx-auto h-[1px] bg-stone-300 my-3"></div>

                    <p className="text-[9px] text-[#8b1e1a] font-bold uppercase tracking-widest font-mono">
                      ★ 90% OFF VERIFICADO ★
                    </p>
                  </div>

                  {/* Copy or Click action */}
                  <p className="text-[11px] text-stone-500 mb-3 font-mono uppercase tracking-widest">
                    {trans.useCode}
                  </p>

                  <button
                    onClick={handleCopyCode}
                    className="w-full py-4 px-4 rounded-none bg-black text-white hover:bg-stone-850 text-xs font-bold uppercase tracking-[0.18em] font-mono transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-md cursor-pointer border-none"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{trans.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>{trans.clickToCopy}</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 text-[9px] text-stone-400 leading-relaxed font-mono uppercase tracking-widest font-semibold border-t border-stone-200 pt-3">
                    {trans.loginTip}
                  </div>

                  <button
                    onClick={handleToggle}
                    className="mt-6 text-xs text-stone-800 hover:text-black font-bold tracking-widest uppercase hover:underline transition-all block mx-auto font-mono cursor-pointer"
                  >
                    {trans.cta}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
