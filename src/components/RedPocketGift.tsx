import { useState } from "react";
import { Gift, Sparkles, X, Flame, CheckCircle, Ticket } from "lucide-react";

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
      tag: "Red Pocket da Sorte",
      claim: "Abrir Envelope Vermelho 福",
      congrats: "Parabéns! Ganhou cupom de 90%",
      couponTitle: "Cupom Exclusivo de Boas-vindas",
      useCode: "Use o código no login para ativar:",
      loginTip: "Conta com cashback em compras de teste após logar.",
      clickToCopy: "Clique para Copiar Código",
      copied: "Copiado com Sucesso!",
      cta: "Entrar com Conta de Teste"
    },
    zh: {
      tag: "开运大红包",
      claim: "恭喜发财，大吉大利 福",
      congrats: "恭喜获得双十一专属首单红包！",
      couponTitle: "新用户登录专享满减券",
      useCode: "登录时使用此优惠码：",
      loginTip: "成功登录后，系统会自动将现金返还划入您的JSON余额中。",
      clickToCopy: "点击复制优惠码",
      copied: "已成功复制！",
      cta: "立即登录测试"
    },
    en: {
      tag: "Lucky Red Pocket",
      claim: "Open Lucky Red Envelope 福",
      congrats: "Congratulations! Real 90% Voucher!",
      couponTitle: "New User Verification Exclusive Coupon",
      useCode: "Apply coupon during testing:",
      loginTip: "Sign in using any JSON account to secure this reward.",
      clickToCopy: "Click to Copy Code",
      copied: "Copied!",
      cta: "Log In Now"
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
        className="fixed bottom-4 md:bottom-6 right-3 md:right-6 z-40 flex items-center gap-1.5 md:gap-2.5 px-3 md:px-4 py-2.5 md:py-3 bg-[#1c1815] text-[#ebdcc6] rounded-none shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border border-[#cfab7c] cursor-pointer"
        title="Abrir envelope da sorte de cupom"
      >
        <span className="relative flex h-4 w-4 md:h-5 md:w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[#cfab7c] opacity-75"></span>
          <Gift className="relative inline-flex rounded-none w-4 h-4 md:w-5 md:h-5 text-[#cfab7c] group-hover:rotate-12 transition-transform duration-350" />
        </span>
        <span className="text-[10px] md:text-xs font-serif font-light tracking-[0.15em] text-[#ebdcc6] pr-1">
          {language === "zh" ? "領紅包 福" : language === "pt" ? "Pegar Cupom 福" : "Lucky Gift 福"}
        </span>
      </button>

      {/* Main Red Envelope Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fade-in">
          <div className="relative w-full max-w-[340px] md:max-w-sm bg-slate-900 border-2 border-slate-800 rounded-none overflow-hidden p-1 shadow-2xl">
            {/* Closes the dialogue */}
            <button
              onClick={handleToggle}
              className="absolute top-2 md:top-4 right-2 md:right-4 text-white hover:text-red-500 p-1 md:p-1.5 rounded-none bg-slate-800 transition-colors z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Red Envelope Styling Canvas */}
            <div className="bg-gradient-to-b from-red-700 via-[#D91E18] to-red-900 rounded-none relative p-6 text-center text-white overflow-hidden border-2 border-yellow-400">
              {/* Dynamic golden coins elements in the background */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent"></div>
              
              {!isOpenedPocket ? (
                /* Unopened state: Big Golden Button */
                <div className="py-8 flex flex-col items-center animate-scale-up">
                  <div className="w-16 h-16 rounded-none bg-yellow-400 shadow-xl flex items-center justify-center text-red-750 font-extrabold text-3xl animate-bounce mb-6 border-4 border-white select-none">
                    福
                  </div>
                  <h3 className="text-lg font-black text-yellow-300 tracking-widest font-mono uppercase">
                    {trans.tag}
                  </h3>
                  <p className="text-xs text-red-100 mt-2 max-w-[210px] leading-relaxed font-mono">
                    Clique abaixo para receber as bênçãos de compras e um cupom especial de teste local!
                  </p>

                  <button
                    onClick={() => {
                      setIsOpenedPocket(true);
                      onApplyCoupon(couponCode);
                    }}
                    className="mt-8 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-xs rounded-none shadow-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center gap-2 border-2 border-white cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-red-800" />
                    <span>{trans.claim}</span>
                  </button>
                </div>
              ) : (
                /* Opened Pocket state shows the voucher */
                <div className="py-4 animate-scale-up">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-yellow-300 font-bold tracking-widest uppercase mb-1">
                    <Flame className="w-4 h-4 animate-pulse text-amber-300" />
                    <span>Double 11 VIP Code</span>
                  </div>
                  
                  <h3 className="text-base font-black text-white border-b border-white/20 pb-3 mb-4 uppercase tracking-wider leading-snug">
                    {trans.congrats}
                  </h3>

                  {/* Golden Ticket graphic */}
                  <div className="relative bg-gradient-to-r from-yellow-350 via-yellow-200 to-amber-300 text-amber-950 px-4 py-5 rounded-none shadow-xl border-dashed border-2 border-red-700 mb-5 text-center overflow-hidden">
                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-none bg-[#D91E18]"></div>
                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-none bg-[#D91E18]"></div>

                    <p className="text-[9px] font-black text-red-800 uppercase tracking-widest font-mono">
                      {trans.couponTitle}
                    </p>
                    
                    <div className="text-xl font-black tracking-widest text-[#D91E18] mt-1 flex items-center justify-center gap-1 font-mono">
                      <Ticket className="w-4.5 h-4.5 text-[#D91E18]" />
                      <span>{couponCode}</span>
                    </div>

                    <p className="text-[9px] text-amber-900 mt-1 font-black uppercase tracking-widest">
                      90% Desconto Ativo
                    </p>
                  </div>

                  {/* Copy or Click action */}
                  <p className="text-xs text-red-100 mb-2 font-mono uppercase tracking-widest">
                    {trans.useCode}
                  </p>

                  <button
                    onClick={handleCopyCode}
                    className="w-full py-2.5 px-4 rounded-none bg-slate-950 text-yellow-300 hover:text-white border-2 border-yellow-400 text-xs font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 shadow-md cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{trans.copied}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{trans.clickToCopy}</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 text-[9px] text-red-100/90 leading-snug font-bold font-mono uppercase tracking-widest">
                    {trans.loginTip}
                  </div>

                  <button
                    onClick={handleToggle}
                    className="mt-6 text-xs text-yellow-300 font-black tracking-widest uppercase hover:text-white hover:underline transition-all block mx-auto"
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
