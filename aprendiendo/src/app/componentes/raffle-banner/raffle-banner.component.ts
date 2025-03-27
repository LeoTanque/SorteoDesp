import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { Raffle } from '../../interfaces/raffle';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-raffle-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: './raffle-banner.component.html',
  styleUrl: './raffle-banner.component.scss'
})
export class RaffleBannerComponent  implements AfterViewInit{

  @Input() raffle!: any;

 // @ViewChild('banner') banner!: ElementRef;
  @ViewChild('banner', { static: false }) banner!: ElementRef;
  // La imagen generada (dataURL) se puede usar para mostrar una vista previa o descargarla

  imageDataUrl: string | null = null;
  displayModal: boolean = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.captureBanner(), 2000);
  }

  captureBanner(): void {
    html2canvas(this.banner.nativeElement, {
      allowTaint: true,
      useCORS: true
    })
    .then(canvas => {
      this.imageDataUrl = canvas.toDataURL('image/png');
      console.log('Banner capturado:', this.imageDataUrl);
    })
    .catch(error => {
      console.error('Error capturando el banner:', error);
    });
  }

  captureBannerx(): void {
    if (!this.banner || !this.banner.nativeElement) {
      console.error('Error: Elemento banner no encontrado');
      return;
    }

    // Asegurar que todas las imágenes tengan CORS habilitado
    const imgs = this.banner.nativeElement.getElementsByTagName('img');
    for (let img of imgs) {
      img.crossOrigin = "anonymous";
    }

    html2canvas(this.banner.nativeElement, {
      allowTaint: true,
      useCORS: true,
      foreignObjectRendering: true
    })
      .then(canvas => {
        this.imageDataUrl = canvas.toDataURL('image/png');
        console.log('Banner capturado:', this.imageDataUrl);
      })
      .catch(error => {
        console.error('Error capturando el banner:', error);
      });
  }

  captureBanner1(): void {
    setTimeout(() => {
      if (!this.banner || !this.banner.nativeElement) {
        console.error('Error: Elemento banner no encontrado');
        return;
      }

      // Aseguramos un fondo blanco en el contenedor del banner
      this.banner.nativeElement.style.backgroundColor = '#ffffff';

      // Aseguramos que las imágenes tengan CORS habilitado
      const imgs = this.banner.nativeElement.getElementsByTagName('img');
      for (let img of imgs) {
        img.crossOrigin = "anonymous";
      }

      html2canvas(this.banner.nativeElement, {
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true,
        backgroundColor: "#ffffff" // Fuerza un fondo blanco en la captura
      })
      .then(canvas => {
        this.imageDataUrl = canvas.toDataURL('image/png');
        console.log('Banner capturado:', this.imageDataUrl);
      })
      .catch(error => {
        console.error('Error capturando el banner:', error);
      });
    }, 500);
  }


  openBanner(): void {
    this.displayModal = true;

    setTimeout(() => {
      if (this.banner) {
        this.captureBanner();
      }
    }, 500);
  }

  // Método para capturar la imagen del banner



  getCornerClass1(index: number): string {
    // Asigna clases para 4 imágenes; si hay más, puedes decidir cómo manejarlas.
    switch (index) {
      case 0: return 'top-left';
      case 1: return 'top-right';
      case 2: return 'bottom-left';
      case 3: return 'bottom-right';
      default: return ''; // O asigna una clase por defecto
    }


  }

getCornerClass(index: number): string {
  switch (index) {
    case 0:
      return 'top-right';
    case 1:
      return 'top-left';
    case 2:
      return 'bottom-left';
    case 3:
      return 'bottom-right';
    default:
      return '';
  }
}



  downloadImage1(): void {
    if (this.imageDataUrl) {
      const link = document.createElement('a');
      link.href = this.imageDataUrl;
      link.download = 'raffle-banner.png'; // Nombre del archivo a descargar
      link.click();
    } else {
      console.error('No hay imagen para descargar.');
    }
  }

  downloadImage(): void {
    if (!this.imageDataUrl) {
      console.error('No hay imagen disponible para descargar');
      return;
    }

    const link = document.createElement('a');
    link.href = this.imageDataUrl;
    link.download = 'raffle-banner.png';
    link.click();
  }

  downloadImage0(): void {
    if (this.imageDataUrl) {
      const link = document.createElement('a');
      link.href = this.imageDataUrl;
      link.download = 'raffle-banner.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('No hay imagen disponible para descargar');
    }
  }

}
