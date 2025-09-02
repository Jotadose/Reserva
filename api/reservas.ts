import type { VercelRequest, VercelResponse } from "@vercel/node";

let reservas = [
  {
    id: 1,
    usuario_id: 1,
    servicio_id: 1,
    fecha: new Date().toISOString().split("T")[0],
    hora: "10:00",
    estado: "confirmada",
  },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") {
    return res.status(200).json({ success: true, data: reservas });
  }
  if (req.method === "POST") {
    const { usuario_id, servicio_id, fecha, hora } = req.body;
    if (!usuario_id || !servicio_id || !fecha || !hora) {
      return res
        .status(400)
        .json({ success: false, error: "Campos obligatorios faltantes" });
    }
    const nueva = {
      id: Date.now(),
      usuario_id: +usuario_id,
      servicio_id: +servicio_id,
      fecha,
      hora,
      estado: "pendiente",
    };
    reservas.push(nueva);
    return res.status(201).json({ success: true, data: nueva });
  }
  return res.status(405).json({ success: false, error: "Método no permitido" });
}
