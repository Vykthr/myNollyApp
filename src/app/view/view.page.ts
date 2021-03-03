import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { MovieService } from '../services/movie/movie.service';
import { FirebaseService } from '../services/firebase/firebase.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.page.html',
  styleUrls: ['./view.page.scss'],
})
export class ViewPage implements OnInit {
  movie : any;
  seg = 'view';
  arr = [1,2,3,4,5];
  trailer;
  constructor(activatedRoute: ActivatedRoute, router: Router, public nav: NavController, private toast: ToastController, public movies: MovieService, sanitizer: DomSanitizer, public profile: FirebaseService, private alertCtrl: AlertController) { 
    activatedRoute.queryParams.subscribe(params => {
      if(router.getCurrentNavigation().extras.state) {
        this.movie = router.getCurrentNavigation().extras.state.data;
        this.trailer = sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.movie.details.trailer);
      } else {
        nav.navigateRoot('tabs/home')
      }
    });
  }

  ngOnInit() {
    this.addView();
  }

  getRate(votes, views) {
    let rating = (votes/views) * 5;
    if (rating >= 5 ) {
      return 5;
    } else {
      return rating
    }
  }

  getCast(arr) {
    if(arr){
      return arr.join(", ")
    }
  }

  trunc(val) {
    return Math.trunc(val)
  }

  async likeVid(id){
    if(this.profile.userDetails){
      if(this.profile.userDetails.votes){
        let userVotes = this.profile.userDetails.votes;
        let i = userVotes.indexOf(id);
        if(i == -1){
          userVotes.push(id);
          this.profile.userProfile.update({
            votes: userVotes
          }).then(()=>{
            let newVote = this.movie.details.votes + 1;
            firebase.firestore().doc(`/movies/${id}`).update({
              votes: newVote
            }).then(()=>{
              this.presentToastWithOptions('Video Liked!');
              this.profile.userDetails['votes'] = userVotes;
              this.movie.details.votes = newVote;
            })
          });
        } else {
          this.presentToastWithOptions("You've already liked this video");
        }
      } else {
        let userVotes = [];
        userVotes.push(id);
        this.profile.userProfile.update({
          votes: userVotes
        }).then(()=>{
          let newVote = this.movie.details.votes + 1;
          firebase.firestore().doc(`/movies/${id}`).update({
            votes: newVote
          }).then(()=>{
            this.presentToastWithOptions('Video Liked!');
            this.profile.userDetails['votes'] = userVotes;
            this.movie.details.votes = newVote;
          })
        });
      }
    } else {
      const alert = await this.alertCtrl.create({
        message: 'Please Login to Like Video',
        buttons: [
          {
            text: 'Login Page',
            handler: () => {
              this.nav.navigateForward('login');
            }
          },
          {
            text: 'Okay',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
            }
          }
        ]
      });
      await alert.present();
    }
  }
  
  async presentToastWithOptions(message) {
    const toast = await this.toast.create({
      animated: true,
      color: 'primary',
      mode: 'ios',
      duration: 2000,
      keyboardClose: true,
      message,
      position: 'bottom',
      translucent: true
    });
    toast.present();
  }

  addView() {
    if(this.profile.userDetails){
      if(this.profile.userDetails.views){
        let userViews = this.profile.userDetails.views;
        let i = userViews.indexOf(this.movie.id);
        if(i == -1){
          userViews.push(this.movie.id);
          this.profile.userProfile.update({
            views: userViews
          }).then(()=>{
            let newView = this.movie.details.views + 1;
            firebase.firestore().doc(`/movies/${this.movie.id}`).update({
              views: newView
            }).then(()=>{
              this.profile.userDetails['views'] = userViews;
              this.movie.details.views = newView;
            })
          });
        }
      } else {
        let userViews = [];
        userViews.push(this.movie.id);
        this.profile.userProfile.update({
          views: userViews
        }).then(()=>{
          let newView = this.movie.details.views + 1;
          firebase.firestore().doc(`/movies/${this.movie.id}`).update({
            views: newView
          }).then(()=>{
            this.profile.userDetails['views'] = userViews;
            this.movie.details.views = newView;
          })
        });
      }
    }
  }

}
