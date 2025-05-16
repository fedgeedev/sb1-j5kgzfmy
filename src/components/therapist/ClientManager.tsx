import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pencil, Trash2, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const session = (await supabase.auth.getSession()).data.session;
      const user = session?.user;
      if (!user) return;

      setUserId(user.id);
      setUserEmail(user.email);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('therapist_id', user.id);

      if (!error && data) setClients(data);
    };

    fetchClients();
  }, []);

  const logAudit = async (action: string, target: string, details: string) => {
    if (userId && userEmail) {
      await supabase.from('audit_logs').insert({
        actor_id: userId,
        actor_email: userEmail,
        action,
        target,
        details
      });
    }
  };

  const handleAddOrEditClient = async () => {
    if (!userId) return;

    if (editMode && editingClientId) {
      const { error } = await supabase.from('clients').update(newClient).eq('id', editingClientId);
      if (!error) {
        setClients(clients.map((client) => (client.id === editingClientId ? { ...client, ...newClient } : client)));
        await logAudit('UPDATE_CLIENT', `Client ID: ${editingClientId}`, `Updated client ${newClient.name}`);
      }
    } else {
      const { data, error } = await supabase.from('clients').insert({
        ...newClient,
        therapist_id: userId,
      }).select();
      if (!error && data && data[0]) {
        setClients([...clients, { ...newClient, id: data[0].id }]);
        await logAudit('CREATE_CLIENT', `Client ID: ${data[0].id}`, `Added new client ${newClient.name}`);
      }
    }

    setNewClient({ name: '', email: '', phone: '' });
    setShowModal(false);
    setEditMode(false);
    setEditingClientId(null);
  };

  const handleDeleteClient = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this client?');
    if (!confirmed) return;

    const deleted = clients.find((c) => c.id === id);
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      setClients(clients.filter((client) => client.id !== id));
      if (deleted) {
        await logAudit('DELETE_CLIENT', `Client ID: ${id}`, `Deleted client ${deleted.name}`);
      }
    }
  };

  const openEditModal = (client: Client) => {
    setNewClient({ name: client.name, email: client.email, phone: client.phone });
    setEditMode(true);
    setEditingClientId(client.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#004D4D]">My Clients</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setNewClient({ name: '', email: '', phone: '' });
            setEditMode(false);
            setEditingClientId(null);
          }}
          className="bg-[#004D4D] text-white px-4 py-2 rounded hover:bg-[#003737]"
        >
          + New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="bg-white shadow p-4 rounded relative">
              <h3 className="text-lg font-semibold text-[#004D4D]">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.email}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => openEditModal(client)} className="text-blue-600 hover:text-blue-800">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No clients found.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#004D4D]">
                {editMode ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditClient}
                className="bg-[#004D4D] text-white px-4 py-2 rounded hover:bg-[#003737]"
              >
                {editMode ? 'Update' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
