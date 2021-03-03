import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  text = 'myNollyApp';
  img = 'assets/icon.png';
  link ='#';

  constructor(private actionSheetCtrl: ActionSheetController, private socialSharing: SocialSharing) { }

  ngOnInit() {
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Share myNollyApp',
      buttons: [
        {
          text: 'Link',
          icon: 'share-social',
          handler: () => {
            this.socialSharing.share(this.text, 'MEDIUM', null, this.link)
          }
        },
        {
          text: 'Email',
          icon: 'mail',
          handler: () => {
            this.socialSharing.shareViaEmail('text', 'subject', ['email@address.com'])
          }
        },
        {
          text: 'WhatsApp',
          icon: 'logo-whatsapp',
          handler: () => {
            this.socialSharing.shareViaWhatsApp(this.text, this.img, this.link)
          }
        },
        {
          text: 'Facebook',
          icon: 'logo-facebook',
          handler: () => {
            this.socialSharing.shareViaFacebookWithPasteMessageHint(this.text, this.img, null /* url */)
  
          }
        },
        {
          text: 'Instagram',
          icon: 'logo-instagram',
          handler: () => {
            this.socialSharing.shareViaInstagram(this.text, this.img)
          }
        },
        {
          text: 'Twitter',
          icon: 'logo-twitter',
          handler: () => {
            this.socialSharing.shareViaTwitter(this.text, this.img, this.link)
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
  
    await actionSheet.present();
  }

}
