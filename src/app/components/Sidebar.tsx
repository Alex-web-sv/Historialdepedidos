import { Package, ShoppingCart, Users, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-56 bg-gradient-to-b from-blue-900 to-blue-800 h-screen p-4 flex flex-col gap-3 shadow-xl">
      <div className="mb-6 mt-2">
        <h1 className="font-semibold text-center py-3 text-white text-xl">Panel Admin</h1>
        <div className="h-1 bg-orange-500 rounded-full mt-2"></div>
      </div>
      
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === item.id
                ? 'bg-orange-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-102'
            }`}
          >
            <span className="flex items-center justify-center gap-2 font-medium">
              <Icon className="size-4" />
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}