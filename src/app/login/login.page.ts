import { AuthGuard } from '../services/auth-guard/auth.guard';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NavController, LoadingController, AlertController, MenuController} from '@ionic/angular';
import * as moment from 'moment';
import { FirebaseService } from '../services/firebase/firebase.service'
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins
const TOKEN_KEY = 'myplug-auth-token';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @Input() segment: string;
  dt = moment().year() - 18;
  login = 'log';
  public loginForm: FormGroup;
  public signupForm: FormGroup;
  public resetPasswordForm: FormGroup;
  loading: HTMLIonLoadingElement;

  constructor(public loadingCtrl: LoadingController, private nav: NavController, private formBuilder: FormBuilder, private alertCtrl: AlertController, private firebase: FirebaseService, private auth: AuthGuard, menu: MenuController) {
    menu.enable(false);
    this.signupForm = this.formBuilder.group({
      fname: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      surname: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z ]*')])],
      phone: ['', Validators.compose([Validators.required, Validators.pattern('[+*0-9 ]*')])],
      dob: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      conPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });

    this.resetPasswordForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });

    Storage.get({key: TOKEN_KEY}).then(async (token) => {
      if (token.value) {
        const res = JSON.parse(token.value);
        this.loginForm.value.email =  res.email, 
        this.loginForm.value.password = res.password
      }
    });
  }

  ngOnInit() {
  }

  async loginUser(email, password): Promise<void> {
    this.presentLoading('Logging in').then(() => {
      this.firebase.login(email, password).then(() => {
        setTimeout(() => {
          this.firebase.getUserProfile().then((data) => {
            this.auth.authenticated = true;
            if (data.isAdmin) {
              this.nav.navigateRoot(['admin']);                
                const obj = {
                  email,
                  password
                };
                Storage.set({key: TOKEN_KEY, value: JSON.stringify(obj)});
            } else {              
              const obj = {
                email,
                password
              };
              Storage.set({key: TOKEN_KEY, value: JSON.stringify(obj)});
              this.nav.navigateRoot(['tabs/home']);
            }
            this.loading.dismiss();
          }).catch(err => {
            this.loading.dismiss().then(async () => {
              const alert = await this.alertCtrl.create({
                message: err.message,
                buttons: [{ text: 'Ok' }],
              });
              await alert.present();
            });
          });
        }, 500);
      }).catch((err) => {
        this.loading.dismiss().then(async () => {
          const alert = await this.alertCtrl.create({
            message: err.message,
            buttons: [{ text: 'Ok' }],
          });
          await alert.present();
        });
      })
    })
  }

  async signupUser(signupForm: FormGroup): Promise<void> {
    this.presentLoading('Signing up User').then(() => {
      this.firebase.signup(signupForm.value.email, signupForm.value.password,
        signupForm.value.fname, signupForm.value.surname, signupForm.value.phone, signupForm.value.dob)
      .then(() => {
          this.loading.dismiss();
          this.segment = 'success';
      }).catch((error) => {
        this.loading.dismiss().then(async () => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{ text: 'Ok' }],
          });
          await alert.present();
        });
      });
    })

  }

  resetPassword(resetPasswordForm: FormGroup): void {
  }

  async presentLoading(message, duration?) {
    this.loading = await this.loadingCtrl.create({
      message,
      duration: duration? duration : 15000,
      spinner: 'bubbles'
    });
    await this.loading.present();
  }

}
