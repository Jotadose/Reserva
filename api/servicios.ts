import type { VercelRequest, VercelResponse } from "@vercel/node";

const mockServicios = [
  { id: 1, nombre: "Corte Clásico", precio: 15000, duracion: 30 },
  { id: 2, nombre: "Corte + Barba", precio: 25000, duracion: 45 },
  { id: 3, nombre: "Barba Premium", precio: 18000, duracion: 30 },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });
  res.status(200).json({ success: true, data: mockServicios });
}
