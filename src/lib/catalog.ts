import { CATEGORIES, ProductCategory } from './types';

// Default product catalog seeded for new users
export const DEFAULT_PRODUCTS: Record<ProductCategory, { name: string; price: number; unit: string }[]> = {
  Switches: [
    { name: '6A Switch (1-way)', price: 45, unit: 'Nos' },
    { name: '6A Switch (2-way)', price: 55, unit: 'Nos' },
    { name: '10A Switch', price: 60, unit: 'Nos' },
    { name: '16A Switch', price: 75, unit: 'Nos' },
    { name: 'Bell Push Switch', price: 50, unit: 'Nos' },
    { name: 'Switch Plate (1 module)', price: 35, unit: 'Nos' },
    { name: 'Switch Plate (2 module)', price: 45, unit: 'Nos' },
    { name: 'Switch Plate (4 module)', price: 70, unit: 'Nos' },
  ],
  Sockets: [
    { name: '6A Socket', price: 55, unit: 'Nos' },
    { name: '16A Socket', price: 120, unit: 'Nos' },
    { name: '20A Socket', price: 140, unit: 'Nos' },
    { name: 'USB Charging Socket', price: 250, unit: 'Nos' },
    { name: 'TV Socket', price: 180, unit: 'Nos' },
    { name: 'Telephone Socket', price: 160, unit: 'Nos' },
  ],
  Wires: [
    { name: '1.5 sq mm Wire (per meter)', price: 18, unit: 'Meter' },
    { name: '2.5 sq mm Wire (per meter)', price: 28, unit: 'Meter' },
    { name: '4 sq mm Wire (per meter)', price: 45, unit: 'Meter' },
    { name: '6 sq mm Wire (per meter)', price: 65, unit: 'Meter' },
    { name: 'Coaxial Cable (per meter)', price: 25, unit: 'Meter' },
    { name: 'LAN Cable (per meter)', price: 20, unit: 'Meter' },
  ],
  Conduit: [
    { name: '20mm PVC Conduit (per meter)', price: 22, unit: 'Meter' },
    { name: '25mm PVC Conduit (per meter)', price: 30, unit: 'Meter' },
    { name: 'Conduit Junction Box', price: 25, unit: 'Box' },
    { name: 'Conduit Bend', price: 15, unit: 'Nos' },
    { name: 'Conduit Coupler', price: 10, unit: 'Nos' },
  ],
  'MCB & DB': [
    { name: 'MCB 6A', price: 150, unit: 'Nos' },
    { name: 'MCB 16A', price: 180, unit: 'Nos' },
    { name: 'MCB 20A', price: 200, unit: 'Nos' },
    { name: 'MCB 32A', price: 250, unit: 'Nos' },
    { name: 'RCCB 25A', price: 450, unit: 'Nos' },
    { name: '8-way Distribution Board', price: 600, unit: 'Nos' },
    { name: '12-way Distribution Board', price: 900, unit: 'Nos' },
  ],
  Lights: [
    { name: 'LED Bulb 9W', price: 120, unit: 'Nos' },
    { name: 'LED Bulb 12W', price: 150, unit: 'Nos' },
    { name: 'LED Tube Light 20W', price: 280, unit: 'Nos' },
    { name: 'LED Panel Light 12W', price: 350, unit: 'Nos' },
    { name: 'COB Spotlight', price: 450, unit: 'Nos' },
    { name: 'LED Strip Light (per meter)', price: 120, unit: 'Meter' },
  ],
  Fans: [
    { name: 'Ceiling Fan 1200mm', price: 1500, unit: 'Nos' },
    { name: 'Wall Fan', price: 1200, unit: 'Nos' },
    { name: 'Exhaust Fan 6 inch', price: 650, unit: 'Nos' },
    { name: 'Table Fan', price: 1100, unit: 'Nos' },
    { name: 'Fan Regulator', price: 120, unit: 'Nos' },
  ],
  Earthing: [
    { name: 'Earthing Pipe (GI)', price: 800, unit: 'Nos' },
    { name: 'Earthing Rod (Copper)', price: 550, unit: 'Nos' },
    { name: 'Earth Wire (per meter)', price: 25, unit: 'Meter' },
    { name: 'Earthing Pit Cover', price: 200, unit: 'Nos' },
  ],
  Labour: [
    { name: 'Wiring Labour (per point)', price: 150, unit: 'Nos' },
    { name: 'Fan Installation', price: 250, unit: 'Nos' },
    { name: 'Light Fixture Installation', price: 100, unit: 'Nos' },
    { name: 'DB Installation', price: 500, unit: 'Nos' },
    { name: 'General Electrician (per day)', price: 800, unit: 'Nos' },
  ],
  Accessories: [
    { name: 'Ceiling Rose', price: 35, unit: 'Nos' },
    { name: 'Angle Holder', price: 40, unit: 'Nos' },
    { name: 'Hook Clamp', price: 15, unit: 'Nos' },
    { name: 'Screw (pack of 100)', price: 80, unit: 'Set' },
    { name: 'Cable Clip (pack of 50)', price: 50, unit: 'Set' },
  ],
  Other: [],
};

export function getCategoryIcon(category: ProductCategory): string {
  const icons: Record<ProductCategory, string> = {
    Switches: 'Switches',
    Sockets: 'Sockets',
    Wires: 'Wires',
    Conduit: 'Conduit',
    'MCB & DB': 'MCB & DB',
    Lights: 'Lights',
    Fans: 'Fans',
    Earthing: 'Earthing',
    Labour: 'Labour',
    Accessories: 'Accessories',
    Other: 'Other',
  };
  return icons[category];
}

export { CATEGORIES };
