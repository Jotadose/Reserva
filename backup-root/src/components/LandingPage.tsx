import React, { useState, useEffect } from "react";
import {
  Play,
  Star,
  MapPin,
  Phone,
  Clock,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Palette,
  Plus,
} from "lucide-react";

interface LandingPageProps {
  onStartBooking: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartBooking }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentWork, setCurrentWork] = useState(0);

  const featuredWorks = [
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

  const testimonials = [
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

  const teamMembers = [
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
      description: "Con una precisión inigualable, Aleee es el maestro de los fades y degradados.",
      image:
        "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
      instagram: "@aleee.cut",
    },
    {
      id: 3,
      name: "Kevo Cuts",
      specialty: "Artista Freestyle",
      description: "El artista del freestyle, Kevo lleva la creatividad y el diseño a otro nivel.",
      image:
        "https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg?auto=compress&cs=tinysrgb&w=300",
      instagram: "@kevo.cuts",
    },
  ];

  const services = [
    {
      category: "Barbería",
      icon: <Scissors className="h-6 w-6" />,
      items: [
        { name: "Corte de Cabello", price: 12000, duration: 30 },
        { name: "Corte + Barba", price: 16000, duration: 45 },
        { name: "Corte + Barba + Limpieza", price: 22000, duration: 60 },
        { name: "Solo Barba", price: 6000, duration: 20 },
      ],
    },
    {
      category: "Colorimetría",
      icon: <Palette className="h-6 w-6" />,
      items: [
        { name: "Bloque de Color", price: 60000, duration: 120 },
        { name: "Platinado Global", price: 70000, duration: 150 },
        { name: "Visos", price: 60000, duration: 90 },
      ],
    },
    {
      category: "Extras",
      icon: <Plus className="h-6 w-6" />,
      items: [{ name: "Ondulación Permanente", price: 55000, duration: 90 }],
    },
  ];

  const seminars = [
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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextWork = () => {
    setCurrentWork((prev) => (prev + 1) % featuredWorks.length);
  };

  const prevWork = () => {
    setCurrentWork((prev) => (prev - 1 + featuredWorks.length) % featuredWorks.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10 bg-black/60"></div>
          <img
            src="https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Interior de barbería, ambiente moderno y profesional"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-7xl">
            MICHAEL THE BARBER
          </h1>
          <h2 className="mb-6 text-2xl font-light tracking-widest text-yellow-500 md:text-4xl">
            STUDIOS
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-gray-300 md:text-2xl">
            Servicios de barbería y formación de alto estándar en Coquimbo
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onStartBooking}
              className="transform rounded-lg bg-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
            >
              RESERVAR AHORA
            </button>
            <button className="rounded-lg border-2 border-yellow-500 px-8 py-4 text-lg font-bold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-black">
              VER TRABAJOS
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 transform">
          <div className="animate-bounce">
            <div className="flex h-10 w-6 justify-center rounded-full border-2 border-yellow-500">
              <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-yellow-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">TRABAJOS DESTACADOS</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Cada corte es una obra de arte. Descubre algunos de nuestros trabajos más destacados.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredWorks.map((work, index) => (
                <div
                  key={work.id}
                  className="group relative overflow-hidden rounded-xl bg-gray-900 transition-all duration-300 hover:scale-105 hover:transform"
                >
                  <img
                    src={work.image}
                    alt={`Trabajo destacado: ${work.title}`}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="mb-1 text-lg font-bold text-white">{work.title}</h3>
                      <p className="text-sm text-gray-300">{work.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">NUESTROS SERVICIOS</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Ofrecemos una amplia gama de servicios profesionales con precios transparentes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((category, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-700 bg-gray-800 p-8 transition-colors hover:border-yellow-500/50"
              >
                <div className="mb-6 flex items-center">
                  <div className="mr-4 rounded-lg bg-yellow-500/20 p-3 text-yellow-500">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                </div>

                <div className="space-y-4">
                  {category.items.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="flex items-center justify-between border-b border-gray-700 py-2 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium text-white">{service.name}</span>
                        <span className="block text-sm text-gray-400">{service.duration} min</span>
                      </div>
                      <span className="font-bold text-yellow-500">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onStartBooking}
              className="transform rounded-lg bg-yellow-500 px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
            >
              RESERVAR SERVICIO
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">NUESTRO EQUIPO</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Conoce a los artistas detrás de cada corte perfecto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="group">
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <img
                    src={member.image}
                    alt={`Barbero: ${member.name}, especialidad: ${member.specialty}`}
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm text-gray-300">{member.description}</p>
                      <p className="mt-2 text-sm text-yellow-500">{member.instagram}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-bold text-white">{member.name}</h3>
                  <p className="font-medium text-yellow-500">{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seminars Section */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">PRÓXIMOS SEMINARIOS</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Perfecciona tus habilidades con nuestros seminarios profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {seminars.map((seminar) => (
              <div
                key={seminar.id}
                className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 transition-colors hover:border-yellow-500/50"
              >
                <img
                  src={seminar.image}
                  alt={`Seminario: ${seminar.title}`}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="mb-4 text-xl font-bold text-white">{seminar.title}</h3>
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="text-white">{seminar.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Precio:</span>
                      <span className="font-bold text-yellow-500">
                        ${seminar.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cupos:</span>
                      <span className="text-white">{seminar.spots}</span>
                    </div>
                  </div>
                  <button
                    onClick={onStartBooking}
                    className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
                  >
                    INSCRIBIRSE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              QUÉ DICEN NUESTROS CLIENTES
            </h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-8">
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={`Testimonio de ${testimonials[currentTestimonial].name}`}
                  className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-yellow-500"
                  loading="lazy"
                />

                <div className="mb-4 flex justify-center">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-500" />
                  ))}
                </div>

                <blockquote className="mb-4 text-xl italic text-white md:text-2xl">
                  "{testimonials[currentTestimonial].comment}"
                </blockquote>

                <cite className="font-medium text-gray-400">
                  - {testimonials[currentTestimonial].name}
                </cite>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="mt-6 flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-yellow-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">VISÍTANOS</h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-yellow-500"></div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Map */}
            <div className="relative">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d864.061178292458!2d-71.2546005853337!3d-29.972396471197104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691cbd5bc6baeb1%3A0x1d123d4fb99d5ba5!2sMICHAEL%20THE%20BARBER!5e0!3m2!1ses-419!2scl!4v1753654219301!5m2!1ses-419!2scl"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Ubicación de Michael The Barber Studios"
                />
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-yellow-500/20 p-3">
                      <MapPin className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Dirección</p>
                      <p className="text-gray-400">Lago Blanco 1585, Coquimbo</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-yellow-500/20 p-3">
                      <Phone className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Teléfono / WhatsApp</p>
                      <p className="text-gray-400">+56 9 1234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-yellow-500/20 p-3">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Horarios</p>
                      <p className="text-gray-400">Lun - Sáb: 9:00 - 19:00</p>
                      <p className="text-gray-400">Domingo: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                <h4 className="mb-4 text-lg font-bold text-white">
                  ¿Listo para tu transformación?
                </h4>
                <p className="mb-6 text-gray-400">
                  Reserva tu cita ahora y experimenta el mejor servicio de barbería en Coquimbo.
                </p>
                <button
                  onClick={onStartBooking}
                  className="w-full transform rounded-lg bg-yellow-500 py-4 text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
                >
                  RESERVAR AHORA
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
