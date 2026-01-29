export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  date: Date;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'PED-001',
    clientName: 'María González',
    clientEmail: 'maria.gonzalez@email.com',
    date: new Date('2026-01-28'),
    status: 'entregado',
    total: 125.50,
    items: [
      { id: '1-1', productName: 'Laptop HP', quantity: 1, price: 89.99 },
      { id: '1-2', productName: 'Mouse inalámbrico', quantity: 2, price: 17.75 },
    ],
    shippingAddress: 'Calle Principal 123, Madrid',
    phone: '+34 612 345 678',
  },
  {
    id: '2',
    orderNumber: 'PED-002',
    clientName: 'Juan Pérez',
    clientEmail: 'juan.perez@email.com',
    date: new Date('2026-01-27'),
    status: 'procesando',
    total: 450.00,
    items: [
      { id: '2-1', productName: 'Monitor 27 pulgadas', quantity: 1, price: 350.00 },
      { id: '2-2', productName: 'Cable HDMI', quantity: 2, price: 50.00 },
    ],
    shippingAddress: 'Avenida Libertad 45, Barcelona',
    phone: '+34 623 456 789',
  },
  {
    id: '3',
    orderNumber: 'PED-003',
    clientName: 'Ana Martínez',
    clientEmail: 'ana.martinez@email.com',
    date: new Date('2026-01-26'),
    status: 'enviado',
    total: 89.99,
    items: [
      { id: '3-1', productName: 'Teclado mecánico', quantity: 1, price: 89.99 },
    ],
    shippingAddress: 'Plaza Mayor 8, Valencia',
    phone: '+34 634 567 890',
  },
  {
    id: '4',
    orderNumber: 'PED-004',
    clientName: 'Carlos Rodríguez',
    clientEmail: 'carlos.rodriguez@email.com',
    date: new Date('2026-01-25'),
    status: 'pendiente',
    total: 299.99,
    items: [
      { id: '4-1', productName: 'Impresora láser', quantity: 1, price: 299.99 },
    ],
    shippingAddress: 'Calle Sol 56, Sevilla',
    phone: '+34 645 678 901',
  },
  {
    id: '5',
    orderNumber: 'PED-005',
    clientName: 'María González',
    clientEmail: 'maria.gonzalez@email.com',
    date: new Date('2026-01-24'),
    status: 'entregado',
    total: 175.50,
    items: [
      { id: '5-1', productName: 'Webcam HD', quantity: 1, price: 75.50 },
      { id: '5-2', productName: 'Micrófono USB', quantity: 1, price: 100.00 },
    ],
    shippingAddress: 'Calle Principal 123, Madrid',
    phone: '+34 612 345 678',
  },
  {
    id: '6',
    orderNumber: 'PED-006',
    clientName: 'Laura Sánchez',
    clientEmail: 'laura.sanchez@email.com',
    date: new Date('2026-01-23'),
    status: 'cancelado',
    total: 65.00,
    items: [
      { id: '6-1', productName: 'Mousepad XXL', quantity: 1, price: 25.00 },
      { id: '6-2', productName: 'Soporte para laptop', quantity: 1, price: 40.00 },
    ],
    shippingAddress: 'Ronda Norte 23, Málaga',
    phone: '+34 656 789 012',
  },
  {
    id: '7',
    orderNumber: 'PED-007',
    clientName: 'Juan Pérez',
    clientEmail: 'juan.perez@email.com',
    date: new Date('2026-01-22'),
    status: 'entregado',
    total: 120.00,
    items: [
      { id: '7-1', productName: 'Auriculares gaming', quantity: 2, price: 60.00 },
    ],
    shippingAddress: 'Avenida Libertad 45, Barcelona',
    phone: '+34 623 456 789',
  },
  {
    id: '8',
    orderNumber: 'PED-008',
    clientName: 'Pedro López',
    clientEmail: 'pedro.lopez@email.com',
    date: new Date('2026-01-21'),
    status: 'procesando',
    total: 550.00,
    items: [
      { id: '8-1', productName: 'Silla ergonómica', quantity: 1, price: 550.00 },
    ],
    shippingAddress: 'Camino Real 78, Zaragoza',
    phone: '+34 667 890 123',
  },
  {
    id: '9',
    orderNumber: 'PED-009',
    clientName: 'Ana Martínez',
    clientEmail: 'ana.martinez@email.com',
    date: new Date('2026-01-20'),
    status: 'entregado',
    total: 210.00,
    items: [
      { id: '9-1', productName: 'Disco SSD 1TB', quantity: 1, price: 150.00 },
      { id: '9-2', productName: 'Memoria RAM 16GB', quantity: 1, price: 60.00 },
    ],
    shippingAddress: 'Plaza Mayor 8, Valencia',
    phone: '+34 634 567 890',
  },
  {
    id: '10',
    orderNumber: 'PED-010',
    clientName: 'Sofía Torres',
    clientEmail: 'sofia.torres@email.com',
    date: new Date('2026-01-19'),
    status: 'enviado',
    total: 85.00,
    items: [
      { id: '10-1', productName: 'Hub USB-C', quantity: 1, price: 45.00 },
      { id: '10-2', productName: 'Cable USB-C', quantity: 2, price: 20.00 },
    ],
    shippingAddress: 'Paseo Marítimo 12, Alicante',
    phone: '+34 678 901 234',
  },
  {
    id: '11',
    orderNumber: 'PED-011',
    clientName: 'Carlos Rodríguez',
    clientEmail: 'carlos.rodriguez@email.com',
    date: new Date('2026-01-18'),
    status: 'entregado',
    total: 340.00,
    items: [
      { id: '11-1', productName: 'Router WiFi 6', quantity: 1, price: 180.00 },
      { id: '11-2', productName: 'Switch ethernet 8 puertos', quantity: 1, price: 160.00 },
    ],
    shippingAddress: 'Calle Sol 56, Sevilla',
    phone: '+34 645 678 901',
  },
  {
    id: '12',
    orderNumber: 'PED-012',
    clientName: 'María González',
    clientEmail: 'maria.gonzalez@email.com',
    date: new Date('2026-01-17'),
    status: 'procesando',
    total: 95.00,
    items: [
      { id: '12-1', productName: 'Lámpara LED escritorio', quantity: 1, price: 45.00 },
      { id: '12-2', productName: 'Organizador de cables', quantity: 1, price: 50.00 },
    ],
    shippingAddress: 'Calle Principal 123, Madrid',
    phone: '+34 612 345 678',
  },
];
