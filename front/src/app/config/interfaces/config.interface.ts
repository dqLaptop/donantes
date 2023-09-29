import { Time } from "@angular/common";
import { Direccion } from "src/app/direcciones/interfaces/direcciones.interfaces";

export interface updateResponse { //Alicia
  success: boolean;
  msg: string;
  data: {
    "dirs": Direccion[],
    "horarios": Horario[]
  }
}

export interface Horario { //Alicia
  id: number;
  dia: string;
  hEntrada: Time;
  hSalida: Time;
}

export interface HorarioMostrar { //Alicia
  dias: Dia[];
  hEntrada: Time;
  hSalida: Time;
}

export interface HorarioGuardar { //Alicia
  borrar: number[],
  guardar: Horario[]
}

export interface Dia { //Alicia
  id: number;
  nombre: string;
  letra: string;
  seleccionado: boolean;
}

export interface Hora { //Alicia
  entrada: Time;
  salida: Time;
}

export interface ResponseAudio { //Isa
  success: boolean,
  data: Cancion[],
  msg: string,
}

export interface ResponseCancion { //Isa
  success: boolean,
  data: Cancion,
  msg: string,
}

export interface Himno { //Isa
  archivo: any,
  titulo: string,
  letra: string
}

export interface Cancion { //Isa
  id: string,
  nombre: string,
  titulo: string,
  letra: string,
  cancion: any,
  descarga: string
}
export interface ResponseFaqs{
  success: boolean,
  data: Faq[],
  msg: string,
}
export interface ResponseFaq{
  success: boolean,
  data: Faq,
  msg: string,
}
export interface Faq{
  id:string,
  pregunta:string,
  respuesta:string,
}

export interface Check{
  id:string,
  marcado:boolean,
}

export interface ResponseChat{
  success: boolean,
  data: number,
  msg: string,
}
