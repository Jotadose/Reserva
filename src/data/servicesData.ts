// src/data/servicesData.ts
// QUÉ HACE: Define todos los servicios ofrecidos.
// DÓNDE SE USA: UI-REF: Booking Process -> Service Selection, Landing Page -> Services Section

import { Service } from "../types/booking";

export interface ServiceCategory {
  key: "barberia" | "colorimetria" | "extras";
  name: string;
  iconName: string; // Para usar con lucide-react
}

export const serviceCategories: ServiceCategory[] = [
  {
    key: "barberia",
    name: "Barbería",
    iconName: "Scissors",
  },
  {
    key: "colorimetria",
    name: "Colorimetría",
    iconName: "Palette",
  },
  {
    key: "extras",
    name: "Servicios Extras",
    iconName: "Plus",
  },
];

export const services: Service[] = [
  {
    id: "1",
    name: "Corte de Cabello",
    price: 12000,
    duration: 30,
    category: "barberia",
    description: "Corte clásico o moderno personalizado",
  },
  {
    id: "2",
    name: "Corte + Barba",
    price: 16000,
    duration: 45,
    category: "barberia",
    description: "Corte completo con arreglo y perfilado de barba",
  },
  {
    id: "3",
    name: "Corte + Barba + Limpieza",
    price: 22000,
    duration: 60,
    category: "barberia",
    description: "Servicio completo con limpieza facial",
  },
  {
    id: "4",
    name: "Solo Barba",
    price: 6000,
    duration: 20,
    category: "barberia",
    description: "Arreglo y perfilado de barba",
  },
  {
    id: "5",
    name: "Bloque de Color",
    price: 60000,
    duration: 120,
    category: "colorimetria",
    description: "Color uniforme en todo el cabello",
  },
  {
    id: "6",
    name: "Platinado Global",
    price: 70000,
    duration: 150,
    category: "colorimetria",
    description: "Decoloración completa y tinte platino",
  },
  {
    id: "7",
    name: "Visos",
    price: 60000,
    duration: 90,
    category: "colorimetria",
    description: "Mechas y reflejos profesionales",
  },
  {
    id: "8",
    name: "Ondulación Permanente",
    price: 55000,
    duration: 90,
    category: "extras",
    description: "Permanente para crear ondas naturales",
  },
];
