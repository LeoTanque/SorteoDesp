import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participante } from '../interfaces/participante';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {
  private apiUrl = 'http://localhost:8080/api/participantes';
  //private apiUrl = ' https://c5b7-149-22-84-137.ngrok-free.app/api/participantes'

  private participantsSubject = new BehaviorSubject<Participante[]>([]);
  participants$ = this.participantsSubject.asObservable();
  constructor(private http: HttpClient) {
   // this.refreshParticipants();
  }

  getAllParticipantes(): Observable<Participante[]> {
    return this.http.get<Participante[]>(this.apiUrl);
  }



    // Método para obtener participantes de una rifa específica
    getParticipantesByRaffleId(raffleId: number): Observable<Participante[]> {
      return this.http.get<Participante[]>(`${this.apiUrl}/raffle/${raffleId}`);
    }

    getParticipantesByRaffleId1(raffleId: number): Observable<Participante[]> {
      return this.getAllParticipantes().pipe(
        // Filtramos localmente la lista compartida
        map((participantes: Participante[]) => participantes.filter(p => p.raffleId === raffleId))
      );
    }


 // Método POST para crear un nuevo participante
 createParticipante(participante: Participante): Observable<Participante> {
  return this.http.post<Participante>(this.apiUrl, participante);
}

  // Crear y, tras ello, refrezcar la lista
  createParticipante0(participante: Participante): Observable<Participante> {
    return this.http.post<Participante>(this.apiUrl, participante).pipe(
      tap(() => this.refreshParticipants())
    );
  }

 // Método POST para crear un nuevo participante, actualizando el BehaviorSubject
 createParticipante1(participante: Participante): Observable<Participante> {
  return this.http.post<Participante>(this.apiUrl, participante).pipe(
    tap((newParticipant) => {
      const current = this.participantsSubject.getValue();
      this.participantsSubject.next([...current, newParticipant]);
    })
  );
}

  // Método DELETE para eliminar un participante
  deleteParticipante(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  deleteParticipante1(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const current = this.participantsSubject.getValue();
        this.participantsSubject.next(current.filter(p => p.id !== id));
      })
    );
  }



   // Si lo necesitas, puedes agregar métodos para actualizar o recargar la lista desde el backend
   refreshParticipants1(): void {
    this.http.get<Participante[]>(this.apiUrl).subscribe({
      next: (data) => this.participantsSubject.next(data),
      error: (err) => console.error('Error al refrescar participantes:', err)
    });
  }

    refreshParticipants(): void {
    this.http.get<Participante[]>(this.apiUrl).subscribe({
      next: all => this.participantsSubject.next(all),
      error: err => console.error('Error refrescando participantes:', err)
    });
  }

}
