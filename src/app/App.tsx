import { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { ClientList } from '@/app/components/ClientList';
import { OrderHistory } from '@/app/components/OrderHistory';
import { OrderDetailsPanel } from '@/app/components/OrderDetailsPanel';

export default function App() {
  const [activeSection, setActiveSection] = useState('pedidos');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Panel de detalles del pedido */}
          <OrderDetailsPanel orderId={selectedOrderId} />

          {/* Paneles inferiores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientList onClientSelect={setSelectedClient} />
            <OrderHistory
              selectedClient={selectedClient}
              onOrderSelect={setSelectedOrderId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}