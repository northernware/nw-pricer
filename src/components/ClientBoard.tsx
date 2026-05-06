import { useState, useTransition } from "react";
import { updateClientStatusAction, createClientAction, updateClientAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const CLIENT_STAGES = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "active", label: "Active", dot: "bg-blue-400" },
  { id: "retainer", label: "Retainer", dot: "bg-nw-emerald" },
];

interface ClientFormData {
  id?: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

export default function ClientBoard({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
  });

  const handleStatusChange = (clientId: string, newStatus: string) => {
    setClients(prev => 
      prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c)
    );
    startTransition(async () => {
      const result = await updateClientStatusAction(clientId, newStatus);
      if (!result.success) {
        toast.error("Failed to move client");
        setClients(initialClients);
      }
    });
  };

  const handleEdit = (client: any) => {
    setFormData({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let result;
      if (formData.id) {
        result = await updateClientAction(formData.id, formData);
      } else {
        result = await createClientAction(formData);
      }

      if (result.success) {
        toast.success(formData.id ? "Client updated" : "Client created");
        setShowModal(false);
        setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "" });
        // Refresh local state (simplest is to refresh page or rely on revalidatePath)
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to save client");
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 flex-1 overflow-x-auto pb-4">
        {CLIENT_STAGES.map((stage) => {
          const stageClients = clients.filter(c => c.status === stage.id || (!c.status && stage.id === 'prospect'));
          
          return (
            <div key={stage.id} className="flex-1 min-w-[320px] flex flex-col bg-nw-white rounded-xl border border-nw-graphite/10">
              {/* Column Header */}
              <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
                <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}></div>
                  {stage.label}
                  {stage.id === 'prospect' && (
                    <button
                      onClick={() => {
                        setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "" });
                        setShowModal(true);
                      }}
                      className="ml-2 p-1 text-nw-black hover:text-nw-acid transition-colors"
                      title="Add Prospect"
                    >
                      <Icon icon="solar:plus-bold" className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-mono text-nw-graphite/60">
                  {stageClients.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {stageClients.map((client) => (
                  <div 
                    key={client.id} 
                    className="bg-nw-bone border border-nw-graphite/10 rounded-lg p-5 group hover:border-nw-acid/30 transition-all duration-300 relative flex flex-col shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-display font-bold text-lg tracking-tight text-nw-black leading-tight">
                          {client.firstName} {client.lastName}
                        </h3>
                        {client.company && (
                          <div className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
                            {client.company}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-nw-graphite/40 hover:text-nw-black transition-colors"
                      >
                        <Icon icon="solar:pen-linear" className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-6">
                      {client.email && (
                        <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                          <Icon icon="solar:letter-linear" className="w-3 h-3" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                          <Icon icon="solar:phone-linear" className="w-3 h-3" />
                          {client.phone}
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                        <Icon icon="solar:folder-linear" className="w-3 h-3" />
                        {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-nw-graphite/5">
                      <div className="text-[8px] font-mono text-nw-graphite/40 uppercase">
                        Updated {formatDistanceToNow(client.lastModified, { addSuffix: true })}
                      </div>

                      <div className="relative">
                        <select
                          value={stage.id}
                          onChange={(e) => handleStatusChange(client.id, e.target.value)}
                          disabled={isPending}
                          className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4 disabled:opacity-50"
                        >
                          {CLIENT_STAGES.map(s => (
                            <option key={s.id} value={s.id} className="bg-nw-bone">{s.label}</option>
                          ))}
                        </select>
                        <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ))}
                
                {stageClients.length === 0 && (
                  <div className="h-24 border border-dashed border-nw-graphite/10 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">No clients</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-nw-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-nw-bone border border-nw-black p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black mb-6">
              {formData.id ? "Edit Client" : "New Client"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-nw-graphite/20 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-nw-black text-nw-white py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
