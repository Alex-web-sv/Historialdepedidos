import { useState, useMemo } from 'react';
import { Order, mockOrders } from '@/app/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Eye, Package } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Card } from '@/app/components/ui/card';
import { OrderDetails } from '@/app/components/OrderDetails';

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  procesando: 'bg-blue-100 text-blue-800 border-blue-300',
  enviado: 'bg-purple-100 text-purple-800 border-purple-300',
  entregado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

export function OrderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch =
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'todos' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Obtener lista única de clientes
  const uniqueClients = useMemo(() => {
    const clientsSet = new Set(mockOrders.map((order) => order.clientName));
    return Array.from(clientsSet).sort();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-semibold mb-2">Gestión de Pedidos</h1>
        <p className="text-gray-600">
          Busca y gestiona el historial de pedidos de tus clientes
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por cliente, email o número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por estado */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="procesando">Procesando</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Pedidos</p>
          <p className="font-semibold mt-1">{mockOrders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Clientes Únicos</p>
          <p className="font-semibold mt-1">{uniqueClients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">En Proceso</p>
          <p className="font-semibold mt-1">
            {
              mockOrders.filter(
                (o) => o.status === 'procesando' || o.status === 'enviado'
              ).length
            }
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Entregados</p>
          <p className="font-semibold mt-1">
            {mockOrders.filter((o) => o.status === 'entregado').length}
          </p>
        </Card>
      </div>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {filteredOrders.length} pedido(s)
          </p>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="size-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No se encontraron pedidos</p>
              <p className="text-sm text-gray-500 mt-1">
                Intenta cambiar los filtros de búsqueda
              </p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium">{order.orderNumber}</span>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">
                        {order.clientName}
                      </p>
                      <p>{order.clientEmail}</p>
                      <p className="mt-1">
                        {format(order.date, "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="font-semibold">€{order.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.items.length} producto(s)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="size-4 mr-2" />
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
