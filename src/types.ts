export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  image: string;
  description: string;
  rating: number;
  specs: {
    screen: string;
    processor: string;
    ram: string;
    storage: string;
    battery: string;
  };
}

export interface Order {
  id: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "Bank Transfer" | "EasyPaisa" | "JazzCash";
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  shipping?: {
    method: string;
    price: number;
    estimatedDays: string;
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 999,
    discountPrice: 899,
    stock: 5,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
    description: "Titanium design, A17 Pro chip, and a versatile Pro camera system.",
    rating: 4.9,
    specs: {
      screen: "6.1-inch Super Retina XDR",
      processor: "A17 Pro",
      ram: "8GB",
      storage: "128GB",
      battery: "3274 mAh"
    }
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1299,
    image: "https://images.unsplash.com/photo-1706532822180-28269584488b?auto=format&fit=crop&q=80&w=800",
    description: "The ultimate Galaxy experience with S Pen, 200MP camera, and AI features.",
    rating: 4.8,
    specs: {
      screen: "6.8-inch Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      battery: "5000 mAh"
    }
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    price: 899,
    discountPrice: 749,
    stock: 2,
    image: "https://images.unsplash.com/photo-1696426571063-802f66964326?auto=format&fit=crop&q=80&w=800",
    description: "The best of Google AI, with a pro-level camera and all-day battery life.",
    rating: 4.7,
    specs: {
      screen: "6.7-inch Super Actua Display",
      processor: "Google Tensor G3",
      ram: "12GB",
      storage: "128GB",
      battery: "5050 mAh"
    }
  },
  {
    id: "4",
    name: "OnePlus 12",
    brand: "OnePlus",
    price: 799,
    image: "https://images.unsplash.com/photo-1707241857321-252199896080?auto=format&fit=crop&q=80&w=800",
    description: "Smooth Beyond Belief. Fast charging, stunning display, and powerful performance.",
    rating: 4.6,
    specs: {
      screen: "6.82-inch ProXDR Display",
      processor: "Snapdragon 8 Gen 3",
      ram: "16GB",
      storage: "256GB",
      battery: "5400 mAh"
    }
  },
  {
    id: "5",
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    price: 1199,
    image: "https://images.unsplash.com/photo-1710148705773-49033320743b?auto=format&fit=crop&q=80&w=800",
    description: "Leica optics, Snapdragon 8 Gen 3, and a premium design.",
    rating: 4.7,
    specs: {
      screen: "6.73-inch LTPO AMOLED",
      processor: "Snapdragon 8 Gen 3",
      ram: "16GB",
      storage: "512GB",
      battery: "5000 mAh"
    }
  },
  {
    id: "6",
    name: "Sony Xperia 1 V",
    brand: "Sony",
    price: 1099,
    image: "https://images.unsplash.com/photo-1684318721430-89689408077b?auto=format&fit=crop&q=80&w=800",
    description: "Unprecedented image quality with a next-generation sensor.",
    rating: 4.5,
    specs: {
      screen: "6.5-inch 4K HDR OLED",
      processor: "Snapdragon 8 Gen 2",
      ram: "12GB",
      storage: "256GB",
      battery: "5000 mAh"
    }
  }
];
