import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participante } from '../interfaces/participante';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {
  private apiUrl = 'http://localhost:8080/api/participantes';

  constructor(private http: HttpClient) { }

  getAllParticipantes(): Observable<Participante[]> {
    return this.http.get<Participante[]>(this.apiUrl);
  }

    // Método para obtener participantes de una rifa específica
    getParticipantesByRaffleId(raffleId: number): Observable<Participante[]> {
      return this.http.get<Participante[]>(`${this.apiUrl}/raffle/${raffleId}`);
    }



 // Método POST para crear un nuevo participante
 createParticipante(participante: Participante): Observable<Participante> {
  return this.http.post<Participante>(this.apiUrl, participante);
}

}
