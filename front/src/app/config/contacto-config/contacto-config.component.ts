import { Time } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { diaSeleccionado, mismaHora } from '../validators/valores-horas.validator';
import { Dia, Horario, HorarioMostrar, Hora } from '../interfaces/config.interface';
import { Direccion } from 'src/app/direcciones/interfaces/direcciones.interfaces';

@Component({
  selector: 'app-contacto-config',
  templateUrl: './contacto-config.component.html',
  styleUrls: ['./contacto-config.component.scss']
})
export class ContactoConfigComponent { //Todo hecho por Alicia

  timer: NodeJS.Timeout | undefined;
  contactoForm!: FormGroup;
  mensaje: String = '';
  actualizado!: boolean;
  direccionesData: Direccion[] = [];
  horariosData: Horario[] = [];
  hMostrar!: HorarioMostrar[];
  hBorrar: number[] = [];
  dSemana = [{ nombre: "Lunes", letra: "L" }, { nombre: "Martes", letra: "M" }, { nombre: "Miércoles", letra: "X" },
  { nombre: "Jueves", letra: "J" }, { nombre: "Viernes", letra: "V" }, { nombre: "Sábado", letra: "S" }];


  constructor(
    private fb: FormBuilder,
    private ConfigService: ConfigService,
    private SharedService: SharedService
  ) { }


  get horarios() {
    return this.contactoForm.controls["horarios"] as FormArray;
  }


  getDiasHorario(index: number) {
    return this.horarios.at(index).get("dias") as FormArray;
  }


  get direcciones() {
    return this.contactoForm.controls["direcciones"] as FormArray;
  }


  ngOnInit() {
    this.crearFormulario();

    this.SharedService.getHorarios().subscribe(resp => {
      if (resp.success) this.getHorarios(resp.data);
    });
  }


  crearFormulario() {
    this.contactoForm = this.fb.group({
      horarios: this.fb.array([], mismaHora()),
      direcciones: this.fb.array([])
    });
  }


  guardar() {
    if (this.contactoForm.valid) {

      const datos = this.contactoForm.value;
      const horarios = this.crearHorarioGuardar(datos.horarios);

      this.ConfigService.updateContacto(datos.direcciones, horarios)
        .subscribe({
          next: (resp) => {

            this.mensaje = resp.msg;
            this.actualizado = (resp.success) ? true : false;

            if (resp.success) {
              this.crearFormulario();
              this.getHorarios(resp.data.horarios);
              this.getDirs(resp.data.dirs);
            }
          },
          error: (e) => {
            this.mensaje = e.error.msg;
            this.actualizado = false;
          }
        })

    } else {

      this.actualizado = false;
      this.mensaje = 'Datos no válidos';
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.mensaje = '', 4000);
  }


  //HORARIOS
  addHorario() {
    const listaDias = this.crearSemana();

    this.horarios.push(this.crearHorario(listaDias));
  }


  crearSemana() {
    let listaDias: FormArray = this.fb.array([], diaSeleccionado());

    this.dSemana.forEach(dia => {
      listaDias.push(this.crearDia(dia.nombre, dia.letra, false));
    });

    return listaDias;
  }


  deleteHorario(index: number) {
    const horario = this.horarios.value[index];

    horario.dias.map((d: Dia) => { if (d.id != -1) this.hBorrar.push(d.id) });
    this.horarios.removeAt(index);
  }


  crearHorarioGuardar(horarios: HorarioMostrar[]) {
    let hGuardar: Horario[] = [];

    horarios.forEach(horario => {
      horario.dias.forEach(d => {

        if (d.seleccionado) {
          hGuardar.push({
            id: d.id,
            dia: d.nombre,
            hEntrada: horario.hEntrada,
            hSalida: horario.hSalida,
          });

        } else if (d.id != -1) this.hBorrar.push(d.id);
      })
    });

    return { guardar: hGuardar, borrar: this.hBorrar };
  }


  crearHorarioMostrar() {
    let horas: Hora[] = []; // Horas de entrada y de salida de cada horario.
    let diasHora: Horario[] = [];
    let listaDias: Dia[]; //Días de un horario concreto.
    let idDia: number | undefined;
    let selecc: boolean;

    this.hMostrar = [];
    this.horariosData.forEach(horario => { // Recojo los distintos grupos de horas
      if (!horas.find(h => h.entrada == horario.hEntrada && h.salida == horario.hSalida))
        horas.push({ "entrada": horario.hEntrada, "salida": horario.hSalida });
    });

    horas.forEach(hora => { // Recojo los días que tienen ese grupo de horas
      listaDias = [];
      diasHora = this.horariosData.filter(h => h.hEntrada == hora.entrada && h.hSalida == hora.salida);

      this.dSemana.forEach(dia => {
        idDia = diasHora.find(d => d.dia == dia.nombre)?.id;
        selecc = (diasHora.find(d => d.dia == dia.nombre)) ? true : false;
        listaDias.push(this.crearDiaMostrar(dia.nombre, dia.letra, selecc, idDia));
      });

      this.addHorarioMostrar(listaDias, hora.entrada, hora.salida);
    });
  }


  addHorarioMostrar(listaDias: Dia[], entrada: Time = { hours: 0, minutes: 0 }, salida: Time = { hours: 0, minutes: 0 }) {
    this.hMostrar.push({
      dias: listaDias,
      hEntrada: entrada,
      hSalida: salida
    });
  }


  crearDiaMostrar(nombre: string, letra: string, selecc: boolean, id: number = -1) {
    return {
      id: id,
      nombre: nombre,
      letra: letra,
      seleccionado: selecc
    }
  }


  crearHorario(dias: FormArray, id: number = -1) {
    return this.fb.group({
      id: id,
      dias: dias,
      hEntrada: ['00:00', Validators.required],
      hSalida: ['00:00', Validators.required],
    });
  }


  crearDia(nombre: String, letra: String, selecc: boolean) {
    return this.fb.group({
      id: [-1, Validators.required],
      nombre: [nombre],
      letra: [letra],
      seleccionado: [selecc]
    })
  }


  getHorarios(datos: Horario[]) {
    let listaDias: FormArray;

    this.horariosData = datos;
    this.crearHorarioMostrar();

    for (let i = 0; i < this.hMostrar.length; i++) {
      listaDias = this.crearSemana();
      this.horarios.push(this.crearHorario(listaDias, i));
    }

    this.horarios.patchValue(this.hMostrar);
  }


  //DIRECCIONES
  getDirs(datos: Direccion[]) {
    this.direccionesData = datos;

    for (let i = 0; i < this.direccionesData.length; i++) {
      this.direcciones.push(this.fb.group({
        id: ['', Validators.required],
        lugar: [''],
        calle: [''],
        numero: ['', Validators.min(0)],
        ciudad: [''],
        provincia: [''],
        cp: ['', Validators.pattern("[0-9]{5}")]
      }));
    }

    this.direcciones.patchValue(this.direccionesData);
  }
}

