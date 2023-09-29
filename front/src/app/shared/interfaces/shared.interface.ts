import { Horario } from "src/app/config/interfaces/config.interface";

export interface Email { //Alicia
  email: string;
}

export interface HorarioResponse { //Alicia
  success: boolean;
  data: Horario[];
}


