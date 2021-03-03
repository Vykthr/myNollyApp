import { Injectable } from '@angular/core';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { FormBuilder, FormGroup } from '@angular/forms';
const { Camera } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  loading: HTMLIonLoadingElement;
  public searchForm: FormGroup;
  img;
  movieList = [];
  users = 0;
  years = [];
  cast = [];
  producers = [];
  year = [];
  searchRes = [];
  filter = [];
  genres = ['crime', 'action', 'love', 'romance', 'drama', 'fiction', ];
  languages = ['english', 'hausa', 'igbo', 'yoruba'];
  froms = ['youtube', 'ibaka', 'iroko', 'netflix', 'amazon', 'cinemas', 'default']
  types = ['Movie', 'Series', 'Short Film']
  constructor(private toastCtrl: ToastController,
    private formBuilder: FormBuilder, private loadingCtrl: LoadingController, private navCtrl: NavController) {
    this.initialize();
    this.initSearchForm();
  }
  // top rated, popular, drama, comedy 

  async initialize(){
    this.getUsers();
    return this.getMovies().then(() => {
    }).catch(() => {
    });
  }

  initSearchForm(){
    this.searchForm = this.formBuilder.group({
      text: [''],
      producer: [[]],
      cast: [[]],
      year: [[]],
      genres: [[]],
      languages: [[]],
      types: [[]]
    });
  }

  async getMovies(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      firebase.firestore().collection('movies').onSnapshot(async (snapShot) => {
        this.movieList = [];
        snapShot.forEach(async (snap) => {
          await firebase.firestore().collection('movies').doc(snap.id).get()
          .then((details) => {
            const search = this.movieList.map((itm) => {
            return itm.id; }).indexOf(details.id);
            if(search == -1) {
              this.movieList.push({
                id: details.id,
                details: details.data()
              });
              this.searchInfo(details.data());
              if(details.data().added){
                this.sort()
              }

            }
          }).catch((err) => {
            reject(err);
          });
        });
          resolve(this.movieList)
      })
    }).catch((err) => {
      console.log(err);
    });
  }

  async getUsers(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      firebase.firestore().collection('users').onSnapshot(async (snapShot) => {
        this.users = snapShot.size;
      })
    }).catch((err) => {
      console.log(err);
    });
  }

  uploadImage(){
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    }).then((res) => {
      this.img = null;
      this.img = res.base64String;
      this.presentToast('Image Uploaded');
    }).catch((err) => {
      console.log(err)
      alert(err.message);
    })
  }

  async presentToast(message, header?, duration?) {
    const toast = await this.toastCtrl.create({
      message,
      header,
      duration: duration? duration : 2000
    });
    toast.present();
  }

  async presentLoading(message, duration?) {
    this.loading = await this.loadingCtrl.create({
      message,
      duration: duration? duration : 15000,
      spinner: 'bubbles'
    });
    await this.loading.present();
  }

  async addMovie(year: string, genre: [], title: string, description: string, link: string, cast: [], producers: [], language: [], img: string, added: string, from: string, type: string, trailer:string) {
    this.presentLoading('Adding Movie').then(() => { 
      firebase.firestore().collection('movies').add({title, description, link, year, genre, votes : 0, views: 1, cast, producers, language, added, from, type, trailer }).then((docRef) => {
        const storageRef = firebase.storage().ref(`/movies/${docRef.id}.png`);
        return storageRef.putString(img, 'base64', { contentType: 'image/png' }).then(() => {
          return storageRef.getDownloadURL().then(downloadURL => {
            return firebase.firestore().collection('movies').doc(docRef.id).update({ img: downloadURL }).then(() => {
              this.loading.dismiss().then(() => this.presentToast('Movie Added Successfully', 'Upload Success'));
              this.getMovies();
              this.navCtrl.navigateRoot('admin');
            });
          });
        });  
      });
    });
  }

  removeMovie(id) {
    this.presentLoading('Deleting Movie').then(() => {
      firebase.firestore().collection("movies").doc(id).delete().then(function() {
        this.presentToast("Movie successfully deleted!");
      }).catch(function(error) {
          this.presentToast("Error Deleting Movie");
      });
    });
  }

  sort(){
    return this.movieList.sort((a, b) => {
      // tslint:disable-next-line:prefer-const
      let nameA = a.details.added.toUpperCase(); // ignore upper and lowercase
      // tslint:disable-next-line:prefer-const
      let nameB = b.details.added.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return 1;
      }
      if (nameA > nameB) {
        return -1;
      }
      // names must be equal
      return 0;
    });
  }

  searchInfo(movie) {
    if(this.year.indexOf(movie.year) == -1){
      this.year.push(movie.year)
      this.year.sort();
    }
    movie.cast.forEach((item)=>{
      if(this.cast.indexOf(item) == -1) {
        this.cast.push(item);
        this.cast.sort();
      };
    })
    movie.producers.forEach((item)=>{
      if(this.producers.indexOf(item) == -1) {
        this.producers.push(item);
        this.producers.sort
      }
    })
  }
}
