// src/data/landingPageData.ts
// QUÉ HACE: Centraliza todo el contenido estático para la Landing Page.
// DÓNDE SE USA: UI-REF: Landing Page -> Todas las secciones (Héroe, Equipo, Testimonios, etc.)

export const featuredWorks = [
  {
    id: 1,
    title: "Fades Perfectos",
    image:
      "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Degradados precisos y profesionales",
  },
  {
    id: 2,
    title: "Colorimetría Pro",
    image:
      "https://images.pexels.com/photos/3998365/pexels-photo-3998365.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Colores vibrantes y técnicas avanzadas",
  },
  {
    id: 3,
    title: "Diseño Freestyle",
    image:
      "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Creatividad sin límites",
  },
  {
    id: 4,
    title: "Barba Clásica",
    image:
      "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "Perfilado y cuidado tradicional",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Carlos Mendoza",
    rating: 5,
    comment:
      "El mejor corte que me han hecho en años. Michael no solo es un barbero, es un artista. 100% recomendado.",
    image:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 2,
    name: "Diego Ramírez",
    rating: 5,
    comment:
      "El ambiente del estudio es increíble y la atención, de primera. Volveré sin dudarlo.",
    image:
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 3,
    name: "Andrés Silva",
    rating: 5,
    comment:
      "Profesionalismo y calidad en cada detalle. Los seminarios también son excelentes para aprender.",
    image:
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];

export const teamMembers = [
  {
    id: 1,
    name: "Michael The Barber",
    specialty: "Fundador y Colorimetrista",
    description:
      "Fundador y visionario, Michael transforma cada corte en una obra de arte. Especialista en colorimetría.",
    image:
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=300",
    instagram: "@michael.the.barber",
  },
  {
    id: 2,
    name: "Aleee Cut",
    specialty: "Especialista en Fades",
    description:
      "Con una precisión inigualable, Aleee es el maestro de los fades y degradados.",
    image:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
    instagram: "@aleee.cut",
  },
  {
    id: 3,
    name: "Kevo Cuts",
    specialty: "Artista Freestyle",
    description:
      "El artista del freestyle, Kevo lleva la creatividad y el diseño a otro nivel.",
    image:
      "https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg?auto=compress&cs=tinysrgb&w=300",
    instagram: "@kevo.cuts",
  },
];

export const seminars = [
  {
    id: 1,
    title: "Corte y Estilo Clásico",
    date: "15 de Agosto, 2025",
    price: 150000,
    spots: 8,
    image:
      "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 2,
    title: "El Arte del Afeitado con Navaja",
    date: "22 de Agosto, 2025",
    price: 200000,
    spots: 5,
    image:
      "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: 3,
    title: "Técnicas de Fade y Degradado",
    date: "29 de Agosto, 2025",
    price: 180000,
    spots: 12,
    image:
      "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];
