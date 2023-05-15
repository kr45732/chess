import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChessBoardModule } from "ngx-chess-board";
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { IframepageComponent } from './iframepage/iframepage.component';
import { MainpageComponent } from './mainpage/mainpage.component';

@NgModule({
  declarations: [
    AppComponent,
    IframepageComponent,
    MainpageComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: 'mainpage', component: MainpageComponent },
      { path: 'iframepage', component: IframepageComponent },
    ]),
    NgxChessBoardModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
