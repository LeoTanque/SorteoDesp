import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class RaffleExecutionService {

  private countdownSubject = new BehaviorSubject<number | null>(null);
  countdown$ = this.countdownSubject.asObservable();


  startCountdown(start: number = 5): void {
    interval(1000).pipe(take(start + 1)).subscribe(val => {
      const currentCount = start - val;
      this.countdownSubject.next(currentCount);
      // Actualiza localStorage para que otros instancias lo capturen
      localStorage.setItem('countdown', currentCount.toString());
      if (currentCount === 0) {
        // Después de un tiempo, limpia el contador
        setTimeout(() => {
          this.countdownSubject.next(null);
          localStorage.removeItem('countdown');
        }, 1000);
      }
    });
  }

  // Resetea el contador (lo desactiva)
  resetCountdown(): void {
    this.countdownSubject.next(null);
    localStorage.removeItem('countdown');
  }
}
