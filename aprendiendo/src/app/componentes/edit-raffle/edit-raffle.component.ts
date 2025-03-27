import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Raffle } from '../../interfaces/raffle';
import { ActivatedRoute, Router } from '@angular/router';
import { RaffleService } from '../../services/raffle.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-edit-raffle',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './edit-raffle.component.html',
  styleUrl: './edit-raffle.component.scss',
  providers: [MessageService],
})
export class EditRaffleComponent  implements OnInit{
  raffle!: Raffle;
  raffleId!: number;
  loading: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private raffleService: RaffleService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {

 // Obtén el id de la rifa de la URL (ej: /edit-raffle/123)
 const idParam = this.route.snapshot.paramMap.get('id');
 if (idParam) {
   this.raffleId = +idParam;
   this.loadRaffle();
 } else {
   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se recibió el ID de la rifa' });
   this.router.navigate(['/dashboard']);
 }

  }


  loadRaffle(): void {
    this.raffleService.obtenerRifaPorId(this.raffleId).subscribe({
      next: (data: Raffle) => {
        this.raffle = data;
        console.log('data', data)
      },
      error: (error) => {
        console.error('Error al cargar la rifa:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la rifa' });
        this.router.navigate(['/dashboard']);
      }
    });
  }


  onSubmit(): void {
    if (!this.raffle) {
      return;
    }
    this.loading = true;
    this.raffleService.updateRaffle(this.raffleId, this.raffle).subscribe({
      next: (updatedRaffle: Raffle) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rifa actualizada correctamente' });
        // Al actualizar, redirige al dashboard para actualizar la grid
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error al actualizar la rifa:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la rifa' });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
