import { Component, OnInit } from '@angular/core';
import { MovieService } from '../services/movie/movie.service';
import { FirebaseService } from '../services/firebase/firebase.service';
import { AlertController, NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  constructor(public movie: MovieService, private firebase: FirebaseService, private alertCtrl: AlertController, private nav: NavController, private router: Router) { }

  ngOnInit() {
    this.movie.getMovies();
  }

  removeMovie(id) {
    this.movie.removeMovie(id);
  }

  open(url) {
    this.router.navigate(['admin' , url]);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout Confirmation',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.firebase.logout();
          }
        }
      ]
    });
  
    await alert.present();
  }

  doRefresh(event) {
    this.movie.initialize().then(() => {
      event.detail.complete();
    })
  }

}
