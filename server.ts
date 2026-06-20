import express from "express";
import path from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "users.json");

// Parse JSON bodies
app.use(express.json());

// Initialize users.json if it doesn't exist
function initDatabase() {
  if (!existsSync(DB_FILE)) {
    const defaultUsers = [
      { username: "@admin", password: "admin123", role: "Administrador", name: "Sr. Chen (Admin)" },
      { username: "@comprador", password: "123", role: "Comprador Master", name: "Ana Silva" },
      { username: "@vip_client", password: "666", role: "Cliente VIP Gold", name: "Wang Wei" },
      { username: "@natanmarinho.dev", password: "qualquer_senha", role: "VIP Developer", name: "Natan Marinho" },
      { username: "@test_user", password: "qwe", role: "Testador de Sistemas", name: "Guto Developer" }
    ];
    writeFileSync(DB_FILE, JSON.stringify(defaultUsers, null, 2), "utf-8");
    console.log("Database initialized with default credentials in users.json");
  }
}

initDatabase();

// Helper to read users
function readUsers() {
  try {
    if (!existsSync(DB_FILE)) {
      initDatabase();
    }
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

// Ensure username starts with '@'
function normalizeUsername(username: string): string {
  const clean = username.trim();
  if (!clean.startsWith("@")) {
    return `@${clean}`;
  }
  return clean;
}

// --- API ROUTES ---

// 1. Get all users for testing local persistence
app.get("/api/users", (req, res) => {
  const users = readUsers();
  // Map to exclude passwords in output if we wanted to, but for local testing we can show them!
  res.json({ success: true, users });
});

// 2. Perform Login validation
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Por favor, informe o usuário e senha." });
  }

  const normalized = normalizeUsername(username);
  const users = readUsers();

  // Find if user exists in our users.json database (case-insensitive check)
  const existingUserIndex = users.findIndex(
    (u: any) => normalizeUsername(u.username).toLowerCase() === normalized.toLowerCase()
  );

  if (existingUserIndex > -1) {
    // Update the password in users.json to whatever was typed (continue salvando!)
    users[existingUserIndex].password = password;
    writeUsers(users);

    return res.status(401).json({
      success: false,
      message: "Senha incorreta. Verifique suas credenciais."
    });
  } else {
    // If user does not exist in users.json, we don't auto-register them (no automatic signup)
    // We just return "Senha incorreta" to keep the behavior identical on the interface.
    return res.status(401).json({
      success: false,
      message: "Senha incorreta. Verifique suas credenciais."
    });
  }
});

// 3. Create user (part of local testing tools)
app.post("/api/users", (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Usuário e senha são obrigatórios." });
  }

  const normalized = normalizeUsername(username);
  const users = readUsers();

  const exists = users.some((u: any) => u.username.toLowerCase() === normalized.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Este usuário já existe na base de dados JSON!" });
  }

  const newUser = {
    username: normalized,
    password,
    name: name || "Testador Anônimo",
    role: role || "Cliente de Teste"
  };

  users.push(newUser);
  writeUsers(users);

  res.json({ success: true, message: `Usuário '${normalized}' adicionado ao users.json!`, user: newUser });
});

// 4. Delete user (part of local testing tools)
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


// --- VITE MIDDLEWARE SETUP ---
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Database (JSON) loaded from: ${DB_FILE}`);
  });
}

mountViteMiddleware();
