import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res
      .status(405)
      .json({ success: false, error: "Método no permitido" });

  const { fecha } = req.query;
  if (!fecha)
    return res
      .status(400)
      .json({ success: false, error: "Fecha es obligatoria" });

  const slots = [] as any[];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hora = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push({ hora, disponible: Math.random() > 0.3 });
    }
  }
  res.status(200).json({ success: true, data: slots });
}
