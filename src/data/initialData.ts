import { Product, User, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    ProductID: 'PRD-1001',
    PartName: 'Brembo Vented Slotted Sport Brake Rotor Set',
    Category: 'Brakes',
    CarModelCompatibility: 'Toyota Crown GRS200 / GRS204, Mark X GRX130, Lexus IS250',
    Price: 385000,
    StockQty: 14,
    ImageURL: '/src/assets/images/product_ceramic_brake_pads_1793961736593.jpg',
    Description: 'High-carbon cast iron rotors with bi-directional curved cooling vanes and precision curved slot pattern for superior thermal stability and rapid degassing.'
  },
  {
    ProductID: 'PRD-1002',
    PartName: 'Ceramic Heavy-Duty Sport Brake Pads (Front)',
    Category: 'Brakes',
    CarModelCompatibility: 'Toyota Hilux Revo (2015-2024), Fortuner AN160, Land Cruiser Prado 150',
    Price: 145000,
    StockQty: 26,
    ImageURL: '/src/assets/images/product_ceramic_brake_pads_1793961736593.jpg',
    Description: 'Ultra-low dust synthetic ceramic compound formulated for high-torque SUVs and commercial pickups navigating heavy traffic and mountain descents in Myanmar.'
  },
  {
    ProductID: 'PRD-1003',
    PartName: 'Tein Advance Street Height & Damping Coilovers',
    Category: 'Suspension',
    CarModelCompatibility: 'Honda Fit GK5 / GP5 (2014-2020), Honda City GM6, Jazz',
    Price: 1650000,
    StockQty: 4,
    ImageURL: '/src/assets/images/product_coilover_suspension_1793961738162.jpg',
    Description: '16-stage damping force adjustable twin-tube construction with rust-resistant powder coat and cold-wound chrome silicon steel springs.'
  },
  {
    ProductID: 'PRD-1004',
    PartName: 'Ultra Advanced 5W-30 Full Synthetic Motor Oil (5L) + Filter',
    Category: 'Oils',
    CarModelCompatibility: 'Universal Fit (Toyota, Honda, Mazda, Nissan, Suzuki)',
    Price: 125000,
    StockQty: 42,
    ImageURL: '/src/assets/images/product_synthetic_engine_oil_1793961738013.jpg',
    Description: 'API SP / ILSAC GF-6A certified full synthetic engine oil with zinc-boosted anti-wear additives and heavy-duty chrome magnetic oil filter.'
  },
  {
    ProductID: 'PRD-1005',
    PartName: 'Denso Iridium Power Racing Spark Plugs (Pack of 4)',
    Category: 'Engine',
    CarModelCompatibility: 'Toyota Probox 1NZ-FE, Vitz, Corolla Axio, Suzuki Swift 1.2',
    Price: 72000,
    StockQty: 38,
    ImageURL: '/src/assets/images/hero_automotive_parts_1793961736556.jpg',
    Description: 'Patented 0.4mm laser-welded iridium alloy tip delivers instantaneous ignition response, smoother idling, and improved fuel combustion efficiency.'
  },
  {
    ProductID: 'PRD-1006',
    PartName: 'Philips Ultinon Pro9000 Dual-Beam LED Headlamp Kit (H4)',
    Category: 'Lighting',
    CarModelCompatibility: 'Toyota Hilux Vigo/Revo, Toyota Probox, Suzuki Swift, Honda Fit GE6',
    Price: 230000,
    StockQty: 19,
    ImageURL: '/src/assets/images/hero_automotive_parts_1793961736556.jpg',
    Description: '5800 Kelvin daylight spectrum, +250% brighter throw over stock halogen, and engineered beam cutoff that prevents blinding oncoming drivers on rural highways.'
  },
  {
    ProductID: 'PRD-1007',
    PartName: 'AeroCraft Aircraft-Grade Aluminum Strut Tower Brace',
    Category: 'Accessories',
    CarModelCompatibility: 'Toyota Crown Athlete GRS180/GRS200, Mark X 250G, Toyota Harrier',
    Price: 185000,
    StockQty: 7,
    ImageURL: '/src/assets/images/product_coilover_suspension_1793961738162.jpg',
    Description: 'Rigid CNC-milled 6061-T6 aluminum tower brace engineered to eliminate chassis flex under aggressive cornering and high-speed highway cruising.'
  },
  {
    ProductID: 'PRD-1008',
    PartName: 'K&N High-Flow Oiled Washable Performance Air Filter',
    Category: 'Engine',
    CarModelCompatibility: 'Toyota Hilux 1GD-FTV / 2GD-FTV, Fortuner, Land Cruiser Prado 150',
    Price: 165000,
    StockQty: 18,
    ImageURL: '/src/assets/images/hero_automotive_parts_1793961736556.jpg',
    Description: 'Multi-layered cotton gauze media engineered to increase airflow by up to 50% while capturing microscopic dust particles in challenging off-road conditions.'
  },
  {
    ProductID: 'PRD-1009',
    PartName: 'Motul 75W-90 Synthetic Gear & Differential Fluid (1L)',
    Category: 'Oils',
    CarModelCompatibility: 'Toyota Hilux, Toyota Crown, Land Cruiser, Nissan Navara',
    Price: 68000,
    StockQty: 30,
    ImageURL: '/src/assets/images/product_synthetic_engine_oil_1793961738013.jpg',
    Description: '100% synthetic ester-based extreme pressure lubricant for manual gearboxes, transfer cases, and hypoid differentials under heavy load.'
  },
  {
    ProductID: 'PRD-1010',
    PartName: 'Hardrace Front Lower Ball Joint Heavy-Duty Replacements',
    Category: 'Suspension',
    CarModelCompatibility: 'Toyota Crown GRS180 / GRS200, Mark X GRX120 / GRX130, Alphard GGH20',
    Price: 195000,
    StockQty: 3,
    ImageURL: '/src/assets/images/product_coilover_suspension_1793961738162.jpg',
    Description: 'High-strength steel forged ball joints with sealed dust boot to restore precision steering geometry and eliminate clunking on rough paved roads.'
  },
  {
    ProductID: 'PRD-1011',
    PartName: 'AutoPulse LED Amber Fog Lamp Assembly (Pair)',
    Category: 'Lighting',
    CarModelCompatibility: 'Toyota Alphard, Vellfire, Harrier XU60, Hilux Revo',
    Price: 195000,
    StockQty: 12,
    ImageURL: '/src/assets/images/hero_automotive_parts_1793961736556.jpg',
    Description: '3000K selective amber penetrating beam tailored specifically for monsoon rains, mountain fog, and dusty unpaved highway conditions.'
  },
  {
    ProductID: 'PRD-1012',
    PartName: 'Razo Carbon Fiber Interior Sport Pedal & Footrest Set',
    Category: 'Accessories',
    CarModelCompatibility: 'Universal Fit (Automatic & CVT Transmission vehicles)',
    Price: 85000,
    StockQty: 22,
    ImageURL: '/src/assets/images/product_ceramic_brake_pads_1793961736593.jpg',
    Description: 'Ergonomic cast aluminum pedal covers with genuine carbon fiber inlays and non-slip rubber grip studs for rapid, confident foot transitions.'
  }
];

export const INITIAL_USERS: User[] = [
  {
    UserID: 'USR-ADMIN01',
    FullName: 'Apex Administrator',
    Phone: '09971234567',
    Email: 'admin@uedcmm.com',
    Address: 'No. 42 Pyay Road, Kamayut Township, Yangon',
    Role: 'admin',
    CreatedAt: '2026-01-15T08:30:00.000Z'
  },
  {
    UserID: 'USR-CUST01',
    FullName: 'Ko Aung Kyaw',
    Phone: '09798765432',
    Email: 'ko.kyaw@gmail.com',
    Address: 'Room 5B, Pearl Condo, Bahan Township, Yangon',
    Role: 'customer',
    CreatedAt: '2026-02-10T11:20:00.000Z'
  },
  {
    UserID: 'USR-CUST02',
    FullName: 'Ma Thandar Win',
    Phone: '09450011223',
    Email: 'thandar.win@gmail.com',
    Address: '68th Street, Between 28th & 29th, Chanayethazan, Mandalay',
    Role: 'customer',
    CreatedAt: '2026-03-01T14:45:00.000Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    OrderID: 'ORD-2026-8812',
    UserID: 'USR-CUST01',
    CustomerName: 'Ko Aung Kyaw',
    Phone: '09798765432',
    ItemsJSON: JSON.stringify([
      { ProductID: 'PRD-1001', PartName: 'Brembo Vented Slotted Sport Brake Rotor Set', Price: 385000, Quantity: 1 }
    ]),
    Items: [
      { ProductID: 'PRD-1001', PartName: 'Brembo Vented Slotted Sport Brake Rotor Set', Price: 385000, Quantity: 1 }
    ],
    TotalAmount: 385000,
    PaymentStatus: 'Shipped',
    OrderDate: '2026-11-04T09:15:00.000Z',
    Address: 'Room 5B, Pearl Condo, Bahan Township, Yangon',
    PaymentMethod: 'KBZPay'
  },
  {
    OrderID: 'ORD-2026-8813',
    UserID: 'USR-CUST02',
    CustomerName: 'Ma Thandar Win',
    Phone: '09450011223',
    ItemsJSON: JSON.stringify([
      { ProductID: 'PRD-1004', PartName: 'Ultra Advanced 5W-30 Full Synthetic Motor Oil (5L) + Filter', Price: 125000, Quantity: 2 },
      { ProductID: 'PRD-1005', PartName: 'Denso Iridium Power Racing Spark Plugs (Pack of 4)', Price: 72000, Quantity: 1 }
    ]),
    Items: [
      { ProductID: 'PRD-1004', PartName: 'Ultra Advanced 5W-30 Full Synthetic Motor Oil (5L) + Filter', Price: 125000, Quantity: 2 },
      { ProductID: 'PRD-1005', PartName: 'Denso Iridium Power Racing Spark Plugs (Pack of 4)', Price: 72000, Quantity: 1 }
    ],
    TotalAmount: 322000,
    PaymentStatus: 'Paid',
    OrderDate: '2026-11-05T13:40:00.000Z',
    Address: '68th Street, Between 28th & 29th, Chanayethazan, Mandalay',
    PaymentMethod: 'WavePay'
  },
  {
    OrderID: 'ORD-2026-8814',
    UserID: 'USR-CUST01',
    CustomerName: 'Ko Aung Kyaw',
    Phone: '09798765432',
    ItemsJSON: JSON.stringify([
      { ProductID: 'PRD-1006', PartName: 'Philips Ultinon Pro9000 Dual-Beam LED Headlamp Kit (H4)', Price: 230000, Quantity: 1 }
    ]),
    Items: [
      { ProductID: 'PRD-1006', PartName: 'Philips Ultinon Pro9000 Dual-Beam LED Headlamp Kit (H4)', Price: 230000, Quantity: 1 }
    ],
    TotalAmount: 230000,
    PaymentStatus: 'Pending',
    OrderDate: '2026-11-06T02:10:00.000Z',
    Address: 'Room 5B, Pearl Condo, Bahan Township, Yangon',
    PaymentMethod: 'Cash on Delivery'
  }
];

export const POPULAR_CAR_MODELS = [
  'All Vehicles',
  'Toyota Crown (GRS180 / 200 / 204)',
  'Toyota Hilux Revo / Rocco',
  'Toyota Probox / Succeed (NCP50)',
  'Honda Fit / Jazz (GK5 / GP5)',
  'Toyota Corolla Axio / Fielder',
  'Mazda Demio / Mazda 2',
  'Toyota Alphard / Vellfire',
  'Toyota Land Cruiser Prado 150',
  'Suzuki Swift (ZC32S / ZC33S)',
  'Toyota Mark X (GRX120 / GRX130)'
];
