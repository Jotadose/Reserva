import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';

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
      image: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Degradados precisos y profesionales"
    },
    {
      id: 2,
      title: "Colorimetría Pro",
      image: "https://images.pexels.com/photos/3998365/pexels-photo-3998365.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Colores vibrantes y técnicas avanzadas"
    },
    {
      id: 3,
      title: "Diseño Freestyle",
      image: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Creatividad sin límites"
    },
    {
      id: 4,
      title: "Barba Clásica",
      image: "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Perfilado y cuidado tradicional"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Carlos Mendoza",
      rating: 5,
      comment: "El mejor corte que me han hecho en años. Michael no solo es un barbero, es un artista. 100% recomendado.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 2,
      name: "Diego Ramírez",
      rating: 5,
      comment: "El ambiente del estudio es increíble y la atención, de primera. Volveré sin dudarlo.",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 3,
      name: "Andrés Silva",
      rating: 5,
      comment: "Profesionalismo y calidad en cada detalle. Los seminarios también son excelentes para aprender.",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Michael The Barber",
      specialty: "Fundador y Colorimetrista",
      description: "Fundador y visionario, Michael transforma cada corte en una obra de arte. Especialista en colorimetría.",
      image: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=300",
      instagram: "@michael.the.barber"
    },
    {
      id: 2,
      name: "Aleee Cut",
      specialty: "Especialista en Fades",
      description: "Con una precisión inigualable, Aleee es el maestro de los fades y degradados.",
      image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300",
      instagram: "@aleee.cut"
    },
    {
      id: 3,
      name: "Kevo Cuts",
      specialty: "Artista Freestyle",
      description: "El artista del freestyle, Kevo lleva la creatividad y el diseño a otro nivel.",
      image: "https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg?auto=compress&cs=tinysrgb&w=300",
      instagram: "@kevo.cuts"
    }
  ];

  const services = [
    {
      category: "Barbería",
      icon: <Scissors className="h-6 w-6" />,
      items: [
        { name: "Corte de Cabello", price: 12000, duration: 30 },
        { name: "Corte + Barba", price: 16000, duration: 45 },
        { name: "Corte + Barba + Limpieza", price: 22000, duration: 60 },
        { name: "Solo Barba", price: 6000, duration: 20 }
      ]
    },
    {
      category: "Colorimetría",
      icon: <Palette className="h-6 w-6" />,
      items: [
        { name: "Bloque de Color", price: 60000, duration: 120 },
        { name: "Platinado Global", price: 70000, duration: 150 },
        { name: "Visos", price: 60000, duration: 90 }
      ]
    },
    {
      category: "Extras",
      icon: <Plus className="h-6 w-6" />,
      items: [
        { name: "Ondulación Permanente", price: 55000, duration: 90 }
      ]
    }
  ];

  const seminars = [
    {
      id: 1,
      title: "Corte y Estilo Clásico",
      date: "15 de Agosto, 2025",
      price: 150000,
      spots: 8,
      image: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "El Arte del Afeitado con Navaja",
      date: "22 de Agosto, 2025",
      price: 200000,
      spots: 5,
      image: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "Técnicas de Fade y Degradado",
      date: "29 de Agosto, 2025",
      price: 180000,
      spots: 12,
      image: "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
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
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img
            src="https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Barbershop interior"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            MICHAEL THE BARBER
          </h1>
          <h2 className="text-2xl md:text-4xl font-light text-yellow-500 mb-6 tracking-widest">
            STUDIOS
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Servicios de barbería y formación de alto estándar en Coquimbo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onStartBooking}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              RESERVAR AHORA
            </button>
            <button className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300">
              VER TRABAJOS
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-yellow-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Works Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              TRABAJOS DESTACADOS
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Cada corte es una obra de arte. Descubre algunos de nuestros trabajos más destacados.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWorks.map((work, index) => (
                <div
                  key={work.id}
                  className="group relative overflow-hidden rounded-xl bg-gray-900 hover:transform hover:scale-105 transition-all duration-300"
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-1">{work.title}</h3>
                      <p className="text-gray-300 text-sm">{work.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              NUESTROS SERVICIOS
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios profesionales con precios transparentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((category, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-yellow-500/50 transition-colors">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500 mr-4">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                      <div>
                        <span className="text-white font-medium">{service.name}</span>
                        <span className="text-gray-400 text-sm block">{service.duration} min</span>
                      </div>
                      <span className="text-yellow-500 font-bold">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onStartBooking}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
            >
              RESERVAR SERVICIO
            </button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              NUESTRO EQUIPO
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Conoce a los artistas detrás de cada corte perfecto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="group">
                <div className="relative overflow-hidden rounded-xl mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-gray-300 text-sm">{member.description}</p>
                      <p className="text-yellow-500 text-sm mt-2">{member.instagram}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-yellow-500 font-medium">{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seminars Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              PRÓXIMOS SEMINARIOS
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Perfecciona tus habilidades con nuestros seminarios profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {seminars.map((seminar) => (
              <div key={seminar.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-colors">
                <img
                  src={seminar.image}
                  alt={seminar.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{seminar.title}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="text-white">{seminar.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Precio:</span>
                      <span className="text-yellow-500 font-bold">${seminar.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cupos:</span>
                      <span className="text-white">{seminar.spots}</span>
                    </div>
                  </div>
                  <button
                    onClick={onStartBooking}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors"
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
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              QUÉ DICEN NUESTROS CLIENTES
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-yellow-500"
                />
                
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-white italic mb-4">
                  "{testimonials[currentTestimonial].comment}"
                </blockquote>
                
                <cite className="text-gray-400 font-medium">
                  - {testimonials[currentTestimonial].name}
                </cite>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              VISÍTANOS
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="relative">
              <div className="bg-gray-800 rounded-xl p-2 border border-gray-700">
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
                ></iframe>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Información de Contacto</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <MapPin className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Dirección</p>
                      <p className="text-gray-400">Lago Blanco 1585, Coquimbo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Phone className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Teléfono / WhatsApp</p>
                      <p className="text-gray-400">+56 9 1234 5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Horarios</p>
                      <p className="text-gray-400">Lun - Sáb: 9:00 - 19:00</p>
                      <p className="text-gray-400">Domingo: Cerrado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-4">¿Listo para tu transformación?</h4>
                <p className="text-gray-400 mb-6">
                  Reserva tu cita ahora y experimenta el mejor servicio de barbería en Coquimbo.
                </p>
                <button
                  onClick={onStartBooking}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
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