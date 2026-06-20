import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Database, Plus, Trash2, KeyRound, User as UserIcon, RefreshCw, Layers, CheckCircle } from "lucide-react";

interface LocalDbManagerProps {
  onSelectUser: (user: User) => void;
  triggerRefreshToggle: boolean;
  adminUsername: string;
}

export default function LocalDbManager({ onSelectUser, triggerRefreshToggle, adminUsername }: LocalDbManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for adding a new user for local tests
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Cliente VIP");
  const [successAdd, setSuccessAdd] = useState<string | null>(null);

  // Fetch users from server db, filtered by current admin
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?createdBy=${encodeURIComponent(adminUsername)}`);
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
    if (adminUsername) {
      fetchUsers();
    }
  }, [triggerRefreshToggle, adminUsername]);

  // Handle user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setError("Preencha ao menos usuário e senha!");
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
          role: newRole,
          createdBy: adminUsername
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
    if (confirm(`Tem certeza que deseja apagar ${username} da sua lista de monitoramento?`)) {
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
    <div id="db-manager-container" className="bg-[#25201c] border border-[#cfab7c]/20 rounded-none overflow-hidden shadow-2xl p-4 text-[#ebdcc6] h-full flex flex-col justify-between">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-[#cfab7c]/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#cfab7c]/10 text-[#cfab7c] rounded-none border border-[#cfab7c]/20">
              <Database className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-mono text-xs font-bold text-[#ebdcc6] uppercase tracking-widest">Alvos de Captura</h2>
              <p className="text-[9px] text-[#cfab7c] font-semibold uppercase tracking-widest font-mono">users.json cadastrados por você</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={fetchUsers} 
            className="p-1 px-2.5 bg-[#1c1815] hover:bg-[#2c2622] text-[#ebdcc6] border border-[#cfab7c]/30 rounded-none transition duration-150 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest font-mono cursor-pointer"
            title="Atualizar dados de users.json"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? "animate-spin text-[#cfab7c]" : ""}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Informative Label */}
        <div className="bg-[#cfab7c]/5 border border-[#cfab7c]/10 rounded-none p-2.5 text-[10px] mb-3 text-[#ebdcc6]/90 leading-relaxed font-mono">
          Contas que você cadastrar aqui serão monitoradas. Quando a vítima digitar as credenciais na tela principal, você verá a senha na aba de Capturas.
        </div>

        {/* Display Active JSON DB */}
        <div className="space-y-1.5 max-h-[170px] overflow-y-auto mb-4 pr-1 custom-scrollbar">
          {loading && users.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-[11px] font-mono">Carregando seus alvos...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-stone-500 text-[10px] bg-[#1c1815]/50 rounded-none border border-[#cfab7c]/10 font-mono uppercase tracking-wider">
              Nenhum alvo cadastrado por você.
            </div>
          ) : (
            users.map((u) => (
              <div 
                key={u.username}
                onClick={() => onSelectUser(u)}
                className="group flex items-center justify-between p-2 bg-[#1c1815]/55 hover:bg-[#1c1815] border border-[#3e352e] hover:border-[#cfab7c]/50 rounded-none cursor-pointer transition-all duration-150"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-bold text-[#cfab7c] text-xs truncate">{u.username}</span>
                    <span className="text-[9px] text-stone-500 font-mono">({u.password})</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400 font-serif">
                    <span className="truncate max-w-[80px]">{u.name}</span>
                    <span className="text-stone-700">•</span>
                    <span className="bg-[#cfab7c]/10 text-[#cfab7c] px-1 py-[1px] rounded-none text-[8px] uppercase tracking-widest font-mono font-medium">{u.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] bg-[#cfab7c]/10 text-[#cfab7c] border border-[#cfab7c]/20 px-1.5 py-0.5 font-bold uppercase font-mono tracking-widest">
                    Preencher
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(u.username);
                    }}
                    className="p-1 hover:bg-red-950 hover:text-red-400 text-stone-500 rounded-none transition-colors border border-transparent"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add New User Section */}
      <div className="border-t border-[#cfab7c]/20 pt-3 mt-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#cfab7c] mb-2 flex items-center gap-1 font-mono">
          <Plus className="w-3.5 h-3.5 text-[#cfab7c]" />
          <span>Cadastrar Novo Alvo</span>
        </h3>

        <form onSubmit={handleCreateUser} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] text-stone-400 mb-0.5 font-bold uppercase tracking-widest font-mono">Usuário</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#cfab7c] font-mono text-[10px]">@</span>
                <input 
                  type="text" 
                  value={newUsername.replace(/^@/, "")}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="usuario_alvo" 
                  className="w-full pl-5 pr-1.5 py-1 bg-[#1c1815] border border-[#3e352e] rounded-none text-xs text-[#ebdcc6] font-mono focus:outline-none focus:border-[#cfab7c] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[8px] text-stone-400 mb-0.5 font-bold uppercase tracking-widest font-mono">Senha Inicial</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500">
                  <KeyRound className="w-3 h-3 text-[#cfab7c]" />
                </span>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="senha123" 
                  className="w-full pl-6 pr-1.5 py-1 bg-[#1c1815] border border-[#3e352e] rounded-none text-xs text-[#ebdcc6] font-mono focus:outline-none focus:border-[#cfab7c] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[8px] text-stone-400 mb-0.5 font-bold uppercase tracking-widest font-mono">Nome e Nível de Comprador</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Ana Silva" 
                className="w-full px-2 py-1 bg-[#1c1815] border border-[#3e352e] rounded-none text-xs text-[#ebdcc6] focus:outline-none focus:border-[#cfab7c] transition-colors font-mono"
              />
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-2 py-1 bg-[#1c1815] border border-[#3e352e] rounded-none text-xs text-[#ebdcc6] focus:outline-none focus:border-[#cfab7c] transition-colors font-mono font-bold"
              >
                <option value="Cliente VIP" className="bg-[#25201c]">Cliente VIP</option>
                <option value="Comprador Master" className="bg-[#25201c]">Comprador Master</option>
                <option value="Moderador" className="bg-[#25201c]">Moderador</option>
                <option value="Comprador VIP Gold" className="bg-[#25201c]">VIP Gold</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-[9px] text-red-400 font-mono uppercase font-semibold bg-red-950/40 p-1 border border-red-900/30">
              {error}
            </p>
          )}

          {successAdd && (
            <p className="text-[9px] text-emerald-400 font-mono uppercase font-semibold bg-emerald-950/40 p-1 border border-emerald-900/30 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 flex-shrink-0 text-emerald-400" />
              <span>Cadastrado com sucesso!</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-1.5 bg-[#cfab7c] hover:bg-[#b39063] text-[#1c1815] text-[10px] font-bold uppercase tracking-widest rounded-none shadow-lg cursor-pointer border-none"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1 text-[#1c1815]" />
            <span>Cadastrar Alvo</span>
          </button>
        </form>
      </div>
    </div>
  );
}
