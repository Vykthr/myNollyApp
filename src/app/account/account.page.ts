import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { FirebaseService } from '../services/firebase/firebase.service';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss']
})
export class AccountPage {
  constructor(private nav: NavController, public profile: FirebaseService, private alertCtrl: AlertController) {}

  open() {
    this.nav.navigateForward('about');
  }

  edit() {
    this.nav.navigateForward('tabs/account/edit')
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Okay',
          handler: () => {
            this.profile.logout();
          }
        }
      ]
    });
    await alert.present();
  }
  

}
