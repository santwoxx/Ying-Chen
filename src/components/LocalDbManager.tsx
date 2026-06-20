import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Database, Plus, Trash2, KeyRound, User as UserIcon, RefreshCw, Layers, CheckCircle, HelpCircle } from "lucide-react";

interface LocalDbManagerProps {
  onSelectUser: (user: User) => void;
  triggerRefreshToggle: boolean;
}

export default function LocalDbManager({ onSelectUser, triggerRefreshToggle }: LocalDbManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for adding a new user for local tests
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Cliente VIP");
  const [successAdd, setSuccessAdd] = useState<string | null>(null);

  // Fetch users from server db
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError("Não foi possível carregar a base de dados JSON.");
      }
    } catch (err) {
      setError("Erro de rede ao buscar banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [triggerRefreshToggle]);

  // Handle user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setError("Preencha ao menos usuário e senha no painel de teste!");
      return;
    }

    try {
      setError(null);
      setSuccessAdd(null);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName || "Testador Local",
          role: newRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessAdd(data.message);
        setNewUsername("");
        setNewPassword("");
        setNewName("");
        setNewRole("Cliente VIP");
        fetchUsers();
        setTimeout(() => setSuccessAdd(null), 4000);
      } else {
        setError(data.message || "Erro ao adicionar usuário.");
      }
    } catch (err) {
      setError("Erro de conexão ao salvar no arquivo users.json.");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (username: string) => {
    if (confirm(`Tem certeza que deseja apagar ${username} de users.json?`)) {
      try {
        setError(null);
        const res = await fetch(`/api/users/${encodeURIComponent(username)}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          fetchUsers();
        } else {
          setError(data.message || "Erro ao deletar.");
        }
      } catch (err) {
        setError("Erro ao se conectar para deletar usuário.");
      }
    }
  };

  return (
    <div id="db-manager-container" className="bg-slate-900 border-2 border-slate-800 rounded-none overflow-hidden shadow-2xl p-6 text-white h-full flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between border-b-2 border-slate-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#D91E18]/10 text-red-500 rounded-none border border-[#D91E18]/20">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-black text-xs text-slate-100 tracking-widest uppercase font-mono">Banco de Dados Local</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">users.json synced</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={fetchUsers} 
            className="p-1 px-3 rounded-none border-2 border-slate-800 bg-slate-950 hover:bg-slate-850 transition duration-150 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest font-mono text-slate-300"
            title="Atualizar dados de users.json"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-[#D91E18]" : ""}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Informative Label */}
        <div className="bg-emerald-500/5 border-2 border-emerald-500/10 rounded-none p-3 text-[11px] mb-4 text-emerald-300 leading-relaxed font-mono">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-1.5 w-1.5 rounded-none bg-emerald-400"></span>
            <span className="font-black text-[9px] uppercase tracking-widest text-emerald-400">JSON PERMANENT PERSISTENCE</span>
          </div>
          Registros salvos diretamente no arquivo <code className="bg-slate-950 px-1 py-0.5 text-emerald-300 font-mono font-bold">users.json</code> de forma persistente. Clique em qualquer linha para preencher o formulário.
        </div>

        {/* Display Active JSON DB */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto mb-6 pr-1 custom-scrollbar">
          {loading && users.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-mono">Loading local state...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-none border-2 border-slate-800 font-mono uppercase tracking-wider">
              Nenhuma conta cadastrada no arquivo.
            </div>
          ) : (
            users.map((u) => (
              <div 
                key={u.username}
                onClick={() => onSelectUser(u)}
                className="group flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-850 border-2 border-slate-850 hover:border-[#D91E18]/45 rounded-none cursor-pointer transition-all duration-150"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-black text-[#D91E18] text-xs truncate">{u.username}</span>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">({u.password})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                    <span className="truncate max-w-[90px]">{u.name}</span>
                    <span className="text-slate-700">•</span>
                    <span className="bg-slate-800 text-slate-350 px-1.5 py-[1px] rounded-none text-[8px] uppercase tracking-widest font-black font-mono">{u.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] bg-[#D91E18]/10 text-red-400 border border-[#D91E18]/25 px-2 py-0.5 font-bold uppercase font-mono tracking-widest">
                    Preencher
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(u.username);
                    }}
                    className="p-1 hover:bg-red-950 hover:text-red-400 text-slate-500 rounded-none transition-colors border border-transparent hover:border-red-900"
                    title="Excluir do users.json"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New User Section */}
      <div className="border-t-2 border-slate-850 pt-4 mt-auto">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
          <Layers className="w-3.5 h-3.5 text-[#D91E18]" />
          <span>Cadastrar Conta de Teste</span>
        </h3>

        <form onSubmit={handleCreateUser} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-slate-400 mb-1 font-black uppercase tracking-widest font-mono">Nome de Usuário</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                <input 
                  type="text" 
                  value={newUsername.replace(/^@/, "")}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="comprador" 
                  className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border-2 border-slate-850 rounded-none text-xs text-white font-mono focus:outline-none focus:border-[#D91E18] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 mb-1 font-black uppercase tracking-widest font-mono">Senha</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <KeyRound className="w-3 h-3" />
                </span>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="senha123" 
                  className="w-full pl-7 pr-2 py-1.5 bg-slate-950 border-2 border-slate-850 rounded-none text-xs text-white font-mono focus:outline-none focus:border-[#D91E18] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 mb-1 font-black uppercase tracking-widest font-mono">Nome do Comprador e Nível</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva" 
                className="w-full px-2.5 py-1.5 bg-slate-950 border-2 border-slate-850 rounded-none text-xs text-white focus:outline-none focus:border-[#D91E18] transition-colors font-mono"
              />
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border-2 border-slate-850 rounded-none text-xs text-slate-300 focus:outline-none focus:border-[#D91E18] transition-colors font-mono font-bold"
              >
                <option value="Cliente VIP" className="bg-slate-900">VIP</option>
                <option value="Vendedor Gold" className="bg-slate-900">VENDEDOR GOLD</option>
                <option value="Moderador" className="bg-slate-900">MODERADOR</option>
                <option value="Comprador Varejo" className="bg-slate-900">VAREJO</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-[10px] text-red-400 font-mono uppercase font-semibold bg-red-950/40 p-1.5 rounded-none border border-red-900/30">
              {error}
            </p>
          )}

          {successAdd && (
            <p className="text-[10px] text-emerald-400 font-mono uppercase font-semibold bg-emerald-950/40 p-1.5 rounded-none border border-emerald-900/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0 text-emerald-400" />
              <span>users.json updated!</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-[#D91E18] to-red-650 hover:from-red-650 hover:to-red-700 active:scale-[0.98] transition-all text-white text-[11px] font-black uppercase tracking-widest rounded-none border border-white/10 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            <span>Cadastrar Conta</span>
          </button>
        </form>
      </div>
    </div>
  );
}
