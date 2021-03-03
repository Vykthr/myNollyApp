import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MovieService } from '../../services/movie/movie.service';
import { AlertController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  constructor(private router: Router,private alertCtrl: AlertController, public movies: MovieService) { 
  }

  ngOnInit() {
  }

  edit(movie) {
    const navExtra: NavigationExtras = {
      state: {
        data: movie
      }
    };
    this.router.navigate(['admin/edit'], navExtra);
  }

   
  async deleteMovie(movie) {
    const alertC = await this.alertCtrl.create({
      header: 'Delete Movie',
      message: 'Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            const storageRef = firebase.storage().ref(`/movies/${movie.id}.png`);
            return storageRef.delete().then(()=>{
              firebase.firestore().collection('movies').doc(movie.id).delete().then(()=> {
                const removeIndex = this.movies.movieList.map((itm) => {
                  return itm.id; 
                }).indexOf(movie.id);
                  // remove object
                this.movies.movieList.splice(removeIndex, 1);
              }).catch((error)=> {
                  alert("Error deleting movie");
              });
            })
          }
        }
      ]
    });
  
    await alertC.present();
  }
}
