import { User } from '../models/User.model';
import { Product } from '../models/Product.model';

export const seedDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seed] Seeding default admin and demo user...');
      await User.create([
        {
          name: 'Shopwave Admin',
          email: 'admin@shopwave.local',
          password: 'AdminPassword123!',
          role: 'admin'
        },
        {
          name: 'Demo Customer',
          email: 'customer@shopwave.local',
          password: 'CustomerPassword123!',
          role: 'user'
        }
      ]);
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Seed] Seeding sample premium e-commerce products...');
      await Product.create([
        {
          name: 'Aura Studio Wireless ANC Headphones',
          description: 'High-fidelity spatial audio with active noise cancellation, custom acoustic architecture, and 40-hour ultra-long battery life.',
          price: 299.99,
          category: 'Audio',
          stock: 45,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          rating: 4.9
        },
        {
          name: 'Titanium Chrono Smartwatch Series X',
          description: 'Aerospace-grade titanium chassis, always-on sapphire crystal OLED display, ECG biosensors, and 50m water resistance.',
          price: 449.00,
          category: 'Wearables',
          stock: 30,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          rating: 4.8
        },
        {
          name: 'Lumina Mechanical RGB Ergonomic Keyboard',
          description: 'Hot-swappable tactile mechanical switches, aircraft aluminum plate, customizable per-key RGB backlighting, and sound-dampening foam.',
          price: 189.50,
          category: 'Accessories',
          stock: 60,
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          rating: 4.7
        },
        {
          name: 'Apex Precision Wireless Gaming Mouse',
          description: 'Ultra-lightweight honeycomb construction, 26,000 DPI optical sensor, optical switches, and lag-free 2.4GHz hyperspeed wireless.',
          price: 99.99,
          category: 'Accessories',
          stock: 80,
          imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
          rating: 4.6
        },
        {
          name: 'Prism 4K Ultra-HDR OLED Monitor 32"',
          description: 'Quantum Dot OLED panel with true 10-bit color, 144Hz refresh rate, 0.03ms response time, and 90W USB-C Power Delivery.',
          price: 899.00,
          category: 'Displays',
          stock: 18,
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
          rating: 4.9
        },
        {
          name: 'Nomad Waxed Canvas Everyday Backpack',
          description: 'Weatherproof heavy-duty canvas, Italian leather accents, dedicated 16-inch padded laptop sleeve, and modular organization compartments.',
          price: 159.00,
          category: 'Lifestyle',
          stock: 35,
          imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          rating: 4.8
        },
        {
          name: 'Sonar Portable Bluetooth Hi-Fi Speaker',
          description: 'IP67 waterproof and dustproof exterior, 360-degree cylindrical room-filling sound with dual passive radiators and 24-hour playback.',
          price: 129.99,
          category: 'Audio',
          stock: 50,
          imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
          rating: 4.7
        },
        {
          name: 'Vanguard Ergonomic Lumbar Mesh Office Chair',
          description: 'Self-adjusting dynamic lumbar support, breathable 4D mesh, 4D adjustable armrests, and synchro-tilt recline mechanism.',
          price: 349.99,
          category: 'Furniture',
          stock: 15,
          imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328a37ea71a?w=800&auto=format&fit=crop&q=80',
          rating: 4.9
        }
      ]);
      console.log('[Seed] Database populated successfully with initial catalog.');
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};
