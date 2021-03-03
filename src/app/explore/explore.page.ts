import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie/movie.service';
import { MenuController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  templateUrl: 'explore.page.html',
  styleUrls: ['explore.page.scss']
})
export class ExplorePage {
  arr = [1,2,3,4,5];
  loader = true;
  seg = "all";
  lang = 'english';
  constructor(public movies: MovieService, private toastCtrl: ToastController, private router: Router, public menuCtrl: MenuController) {
    this.setErr();
  }
  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  ionViewWillLeave(){
    this.menuCtrl.enable(false);
  }

  doRefresh(event) {
    this.loader = true;
    this.movies.getMovies().then(() => {
      event.detail.complete();
    }).catch(async () => {
      const toast = await this.toastCtrl.create({
        message: 'An Error Occurred',
        duration: 2000
      });
      toast.present();
      event.detail.complete();
    });
    this.setErr();
  }

  setErr(){
    setTimeout(() => {
      if(this.movies.movieList.length == 0){
        this.loader = false
      }
    }, 10000)
  }

  open(movie) {
    const navExtra: NavigationExtras = {
      state: {
        data: movie
      }
    };
    this.router.navigate(['view'], navExtra);
  }
  
  getRate(votes, views) {
    let rating = (votes/views) * 5;
    if (rating >= 5 ) {
      return 5;
    } else {
      return rating
    }
  }

  trunc(val) {
    return Math.trunc(val)
  }

}
