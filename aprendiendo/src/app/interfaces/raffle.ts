import { CodigoVip } from "./codigo-vip";
import { Producto } from "./producto";
import { User } from "./user";

export interface Raffle {
  id?: number;
  nombre: string; // Nombre de la rifa (obligatorio)
  cantidadParticipantes: any; // Cantidad de participantes (obligatorio)
  fechaSorteo: Date; // Fecha del sorteo (obligatorio)
  //usuario: User; // Usuario asociado (obligatorio)
  usuario: { id: number };
  producto: Producto;// Producto asociado (obligatorio)
  active: boolean;
  //codigoVip?: string;
  code?: string;
  codigoVip?: CodigoVip
  precio: any;
}
