import { useState, useEffect } from "react";
import { QrCode, Monitor, CheckCircle, RefreshCw, Smartphone, ChevronRight } from "lucide-react";

interface QrScanResult {
  success: boolean;
  username: string;
  name: string;
  role: string;
}

interface QrCodeTogglerProps {
  onQrSuccess: (user: { username: string; name: string; role: string }) => void;
  language: "pt" | "zh" | "en";
}

export default function QrCodeToggler({ onQrSuccess, language }: QrCodeTogglerProps) {
  const [scanned, setScanned] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(59);
  const [simulatedUser, setSimulatedUser] = useState<QrScanResult | null>(null);

  // Active QR expiry
  useEffect(() => {
    if (secondsLeft === 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Simulates a scan trigger
  const handleSimulateScan = () => {
    setScanned(true);
    // Pick temporary mock buyers
    const fakeUsers = [
      { success: true, username: "@super_buyer", name: "Wang Lu", role: "Cliente VIP 5" },
      { success: true, username: "@comprador", name: "Ana Silva", role: "Comprador Master" },
      { success: true, username: "@hongbao_master", name: "Chen Jin", role: "Moderador" }
    ];
    const chosen = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    setSimulatedUser(chosen);

    // Timeout to trigger active parent login
    setTimeout(() => {
      onQrSuccess({
        username: chosen.username,
        name: chosen.name,
        role: chosen.role
      });
    }, 1800);
  };

  const handleReset = () => {
    setScanned(false);
    setSimulatedUser(null);
    setSecondsLeft(59);
  };

  const trans = {
    pt: {
      scanToLogin: "Escaneie para entrar instantaneamente",
      openApp: "Abra o App Taobao / AliExpress para escanear",
      qrExpired: "Expira em",
      sec: "s",
      refresh: "Atualizar QR Code",
      simTitle: "Simulação de Leitura para Testes",
      simDesc: "Simule a leitura do QR Code pelo celular com uma conta de teste ativa.",
      simButton: "Simular Leitura Instantânea 📱",
      successStatus: "Logado via QR Code! Redirecionando..."
    },
    zh: {
      scanToLogin: "扫码安全登录",
      openApp: "打开 淘宝/手机阿里 扫一扫登录",
      qrExpired: "二维码将在",
      sec: "秒内失效",
      refresh: "刷新二维码",
      simTitle: "扫码模拟测试器",
      simDesc: "模拟手机端扫码成功后的静默登录状态。",
      simButton: "模拟手机扫码登录 📱",
      successStatus: "扫码登录成功！跳转中..."
    },
    en: {
      scanToLogin: "Scan to login securely",
      openApp: "Open Taobao / AliExpress Mobile App to scan",
      qrExpired: "Expires in",
      sec: "s",
      refresh: "Refresh QR Code",
      simTitle: "QR Code Scan Simulator",
      simDesc: "Simulate scanning this QR Code via physical phone.",
      simButton: "Simulate Mobile Scan 📱",
      successStatus: "Signed in via QR! Redirecting..."
    }
  }[language];

  return (
    <div className="flex flex-col items-center justify-center p-6 text-slate-800 text-center animate-fade-in">
      <h3 className="font-bold text-base text-slate-950 flex items-center gap-1.5 justify-center">
        <QrCode className="w-5 h-5 text-red-600 animate-pulse" />
        <span>{trans.scanToLogin}</span>
      </h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-[240px]">
        {trans.openApp}
      </p>

      {/* Interactive QR Box */}
      <div className="relative mt-5 w-44 h-44 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-center overflow-hidden group">
        {!scanned ? (
          <>
            {/* The Scanning Line Effect */}
            <div className="absolute left-0 right-0 h-[2px] bg-red-500 top-0 animate-scan z-10 opacity-85 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            
            {/* Real SVG QR design structure */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 group-hover:scale-102 transition-transform duration-300">
              {/* Corner Anchors */}
              <rect x="0" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="5" y="5" width="15" height="15" fill="currentColor" />
              <rect x="75" y="0" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="80" y="5" width="15" height="15" fill="currentColor" />
              <rect x="0" y="75" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="5" y="80" width="15" height="15" fill="currentColor" />
              
              {/* Fake Barcode Grid Pattern */}
              <rect x="35" y="5" width="5" height="5" fill="currentColor" />
              <rect x="45" y="5" width="10" height="5" fill="currentColor" />
              <rect x="60" y="5" width="5" height="10" fill="currentColor" />
              <rect x="35" y="15" width="20" height="5" fill="currentColor" />
              <rect x="10" y="35" width="5" height="15" fill="currentColor" />
              <rect x="25" y="35" width="15" height="5" fill="currentColor" />
              <rect x="45" y="35" width="5" height="10" fill="currentColor" />
              <rect x="55" y="35" width="10" height="15" fill="currentColor" />
              <rect x="75" y="35" width="20" height="5" fill="currentColor" />
              <rect x="5" y="55" width="10" height="5" fill="currentColor" />
              <rect x="25" y="50" width="5" height="15" fill="currentColor" />
              <rect x="40" y="55" width="15" height="5" fill="currentColor" />
              <rect x="70" y="50" width="5" height="20" fill="currentColor" />
              <rect x="80" y="55" width="10" height="10" fill="currentColor" />
              <rect x="35" y="75" width="5" height="20" fill="currentColor" />
              <rect x="45" y="85" width="15" height="10" fill="currentColor" />
              <rect x="65" y="80" width="20" height="5" fill="currentColor" />
              
              {/* Golden stamp inside QR representing authenticity */}
              <circle cx="50" cy="50" r="11" fill="#DC2626" />
              <text x="50" y="54" fill="#FBBF24" fontSize="12" fontWeight="black" textAnchor="middle">福</text>
            </svg>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-600 animate-scale-up">
            <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            <p className="text-[11px] font-bold mt-2 text-slate-800">{simulatedUser?.name}</p>
            <p className="text-[10px] text-slate-500">{simulatedUser?.username}</p>
          </div>
        )}
      </div>

      {/* Expiry Clock */}
      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-slate-500">
        {!scanned ? (
          <>
            <span>{trans.qrExpired}:</span>
            <span className="font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
              00:{String(secondsLeft).padStart(2, "0")}
            </span>
            <button 
              onClick={() => setSecondsLeft(59)}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all"
              title={trans.refresh}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-emerald-600 font-medium">{trans.successStatus}</span>
            <button onClick={handleReset} className="text-xs text-red-500 font-semibold hover:underline ml-1">
              Voltar
            </button>
          </div>
        )}
      </div>

      {/* Simulator Actions inside testing tab */}
      <div className="w-full mt-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
        <h4 className="text-[11px] font-bold text-amber-800 text-left uppercase tracking-wider flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-amber-700" />
          <span>{trans.simTitle}</span>
        </h4>
        <p className="text-[10px] text-amber-700 text-left mt-1 leading-relaxed">
          {trans.simDesc}
        </p>
        <button
          onClick={handleSimulateScan}
          disabled={scanned}
          className={`w-full mt-2.5 py-2 px-3 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-md shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${
            scanned ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>{trans.simButton}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
