import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from '../services/config.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { diaSeleccionado, mismaHora } from '../validators/valores-horas.validator';
import { Dia, Horario, HorarioMostrar, Hora } from '../interfaces/config.interface';
import { Time } from '@angular/common';
import * as interfaces from '../../citas/interfaces/citas.interface';
import { tap, zip } from 'rxjs';
import { CitasService } from '../../citas/services/citas.service';
import { NgbTimepickerConfig, NgbTimepickerModule, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { entradaSalidaVentana } from 'src/app/shared/animaciones/animaciones';


@Component({
  selector: 'app-horarios-config',
  templateUrl: './horarios-config.component.html',
  styleUrls: ['./horarios-config.component.scss'],
  animations: [entradaSalidaVentana]
})
export class HorariosConfigComponent {
  // Alicia
  citasForm!: FormGroup;
  horariosData: Horario[] = [];
  hMostrar!: HorarioMostrar[];
  hBorrar: number[] = [];
  timer: NodeJS.Timeout | undefined;
  mensaje: String = '';
  actualizado!: boolean;
  tBorrar: number[] = [];
  dSemana = [{ nombre: "Lunes", letra: "L" }, { nombre: "Martes", letra: "M" }, { nombre: "Miércoles", letra: "X" },
  { nombre: "Jueves", letra: "J" }, { nombre: "Viernes", letra: "V" }, { nombre: "Sábado", letra: "S" }];
  codAccion: number = -1;

  //Mario
  divCount = 0;
  horas:interfaces.Horario = {}; //: interfaces.Horario = {l: [], m: [], x: [], j: [], v: [], s: []};
  horariosDias: interfaces.HorarioDia[] = [];
  horarioMostrar: interfaces.HorarioDia[] = [];
  horasMostrar: string[] = [];
  isHoraEntradaSalida: boolean[] = [];
  numCitasALaVez: string;
  horaValida: boolean;
  intervalId: any;
  aLaVezValido: boolean;

  diaSeleccionado = 'l';
  // selectedButton: string = 'lunes'

  currentHour = new Date();
  time = { hour: this.currentHour.getHours(), minute: this.currentHour.getMinutes() };


  aLaVezForm: FormGroup = new FormGroup({
    nALaVez: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
  });

  diasSemana = [
    {dia: 'lunes', cod : 'l'},
    {dia: 'martes', cod : 'm'},
    {dia: 'miércoles', cod : 'x'},
    {dia: 'jueves', cod : 'j'},
    {dia: 'viernes', cod : 'v'},
    {dia: 'sábado', cod : 's'},
  ];

  constructor(
    private fb: FormBuilder,
    private ConfigService: ConfigService,
    private SharedService: SharedService,
    private citasService: CitasService
  ) { }


  get horarios() {
    return this.citasForm.controls["horarios"] as FormArray;
  }


  ngOnInit() {
    // Alicia
    this.crearFormulario();

    this.SharedService.getHorarios().subscribe(resp => {
      if (resp.success) this.getHorarios(resp.data);
    });



    // Mario
    this.traerHoras().subscribe(() => {
      this.cargarDia(this.diaSeleccionado);

      this.citasService.getCitasALaVez().subscribe(resp => {
        console.log('asdf');
        console.log(resp)
        if (resp.success) {
          this.numCitasALaVez = resp.num.toString();
        }
      });
      this.intervalId = setInterval(() => {
        this.checkTime();
      }, 250);
    });
  }

 // Alicia
  crearFormulario() {
    this.citasForm = this.fb.group({
      horarios: this.fb.array([], mismaHora()),
      telefonos: this.fb.array([]),
      direcciones: this.fb.array([])
    });
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


  getDiasHorario(index: number) {
    return this.horarios.at(index).get("dias") as FormArray;
  }


  crearHorario(dias: FormArray, id: number = -1) {
    return this.fb.group({
      id: id,
      dias: dias,
      hEntrada: ['00:00', Validators.required],
      hSalida: ['00:00', Validators.required],
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


  crearSemana() {
    let listaDias: FormArray = this.fb.array([], diaSeleccionado());

    this.dSemana.forEach(dia => {
      listaDias.push(this.crearDia(dia.nombre, dia.letra, false));
    });

    return listaDias;
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


  addHorario() {
    const listaDias = this.crearSemana();

    this.horarios.push(this.crearHorario(listaDias));
  }


  deleteHorario(index: number) {
    const horario = this.horarios.value[index];

    horario.dias.map((d: Dia) => { if (d.id != -1) this.hBorrar.push(d.id) });
    this.horarios.removeAt(index);
  }


  guardar() {
    if (this.citasForm.valid) {

      const datos = this.citasForm.value;
      const horarios = this.crearHorarioGuardar(datos.horarios);

      this.ConfigService.updateContacto(datos.direcciones, horarios)
        .subscribe({
          next: (resp) => {

            this.mensaje = resp.msg;
            this.actualizado = (resp.success) ? true : false;

            if (resp.success) {
              this.crearFormulario();
              this.getHorarios(resp.data.horarios);
              // this.getTlfns(resp.data.tlfns);
              // this.getDirs(resp.data.dirs);
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


  // Mario
  formatHora(time: any) {
    let t = {
      hour: '',
      minute: ''
    };

    t.hour = time.hour < 10 ? '0' + time.hour : time.hour;
    t.minute = time.minute < 10 ? '0' + time.minute : time.minute;

    return t;
  }


  checkTime() {
    const formatedTime = this.formatHora(this.time);
    const cTime = formatedTime.hour + ':' + formatedTime.minute + ':00';
    this.horaValida = false;

    this.horarioMostrar.forEach(h => {
      if (h.hEntrada <= cTime && h.hSalida > cTime) {
        this.horaValida = true;
        return;
      }
    });
  }


  traerHoras() {

    return zip([this.citasService.fetchHorasCitas(), this.citasService.fetchHorarios()])
      .pipe(tap(([horasCitasResp, horariosResp]) => {

        if (horasCitasResp.success && horariosResp.success) {
          this.horas = horasCitasResp.horas;
          this.horariosDias = horariosResp.data;
        }
        else {

          this.codAccion = 1;
          this.mensaje = "Se ha producido un error. Inténtalo más tarde.";
          this.setTimer(4000);
        }

      }));
  }


  quitar(index: number) {

    this.citasService.deleteHoraCita(this.horasMostrar[index] + ':00').subscribe(resp => {
      if (resp.success) {

        this.traerHoras().subscribe();
      }
      else {

        this.codAccion = 1;
        this.mensaje = "Se ha producido un error. Inténtalo más tarde.";
        this.setTimer(4000);

      }
    });
    this.horasMostrar.splice(index, 1);
    this.isHoraEntradaSalida.splice(index, 1);
  }


  anadirHora(dia: string) {
    const formatedTime = this.formatHora(this.time);
    // const cTime = formatedTime.hour + ':' + formatedTime.minute + ':00';
    const horaAnadir = formatedTime.hour + ':' + formatedTime.minute;
    // let anadir = true;

    // this.horasMostrar.map(hora => {if (hora == horaAnadir) {anadir = false; return;}});

    this.citasService.insertHoraCita(this.diaSeleccionado, horaAnadir + ':00').subscribe(resp => {

      console.log(resp);

      if (resp.success) {

        this.traerHoras().subscribe(() => {

          this.cargarDia(this.diaSeleccionado);
        });
      }
      else {

        this.codAccion = 1;
        if (resp.cod == 2) this.mensaje = "Se ha producido un error. Inténtalo más tarde.";
        if (resp.cod == 1) this.mensaje = 'Esta hora ya está insertada'
        this.setTimer(4000);
      }
    });
  }


  onDiaChange(dia: string) {
    this.diaSeleccionado = dia;
    this.cargarDia(dia);
  }


  cargarDia(dia: string) {
    let horas: string[] = [];
    this.horasMostrar.length = 0;
    this.isHoraEntradaSalida.length = 0;

    for (const key in this.horas) {
      if (dia == key) {
        horas = this.horas[key];
        this.horarioMostrar = this.horariosDias.filter(dia => {return dia.codDia == key});
      }
    }

    this.horarioMostrar.forEach(hEntradaSalida => {
      this.horasMostrar.push(hEntradaSalida.hEntrada.slice(0, -3));
      this.isHoraEntradaSalida.push(true);

      horas.forEach(hora => {
        if (hEntradaSalida.hEntrada <= hora && hEntradaSalida.hSalida > hora) {
          this.horasMostrar.push(hora.slice(0, -3));
          this.isHoraEntradaSalida.push(false);
        }
      });

      this.horasMostrar.push(hEntradaSalida.hSalida.slice(0, -3));
      this.isHoraEntradaSalida.push(true);
    });
  }


  updateCitasALavez() {
    this.citasService.updateCitasALaVez(this.aLaVezForm.get('nALaVez')?.value).subscribe(resp => {
      console.log(resp);
      if (resp.success) {

        this.codAccion = 0;
        this.mensaje = "Cita actualizada con éxito";
        this.setTimer(4000);
      }
      else {

        this.codAccion = 1;
        this.mensaje = "Se ha producido un error. Inténtalo más tarde.";
        this.setTimer(4000);
      }
    });
  }

  setTimer(tiempo: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.codAccion = -1, tiempo);
  }
}
