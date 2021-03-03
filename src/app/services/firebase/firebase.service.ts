import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { AuthGuard } from '../auth-guard/auth.guard';
const { Storage, Camera } = Plugins;

const firebaseConfig = {
  apiKey: "AIzaSyAxnvBRSsx5bW1IVf5YTWgR0cb7bUkg7vw",
  authDomain: "mynollyapp-39d23.firebaseapp.com",
  databaseURL: "https://mynollyapp-39d23.firebaseio.com",
  projectId: "mynollyapp-39d23",
  storageBucket: "mynollyapp-39d23.appspot.com",
  messagingSenderId: "204569611961",
  appId: "1:204569611961:web:cadebe4ab0778cb84d1568",
  measurementId: "G-G3KBSG41XM"
};
const TOKEN_KEY = 'myplug-auth-token';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public userProfile: firebase.firestore.DocumentReference;
  public currentUser: firebase.User;
  public userDetails;
  providersList = [];
  loading: HTMLIonLoadingElement;
  img;

  constructor( private router: Router, private nav: NavController, private auth: AuthGuard, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = firebase.firestore().doc(`/users/${user.uid}`);
      }
    });
    this.autoLogin();
  }

  
  autoLogin() {
    Storage.get({key: TOKEN_KEY}).then(async (token) => {
      if (token.value) {
        const res = JSON.parse(token.value);
        await this.presentToast('Logging in ' + res.email, 'Auto Login');
        this.login(res.email, res.password).then(async() => {
          this.getUserProfile().then((data) => {
            if (data) {
              this.auth.authenticated = true;
              if (data.isAdmin) {
                this.nav.navigateRoot('admin');
              } else if (window.location.pathname == 'login') {
                this.nav.navigateRoot('tabs/home');
              }
            }
          });
        }).catch(() => {
          setTimeout(() => {
            this.presentToast('Unable to login ' + res.email, 'Auto Login Failed');
          }, 5000);
        });
      }
    });
  }

  login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  verify() {
    firebase.auth().currentUser.sendEmailVerification();
  }

  signup(email: string, password: string, fname: string, surname: string, phone: string, dob): Promise<any> {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((newUserCredential: firebase.auth.UserCredential) => {
        firebase.firestore().doc(`/users/${newUserCredential.user.uid}`).set(
          {firstName: fname, surname, phone, email, dob, views: [], votes: []}).then(() => {
            firebase.auth().currentUser.sendEmailVerification();
          })
      .catch(error => {
        console.error(error);
        throw new Error(error);
      });
    });
  }

  logout(): Promise<void> {
    Storage.remove({key: TOKEN_KEY}).then(() => {
      this.auth.authenticated = false;
      this.auth.profileType = 'user';
      this.nav.navigateRoot('')
    });
    return firebase.auth().signOut();
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  getUserProfile(): Promise<any> {
    return new Promise((resolve, reject) => {
      firebase.firestore().doc(`/users/${this.currentUser.uid}`).onSnapshot(userProfileSnapshot => {
        this.userDetails = userProfileSnapshot.data() as any;
        resolve(this.userDetails);
      })
    });
  }

  updateName(surname: string, firstName: string): Promise<any> {
    return this.userProfile.update({ surname, firstName });
  }

  updateDetails(form): Promise<any> {
    return this.userProfile.update({
      firstName: form.firstName,
      surname: form.surname,
      phone: form.phone,
      dob: form.dob
    });
  }

  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      password
    );

    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updateEmail(newEmail).then(() => {
          firebase.firestore().doc(`/${this.auth.profileType}s/${this.currentUser.uid}`).update({ email: newEmail });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );

    return this.currentUser
      .reauthenticateWithCredential(credential)
      .then(() => {
        this.currentUser.updatePassword(newPassword).then(() => {
          Storage.set({
            key: 'myplug-auth-token',
            value: JSON.stringify({email: this.currentUser.email, password: newPassword, profileType: this.auth.profileType})
          });
        })
      .catch(error => {
        alert('Failed to Update Password');
      });
    });
  }
  
  uploadRealtime(){
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    }).then((res) => {
      this.presentLoading('Uploading Image').then(() => {
        const storageRef = firebase.storage().ref(`/${this.currentUser.uid}.png`);
        return storageRef.putString(res.base64String, 'base64', { contentType: 'image/png' })
        .then(() => {
          return storageRef.getDownloadURL().then(downloadURL => {
            this.loading.dismiss()
            return  firebase.firestore().doc(`/users/${this.currentUser.uid}`).update({ img: downloadURL });
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

  async presentToast(message, header?) {
    const toast = await this.toastCtrl.create({
      message,
      header,
      duration: 2000
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


}
