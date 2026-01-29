import { Order } from '@/app/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Package, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const statusColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  procesando: 'bg-blue-100 text-blue-800 border-blue-300',
  enviado: 'bg-purple-100 text-purple-800 border-purple-300',
  entregado: 'bg-green-100 text-green-800 border-green-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Detalles del Pedido</h2>
            <p className="text-sm text-gray-600">{order.orderNumber}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado */}
          <div>
            <Badge className={statusColors[order.status]}>
              {order.status.toUpperCase()}
            </Badge>
          </div>

          {/* Información del Cliente */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <User className="size-4" />
              Información del Cliente
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p>{order.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{order.clientEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-gray-600" />
                <p>{order.phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-gray-600 mt-0.5" />
                <p>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Fecha del Pedido */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="size-4" />
            <p>
              {format(order.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>

          <Separator />

          {/* Productos */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Package className="size-4" />
              Productos
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div>
                    <p>{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">€{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4">
            <p className="font-semibold">Total</p>
            <p className="font-semibold">€{order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
