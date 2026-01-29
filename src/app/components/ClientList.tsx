import { useState, useMemo } from 'react';
import { mockOrders } from '@/app/data/mockData';
import { Search } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

interface Client {
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

interface ClientListProps {
  onClientSelect: (clientName: string) => void;
}

export function ClientList({ onClientSelect }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = useMemo(() => {
    const clientMap = new Map<string, Client>();

    mockOrders.forEach((order) => {
      const existing = clientMap.get(order.clientName);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
      } else {
        clientMap.set(order.clientName, {
          name: order.clientName,
          email: order.clientEmail,
          orderCount: 1,
          totalSpent: order.total,
        });
      }
    });

    return Array.from(clientMap.values());
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 h-[400px] flex flex-col shadow-lg">
      <h3 className="font-semibold text-center mb-4 text-blue-900 text-lg">Clientes activos</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredClients.map((client, index) => (
          <button
            key={client.email}
            onClick={() => onClientSelect(client.name)}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">
                  {client.orderCount} pedido(s) • <span className="text-orange-600 font-medium">€{client.totalSpent.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}