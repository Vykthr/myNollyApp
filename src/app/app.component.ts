import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FirebaseService } from './services/firebase/firebase.service';
import { MovieService } from './services/movie/movie.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    firebase: FirebaseService, public movie: MovieService, private menu: MenuController
    ) {
  
    this.initializeApp();
    


  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  search() {
    this.getFilter();
    document.getElementById('bt').innerHTML = '<ion-spinner slot="end" id="spin" name="bubbles"></ion-spinner>';
    setTimeout(()=>{
      this.movie.searchRes = [];
      let form = this.movie.searchForm.value;
      this.movie.movieList.forEach((item) => {
        if(this.movie.searchRes.indexOf(item) == -1){
          let x = item.details
          if(
            x.title.toLowerCase().includes(form.text.toLowerCase()) && form.text != ''
              
            || form.cast.some(r => x.cast.indexOf(r) >= 0)
              
            || form.producer.some(r=> x.producers.indexOf(r) >= 0)
              
            || form.types.indexOf(x.type) >= 0
              
            || form.languages.some(r=> x.language.indexOf(r) >= 0)
              
            || form.genres.some(r=> x.genre.indexOf(r) >= 0)
              
            || form.year.indexOf(x.year) >= 0)
          {
            this.movie.searchRes.push(item);
          }
        }
      })
      document.getElementById('bt').innerHTML = 'Search';
      this.menu.toggle();
    }, 1000)
  }

  getFilter() {
    this.movie.filter = [];
    if(this.movie.searchForm.value.text){ this.movie.filter.push('title')}
    if(this.movie.searchForm.value.genres.length > 0){ this.movie.filter.push('genres')}
    if(this.movie.searchForm.value.cast.length > 0){ this.movie.filter.push('cast')}
    if(this.movie.searchForm.value.producer.length > 0){ this.movie.filter.push('producers')}
    if(this.movie.searchForm.value.languages.length > 0){ this.movie.filter.push('languages')}
    if(this.movie.searchForm.value.types.length > 0){ this.movie.filter.push('Movie types')}
    if(this.movie.searchForm.value.year.length > 0){ this.movie.filter.push('year')}
  }
}
