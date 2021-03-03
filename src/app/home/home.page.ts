import { Component, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MovieService } from '../services/movie/movie.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  arr = [1,2,3,4,5];
  segment = "all";
  loader = true;
  @ViewChild('slider') private slider: any;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.originalParams = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { $, slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset$$1;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }
  
           $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;
  
           if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
          $slideEl
            .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
  
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      }
    }
  };
  searchArray = [];
  searchQ = '';
  public searchE = false;
  constructor(public movies: MovieService, private router: Router, private toastCtrl: ToastController ) {
    this.setErr();
  }

  open(movie) {
    const navExtra: NavigationExtras = {
      state: {
        data: movie
      }
    };
    this.router.navigate(['view'], navExtra);
  }

  doRefresh(event) {
    this.loader = true;
    this.movies.getMovies().then(() => {
      event.detail.complete();
    }).catch(async () => {
      const toast = await this.toastCtrl.create({
        message: 'An Error Occurred',
        duration: 2000
      });
      toast.present();
      event.detail.complete();
    })
    this.setErr();
  }

  
  setErr(){
    setTimeout(() => {
      if(this.movies.movieList.length == 0){
        this.loader = false
      }
    }, 10000)
  }

  getRate(votes, views) {
    let rating = (votes/views) * 5;
    if (rating >= 5 ) {
      return 5;
    } else {
      return rating
    }
  }

  searchM(q) {
    q = q.toLowerCase();
    this.searchArray = [];
    if(q) {
      this.searchE = true
      this.movies.movieList.forEach((item)=>{
        if(item.details.cast.length > 0){
            if(item.details.title.toLowerCase().includes(q) || item.details.cast.toString().toLowerCase().includes(q)) {
              this.searchArray.push(item);
            }
        } else {
          if(item.details.title.toLowerCase().includes(q)) {
            this.searchArray.push(item);
          }
        }
      })
    } else {
      this.searchE = false
    }
  }
  trunc(val) {
    return Math.trunc(val)
  }
}
