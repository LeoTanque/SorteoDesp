import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { Raffle } from '../interfaces/raffle';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {

  private baseUrl = 'http://localhost:8080/api/images';
  //private baseUrl = ' https://c5b7-149-22-84-137.ngrok-free.app/api/images';

  private apiUrl = 'http://localhost:8080/api/rifas';
  //private apiUrl = ' https://c5b7-149-22-84-137.ngrok-free.app/api/rifas';

  private VIPUrl ='http://localhost:8080/codigos-vip'

 // private VIPUrl =' https://c5b7-149-22-84-137.ngrok-free.app/codigos-vip';

  constructor(private http: HttpClient) { }



  getAllRaffles(): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(this.apiUrl);
  }



  // Obtener rifas por usuario
  getRafflesByUser(userId: number): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(`${this.apiUrl}/usuario/${userId}`);
  }




    crearRifa(rifa: Raffle): Observable<any> {
      const url = this.apiUrl;
      console.log('URL de la petición:', url);
      return this.http.post<any>(url, rifa).pipe(
        catchError((error) => this.handleError(error))
      );
    }


    // Crear rifa con código VIP
    crearRifaConCodigoVip(rifa: Raffle, codigoVip: string): Observable<any> {
      const params = new HttpParams().set('codigoVip', codigoVip);
      const url = `${this.apiUrl}?codigoVip=${codigoVip}`;
      console.log('URL de la petición con código VIP:', url);
      return this.http.post<any>(url, rifa).pipe(
        catchError((error) => this.handleError(error))
      );
    }

    obtenerCodigosVip(): Observable<any[]> {
      return this.http.get<any[]>(this.VIPUrl)
        .pipe(catchError(this.handleError));
    }




  updateRaffle(id: number, raffle: Raffle): Observable<Raffle> {
    return this.http.put<Raffle>(`${this.apiUrl}/${id}`, raffle, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  generarImagenRifa(rifaId: number): Observable<string> {
    const url = `${this.baseUrl}/generar/${rifaId}`; // Asegúrate de que el backend tenga este endpoint
    return this.http.get<{ url: string }>(url).pipe(
      map(response => response.url),
      catchError((error) => {
        console.error('Error al generar la imagen:', error);
        return throwError(() => new Error('Error al generar la imagen de la rifa'));
      })
    );
  }




  // Método para eliminar una rifa
  deleteRaffle(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }





  deleteImage(fileName: string): Observable<void> {
    const url = `http://localhost:8080/api/images/${fileName}`;
    return this.http.delete<void>(url);
  }



  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  uploadImages(files: File[]): Observable<string[]> {

    const formData = new FormData();
     files.forEach((file) => {
    formData.append('files', file, file.name); // 'files' debe coincidir con el nombre en el backend
   });

   return this.http.post<{ urls: string[] }>(`${this.baseUrl}/upload`, formData).pipe(
  map(response => response.urls),
  catchError((error) => {
    console.error('Error en la carga de imágenes:', error);
    return throwError(() => new Error('Error al subir las imágenes'));
  })
);

  }






  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 400 || error.status === 409) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Error en el servicio:', errorMessage);
    return throwError(() => errorMessage); // Lanzamos solo el mensaje de error, no un objeto Error
  }



  obtenerRifaPorId(id: number): Observable<Raffle> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Raffle>(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }


}
