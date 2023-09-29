import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionSangreComponent } from './donacion-sangre/donacion-sangre.component';
import { SharedModule } from '../shared/shared.module';
import { MainPageComponent } from './main-page/main-page.component';
import { AppRoutingModule } from './services/donacion-routing.module';
import { MainMedulaOseaComponent } from './donacion-medula/main-medula-osea/main-medula-osea.component';
import { MedulaOseaComponent } from './donacion-medula/medula-osea/medula-osea.component';
import { DondeMedulaOseaComponent } from './donacion-medula/donde-medula-osea/donde-medula-osea.component';
import { DonacionPlasmaComponent } from './donacion-plasma/donacion-plasma.component';


@NgModule({
  declarations: [
    DonacionSangreComponent,
    MainPageComponent,
    DonacionPlasmaComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule
  ],
  exports: [
    DonacionSangreComponent,
    MainPageComponent,
  ]
})
export class PaginasDonacionModule { }
