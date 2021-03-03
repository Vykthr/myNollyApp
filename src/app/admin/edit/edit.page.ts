import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Plugins, CameraSource, CameraResultType } from "@capacitor/core";
import { MovieService } from '../../services/movie/movie.service';
import { NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { Router, ActivatedRoute } from '@angular/router';
const { Camera } = Plugins

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  public addForm: FormGroup;
  public editForm: FormGroup;
  loading: HTMLIonLoadingElement;
  genres = ['action', 'comedy', 'crime', 'love', 'romance', 'drama', 'fiction'];
  languages = ['english', 'hausa', 'igbo', 'yoruba'];
  froms = ['youtube', 'ibaka', 'iroko', 'netflix', 'amazon', 'cinemas', 'default']
  types = ['Movie', 'Series', 'Short Film']
  years = new Array(20);
  today = moment().get('year')
  img;
  mov;
  seg = "add";

  constructor(private toastController: ToastController, private formBuilder: FormBuilder, private movie: MovieService, private nav: NavController, private loadingCtrl: LoadingController, private alertCtrl: AlertController, activatedRoute: ActivatedRoute, router: Router) { 
    activatedRoute.queryParams.subscribe(params => {
      if(router.getCurrentNavigation().extras.state) {
        this.mov = router.getCurrentNavigation().extras.state.data;
        this.seg = 'edit';
        this.editForm = this.formBuilder.group({
          year: [this.mov.details.year],
          trailer: [this.mov.details.trailer],
          genre: [this.mov.details.genre, Validators.compose([Validators.required])],
          type: [this.mov.details.type, Validators.compose([Validators.required])],
          from: [this.mov.details.from, Validators.compose([Validators.required])],
          title: [this.mov.details.title, Validators.compose([Validators.required])],
          description: [this.mov.details.description, Validators.compose([Validators.required])],
          link: [this.mov.details.link, Validators.compose([Validators.required])],
          cast: [this.mov.details.cast],
          producers: [this.mov.details.producers],
          language: [this.mov.details.language, Validators.compose([Validators.required])]
        });
      }
    });

    this.addForm = this.formBuilder.group({
      year: [''],
      trailer: [''],
      type: ['', Validators.compose([Validators.required])],
      genre: [[], Validators.compose([Validators.required])],
      from: [[], Validators.compose([Validators.required])],
      title: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])],
      link: ['', Validators.compose([Validators.required])],
      cast: [[]],
      producers: [[]],
      language: [[], Validators.compose([Validators.required])]
    });    

  }

  ngOnInit() {

  }

  add(form) {
    let added = Date.now().toString();
    this.movie.addMovie(form.year, form.genre, form.title, form.description, form.link, form.cast, form.producers, form.language, this.img, added, form.from, form.type, form.trailer);
  }

  update(form) {
    this.presentLoading('Updating Movie Details').then(()=>{
      firebase.firestore().doc(`/movies/${this.mov.id}`).update({
        title: form.title,
        link: form.link,
        cast: form.cast,
        producers: form.producers,
        description: form.description,
        language: form.language,
        from: form.from,
        genre: form.genre,
        year: form.year,
        trailer: form.trailer,
        type: form.type
      }).then(()=>{
        this.loading.dismiss();
        this.nav.navigateBack('admin/view').then(() => {        
          this.presentToast('Update Successful')
        })
      }).catch(()=>{
        this.loading.dismiss();
        alert("An Error Occurred")
      });
    })
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(message) {
    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'bubbles'
    });
    await this.loading.present();
  }
  
  async deleteMovie() {
    let id = this.mov.id;
    const alert = await this.alertCtrl.create({
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
            const storageRef = firebase.storage().ref(`/movies/${id}.png`);
            return storageRef.delete().then(()=>{
              firebase.firestore().collection('movies').doc(id).delete().then(()=> {
                // File deleted successfully
                const removeIndex = this.movie.movieList.map((itm) => {
                  return itm.id; }).indexOf(this.mov.id);
                  // remove object
                this.mov.movieList.splice(removeIndex, 1);
                this.nav.navigateBack('admin/view')
                this.presentToast("Movie successfully deleted!");
              }).catch(function(error) {
                this.presentToast("Error deleting Movie");
              });
            })
          }
        }
      ]
    });
  
    await alert.present();
  }

  uploadImage(){
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    }).then((res) => {
      this.img = null;
      this.img = res.base64String;
    }).catch((err) => {
      console.log(err)
      alert(err.message);
    })
  }

  
  uploadRealtime(){
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    }).then((res) => {
      this.presentLoading('Uploading Image').then(() => {
        const storageRef = firebase.storage().ref(`/${this.mov.id}.png`);
        return storageRef.putString(res.base64String, 'base64', { contentType: 'image/png' })
        .then(() => {
          return storageRef.getDownloadURL().then(downloadURL => {
            this.loading.dismiss()
            return  firebase.firestore().doc(`/users/${this.mov.id}`).update({ img: downloadURL });
          });
        }).catch((err) => {
          this.loading.dismiss()
          alert(err.message);
        });
      }).catch((err) => {
        this.loading.dismiss()
        console.log(err)
        alert(err.message);
      })
    })
  }

  async presentAlertPrompt(form) {
    const alert = await this.alertCtrl.create({
      header: 'Add a cast',
      inputs: [
        {
          name: 'castName',
          type: 'text',
          placeholder: 'Enter ' + form + ' name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Add',
          handler: (res) => {
            if (form == 'cast'){
              if(this.addForm.value.cast.indexOf(res.castName) == -1){
                this.addForm.value.cast.push(res.castName)
              }
            } else {
              if(this.addForm.value.cast.indexOf(res.castName) == -1){
                this.addForm.value.producers.push(res.castName)
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  remove(i, form) {
    if(form == 'cast'){
      if(this.seg == 'add') {
        this.addForm.value.cast.splice(i, 1)
      } else {
        this.editForm.value.cast.splice(i, 1)
      }
    } else {
      if(this.seg == 'add') {
        this.addForm.value.producers.splice(i, 1)
      } else {
        this.editForm.value.producers.splice(i, 1)
      }
    } 
  }
}
