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
      tag: "Red Pocket da Sorte",
      claim: "Abrir Envelope Vermelho 福",
      congrats: "Parabéns! Você ganhou 90% OFF",
      couponTitle: "Cupom de Boas-vindas VIP",
      useCode: "Use o código no login para ativar:",
      loginTip: "Conta com cashback em compras de teste após logar.",
      clickToCopy: "Copiar Código do Cupom",
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4.5 py-3.5 bg-gradient-to-r from-[#8b1e1a] to-[#b39063] text-white rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 group border border-[#cfab7c]/60 cursor-pointer animate-pulse-soft"
        title="Abrir envelope da sorte de cupom"
      >
        <span className="relative flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cfab7c] opacity-75"></span>
          <Gift className="relative inline-flex w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
        </span>
        <span className="text-xs font-serif font-semibold tracking-[0.2em] text-white pr-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          {language === "zh" ? "領紅包 福" : language === "pt" ? "Pegar Cupom 福" : "Lucky Gift 福"}
        </span>
      </button>

      {/* Main Red Envelope Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative w-full max-w-[360px] md:max-w-md bg-[#170d0a] border border-[#cfab7c]/30 rounded-none overflow-hidden p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* Closes the dialogue */}
            <button
              onClick={handleToggle}
              className="absolute top-3 right-3 text-stone-400 hover:text-white p-1 rounded-full bg-black/40 hover:bg-black/60 transition-all z-20 cursor-pointer border border-[#cfab7c]/15"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Red Envelope Styling Canvas */}
            <div className="bg-gradient-to-b from-[#8b1e1a] via-[#ac231c] to-[#4c0d0a] rounded-none relative p-7 text-center text-white overflow-hidden border border-[#cfab7c]/40 chinese-lattice-bg">
              {/* Gold sparkles overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/10 via-transparent to-transparent pointer-events-none"></div>
              
              {!isOpenedPocket ? (
                /* Unopened state: Big Golden Button */
                <div className="py-8 flex flex-col items-center animate-scale-up">
                  {/* Glowing halo behind coin */}
                  <div className="absolute top-12 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl animate-ambient-glow pointer-events-none"></div>

                  <div 
                    onClick={() => {
                      setIsOpenedPocket(true);
                      onApplyCoupon(couponCode);
                    }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#cfab7c] via-yellow-300 to-[#ebdcc6] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center text-[#4c0d0a] font-serif font-black text-4xl animate-bounce mb-8 border-4 border-white cursor-pointer hover:rotate-12 transition-transform duration-300 group select-none relative"
                  >
                    <span className="absolute inset-0.5 rounded-full border border-[#4c0d0a]/20"></span>
                    福
                  </div>
                  
                  <h3 className="text-xl font-serif text-yellow-300 tracking-[0.25em] font-semibold uppercase animate-text-glow">
                    {trans.tag}
                  </h3>
                  <p className="text-xs text-stone-200 mt-3 max-w-[240px] leading-relaxed font-serif italic">
                    "Que a prosperidade acompanhe seus desejos. Abra este envelope e receba 90% OFF."
                  </p>

                  <button
                    onClick={() => {
                      setIsOpenedPocket(true);
                      onApplyCoupon(couponCode);
                    }}
                    className="mt-8 px-7 py-3 bg-gradient-to-r from-[#cfab7c] to-[#ebdcc6] hover:from-[#ebdcc6] hover:to-[#cfab7c] text-[#4c0d0a] font-mono font-black text-xs rounded-none shadow-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-white/40 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8b1e1a]" />
                    <span>{trans.claim}</span>
                  </button>
                </div>
              ) : (
                /* Opened Pocket state shows the voucher */
                <div className="py-2 animate-scale-up">
                  <div className="flex items-center justify-center gap-2 text-xs text-yellow-300 font-bold tracking-widest uppercase mb-1 font-mono">
                    <Flame className="w-4 h-4 animate-pulse text-amber-300" />
                    <span>Double 11 VIP Code</span>
                  </div>
                  
                  <h3 className="text-lg font-serif text-white border-b border-[#cfab7c]/20 pb-3.5 mb-5 uppercase tracking-wider leading-snug font-medium">
                    {trans.congrats}
                  </h3>

                  {/* Golden Ticket graphic */}
                  <div className="relative bg-gradient-to-r from-[#f7e0b5] via-[#ebdcc6] to-[#dcb782] text-amber-950 px-5 py-6 rounded-none shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-dashed border-2 border-[#8b1e1a] mb-6 text-center overflow-hidden">
                    {/* Punch holes on sides */}
                    <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#ac231c] border border-stone-900/10"></div>
                    <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-[#ac231c] border border-stone-900/10"></div>

                    <p className="text-[10px] font-black text-[#8b1e1a] uppercase tracking-[0.2em] font-mono">
                      {trans.couponTitle}
                    </p>
                    
                    <div className="text-2xl font-black tracking-[0.15em] text-[#8b1e1a] mt-2 flex items-center justify-center gap-2 font-mono">
                      <Ticket className="w-5 h-5 text-[#8b1e1a]" />
                      <span>{couponCode}</span>
                    </div>

                    <div className="w-2/3 mx-auto h-[1px] bg-[#8b1e1a]/20 my-2"></div>

                    <p className="text-[9px] text-amber-900 font-bold uppercase tracking-widest font-mono">
                      ★ AUTORIZADO PELA ADUANA VIP ★
                    </p>
                  </div>

                  {/* Copy or Click action */}
                  <p className="text-[11px] text-stone-200 mb-2.5 font-mono uppercase tracking-widest">
                    {trans.useCode}
                  </p>

                  <button
                    onClick={handleCopyCode}
                    className="w-full py-3.5 px-4 rounded-none bg-[#0d0908] text-yellow-300 hover:text-white border border-[#cfab7c]/40 text-xs font-bold uppercase tracking-[0.15em] font-mono transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-md cursor-pointer hover:bg-black"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{trans.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{trans.clickToCopy}</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 text-[9px] text-[#ebdcc6]/75 leading-relaxed font-mono uppercase tracking-widest font-semibold border-t border-[#cfab7c]/10 pt-3">
                    {trans.loginTip}
                  </div>

                  <button
                    onClick={handleToggle}
                    className="mt-6 text-xs text-yellow-400 hover:text-white font-bold tracking-widest uppercase hover:underline transition-all block mx-auto font-mono cursor-pointer"
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
