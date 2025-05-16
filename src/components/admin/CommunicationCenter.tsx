import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Loader } from 'lucide-react';
import { logAuditAction } from '@/utils/logAuditAction';

interface Message {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sent_at: string;
}

const CommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    body: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      if (role !== 'admin') {
        navigate('/unauthorized');
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('sent_at', { ascending: false });

      if (!error && data) setMessages(data);
      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: msgError } = await supabase.from('messages').insert([
      {
        recipient: newMessage.recipient,
        subject: newMessage.subject,
        body: newMessage.body,
        sent_at: new Date().toISOString(),
      }
    ]);

    if (!msgError) {
      await logAuditAction({
        actorEmail: user?.email || 'unknown',
        action: 'SEND_MESSAGE',
        target: newMessage.recipient,
        details: `Subject: ${newMessage.subject}`
      });

      setNewMessage({ recipient: '', subject: '', body: '' });

      const { data: updated } = await supabase
        .from('messages')
        .select('*')
        .order('sent_at', { ascending: false });

      setMessages(updated || []);
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin text-[#004D4D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#004D4D]">Communication Center</h1>

      <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail size={20} className="text-[#004D4D]" /> Send a New Message
        </h2>
        <input
          type="email"
          placeholder="Recipient email"
          value={newMessage.recipient}
          onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={newMessage.subject}
          onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <textarea
          placeholder="Message body"
          value={newMessage.body}
          onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 bg-[#004D4D] text-white px-4 py-2 rounded-lg hover:bg-[#003939]"
        >
          <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Sent Messages</h2>
        <ul className="space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg) => (
            <li key={msg.id} className="border-b pb-4">
              <div className="text-sm text-gray-600 mb-1">To: {msg.recipient}</div>
              <div className="font-semibold text-[#004D4D]">{msg.subject}</div>
              <div className="text-sm text-gray-700">{msg.body}</div>
              <div className="text-xs text-gray-400 mt-1">
                Sent at: {new Date(msg.sent_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommunicationCenter;
