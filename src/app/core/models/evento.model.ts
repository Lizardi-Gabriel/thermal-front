export type EventoStatus = 'confirmado' | 'descartado' | 'pendiente';

export interface Evento {
  evento_id: number;
  fecha_evento: string;
  descripcion?: string | null;
  estatus: EventoStatus;
  usuario_id?: number | null;
  usuario?: UserLight | null;
  imagenes?: Imagen[];
  registros_calidad_aire?: CalidadAire[];
}

export interface UserLight {
  usuario_id: number;
  nombre_usuario: string;
}

export interface Imagen {
  imagen_id: number;
  evento_id: number;
  ruta_imagen: string;
  hora_subida: string;
  detecciones?: Deteccion[];
}

export interface Deteccion {
  deteccion_id: number;
  imagen_id: number;
  confianza: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CalidadAire {
  registro_id: number;
  evento_id: number;
  temp: number;
  humedad: number;
  pm2p5: number;
  pm10: number;
  pm1p0: number;
  aqi: number;
  descrip: string;
  tipo: 'antes' | 'durante' | 'despues' | 'pendiente';
  hora_medicion?: string | null;
}
