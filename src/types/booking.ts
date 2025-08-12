export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  category: 'barberia' | 'colorimetria' | 'extras';
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  services: Service[];
  client: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  };
  totalPrice: number;
  duration: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}