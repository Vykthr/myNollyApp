import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import * as moment from 'moment';
const { Camera } = Plugins;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  public updateForm: FormGroup;
  img;
  loading: HTMLIonLoadingElement;
  max = moment().year() - 18;
  constructor(public profile: FirebaseService, private formBuilder: FormBuilder, private toastCtrl: ToastController, private loadingCtrl: LoadingController, private nav: NavController) {
    let data = this.profile.userDetails;
    this.updateForm = this.formBuilder.group({
      firstName: [data?.firstName, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      surname: [data?.surname, Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      phone: [data?.phone, Validators.compose([Validators.required, Validators.pattern('[+*0-9 ]*')])],
      dob: [data?.dob, Validators.compose([Validators.required])],
    });

   }

  ngOnInit() {
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

  async presentToast(message, duration?, header?) {
    const toast = await this.toastCtrl.create({
      message,
      header,
      duration: duration? duration : 2000
    });
    toast.present();
  }

  async update(form) {
    this.presentLoading()
    this.profile.updateDetails(form.value).then(() => {
      this.loading.dismiss();
      this.nav.navigateRoot('tabs/account');
    })
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Updating Profile',
      duration: 2000,
      spinner: 'bubbles'
    });
    await this.loading.present();
  }
}
