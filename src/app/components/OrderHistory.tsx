import { useState, useMemo } from 'react';
import { mockOrders } from '@/app/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

interface OrderHistoryProps {
  selectedClient: string | null;
  onOrderSelect: (orderId: string) => void;
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  procesando: 'bg-blue-100 text-blue-800 border-blue-300',
  enviado: 'bg-purple-100 text-purple-800 border-purple-300',
  entregado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

export function OrderHistory({ selectedClient, onOrderSelect }: OrderHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    let orders = mockOrders;

    if (selectedClient) {
      orders = orders.filter((order) => order.clientName === selectedClient);
    }

    if (searchTerm) {
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [selectedClient, searchTerm]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 h-[400px] flex flex-col shadow-lg">
      <h3 className="font-semibold text-center mb-4 text-blue-900 text-lg">Historial de pedidos</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar pedido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron pedidos</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <button
              key={order.id}
              onClick={() => onOrderSelect(order.id)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-gray-100 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-900 text-white rounded-full font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <Badge className={`text-xs ${statusColors[order.status]}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{order.clientName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {format(order.date, 'd/MM/yyyy', { locale: es })}
                    </p>
                    <p className="text-sm font-semibold text-orange-600">€{order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}