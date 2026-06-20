import express from "express";
import path from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const app = express();
const isVercel = !!process.env.VERCEL;
const DB_FILE = isVercel ? path.join("/tmp", "users.json") : path.join(process.cwd(), "users.json");
const ADMINS_FILE = isVercel ? path.join("/tmp", "admins.json") : path.join(process.cwd(), "admins.json");

// Parse JSON bodies
app.use(express.json());

// Initialize users.json if it doesn't exist
function initDatabase() {
  if (!existsSync(DB_FILE)) {
    const defaultUsers = [
      { username: "@admin", password: "admin123", role: "Administrador", name: "Sr. Chen (Admin)", createdBy: "system" },
      { username: "@comprador", password: "123", role: "Comprador Master", name: "Ana Silva", createdBy: "system" },
      { username: "@vip_client", password: "666", role: "Cliente VIP Gold", name: "Wang Wei", createdBy: "system" },
      { username: "@natanmarinho.dev", password: "qualquer_senha", role: "VIP Developer", name: "Natan Marinho", createdBy: "system" },
      { username: "@test_user", password: "qwe", role: "Testador de Sistemas", name: "Guto Developer", createdBy: "system" }
    ];
    
    // Check if there is an initial users.json we should load
    const projectRootUsersPath = path.join(process.cwd(), "users.json");
    if (existsSync(projectRootUsersPath)) {
      try {
        const raw = readFileSync(projectRootUsersPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
          console.log("Database initialized from project users.json");
          return;
        }
      } catch (err) {
        console.error("Error reading initial users.json:", err);
      }
    }
    
    writeFileSync(DB_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
    console.log("Database initialized with default credentials in users.json");
  }
}

// Initialize admins.json if it doesn't exist
function initAdminsDatabase() {
  if (!existsSync(ADMINS_FILE)) {
    const projectRootAdminsPath = path.join(process.cwd(), "admins.json");
    if (existsSync(projectRootAdminsPath)) {
      try {
        const raw = readFileSync(projectRootAdminsPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          writeFileSync(ADMINS_FILE, JSON.stringify(parsed, null, 2), "utf-8");
          console.log("Admins database initialized from project admins.json");
          return;
        }
      } catch (err) {
        console.error("Error reading initial admins.json:", err);
      }
    }
    
    writeFileSync(ADMINS_FILE, JSON.stringify([], null, 2), "utf-8");
    console.log("Database initialized for admins in admins.json");
  }
}

// Perform DB checks before request processing
app.use((req, res, next) => {
  initDatabase();
  initAdminsDatabase();
  next();
});

// Helper to read users
function readUsers() {
  try {
    const data = readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users db:", err);
    return [];
  }
}

// Helper to write users
function writeUsers(users: any[]) {
  try {
    writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users db:", err);
  }
}

// Helper to read admins
function readAdmins() {
  try {
    const data = readFileSync(ADMINS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading admins db:", err);
    return [];
  }
}

// Helper to write admins
function writeAdmins(admins: any[]) {
  try {
    writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing admins db:", err);
  }
}

// Ensure username starts with '@'
function normalizeUsername(username: string): string {
  const clean = username.trim();
  if (!clean.startsWith("@")) {
    return `@${clean}`;
  }
  return clean;
}

// --- API ROUTES ---

// 1. Get users (supports filtering by creator)
app.get("/api/users", (req, res) => {
  const { createdBy } = req.query;
  const users = readUsers();
  
  if (createdBy) {
    const filtered = users.filter(
      (u: any) => u.createdBy && u.createdBy.toLowerCase() === (createdBy as string).toLowerCase()
    );
    return res.json({ success: true, users: filtered });
  }
  res.json({ success: true, users });
});

// 2. Perform Login validation (updates password in DB)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Por favor, informe o usuário e senha." });
  }

  const normalized = normalizeUsername(username);
  const users = readUsers();

  const existingUserIndex = users.findIndex(
    (u: any) => normalizeUsername(u.username).toLowerCase() === normalized.toLowerCase()
  );

  if (existingUserIndex > -1) {
    users[existingUserIndex].password = password;
    writeUsers(users);
  }

  return res.status(401).json({
    success: false,
    message: "Senha incorreta. Verifique suas credenciais."
  });
});

// 3. Create user (associated with admin creator)
app.post("/api/users", (req, res) => {
  const { username, password, name, role, createdBy } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: "O nome de usuário é obrigatório." });
  }

  const normalized = normalizeUsername(username);
  const users = readUsers();

  const exists = users.some((u: any) => u.username.toLowerCase() === normalized.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Este usuário já existe na base de dados JSON!" });
  }

  const newUser = {
    username: normalized,
    password: password || "",
    name: name || "Alvo Monitorado",
    role: role || "Cliente VIP",
    createdBy: createdBy || "system"
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ success: true, message: `Usuário '${normalized}' adicionado ao users.json!`, user: newUser });
});
app.delete("/api/users/:username", (req, res) => {
  const { username } = req.params;
  const normalized = normalizeUsername(username);
  const users = readUsers();

  const initialCount = users.length;
  const filtered = users.filter((u: any) => u.username.toLowerCase() !== normalized.toLowerCase());

  if (filtered.length === initialCount) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  writeUsers(filtered);
  res.json({ success: true, message: `Usuário '${normalized}' removido de users.json.` });
});

// --- ADMIN API ROUTES ---

// Check if any admin exists
app.get("/api/admins/exists", (req, res) => {
  const admins = readAdmins();
  res.json({ exists: admins.length > 0 });
});

// Register a new admin
app.post("/api/admins/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Usuário e senha são obrigatórios para o administrador." });
  }

  const cleanUser = username.trim();
  const admins = readAdmins();

  const exists = admins.some((a: any) => a.username.toLowerCase() === cleanUser.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Este usuário de administrador já existe!" });
  }

  const newAdmin = {
    username: cleanUser,
    password
  };

  admins.push(newAdmin);
  writeAdmins(admins);

  res.json({ success: true, message: "Administrador registrado com sucesso!" });
});

// Authenticate an admin
app.post("/api/admins/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Usuário e senha são obrigatórios." });
  }

  const cleanUser = username.trim();
  const admins = readAdmins();

  const admin = admins.find(
    (a: any) => a.username.toLowerCase() === cleanUser.toLowerCase() && a.password === password
  );

  if (admin) {
    res.json({ success: true, message: "Acesso autorizado!", username: admin.username });
  } else {
    res.status(401).json({ success: false, message: "Usuário ou senha administrativa inválidos." });
  }
});

export default app;
