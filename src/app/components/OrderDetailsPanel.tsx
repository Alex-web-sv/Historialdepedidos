import { Order, mockOrders } from '@/app/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface OrderDetailsPanelProps {
  orderId: string | null;
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  procesando: 'bg-blue-100 text-blue-800 border-blue-300',
  enviado: 'bg-purple-100 text-purple-800 border-purple-300',
  entregado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

export function OrderDetailsPanel({ orderId }: OrderDetailsPanelProps) {
  const order = orderId ? mockOrders.find((o) => o.id === orderId) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[500px] flex flex-col shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-blue-900 text-lg">Datos del pedido</h3>
        {order && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
            >
              Editar
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md"
            >
              Actualizar
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md"
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4">
        {!order ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📦</span>
              </div>
              <p className="text-gray-500">Selecciona un pedido para ver los detalles</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Información del pedido */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">Pedido {order.orderNumber}</h4>
                <Badge className={statusColors[order.status]}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">
                Fecha: {format(order.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>

            {/* Información del cliente */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-blue-900">Cliente</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Nombre:</span>
                  <span className="text-gray-900">{order.clientName}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Email:</span>
                  <span className="text-gray-900">{order.clientEmail}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Teléfono:</span>
                  <span className="text-gray-900">{order.phone}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Dirección:</span>
                  <span className="text-gray-900">{order.shippingAddress}</span>
                </p>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold mb-3 text-blue-900">Productos</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-orange-600">€{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white text-lg">Total</h4>
                <p className="font-bold text-white text-2xl">€{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}