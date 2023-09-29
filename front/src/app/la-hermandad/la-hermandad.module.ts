import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LaHermandadRoutingModule } from './la-hermandad-routing.module';
import { ConfigMainComponent } from './config-main/config-main.component';
import { ConfigJuntaComponent } from './config-junta/config-junta.component';
import { ConfigHistoriaComponent } from './config-historia/config-historia.component';
import { ConfigCargosComponent } from './config-cargos/config-cargos.component';


@NgModule({
  declarations: [
    ConfigMainComponent,
    ConfigJuntaComponent,
    ConfigHistoriaComponent,
    ConfigCargosComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    AngularEditorModule,
    LaHermandadRoutingModule,
  ]
})
export class LaHermandadModule { }
