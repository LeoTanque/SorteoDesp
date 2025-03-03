import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Raffle } from '../interfaces/raffle';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RaffleService } from '../services/raffle.service';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { Participante } from '../interfaces/participante';
import { ParticipanteService } from '../services/participante.service';

@Component({
  selector: 'app-external-raffle',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, TagModule, DialogModule, TableModule, InputTextModule,
      FormsModule, ReactiveFormsModule, InputMaskModule],
  templateUrl: './external-raffle.component.html',
  styleUrl: './external-raffle.component.scss'
})
export class ExternalRaffleComponent implements OnInit{

  //raffle: Raffle | null = null;
  raffle: any = null;
  raffleId: any | null = null;
  responsiveOptions: any[] | undefined;
  visible: boolean = false;
  participantes: Participante[] = [];
  datosParticipantes: boolean = false;
  displayModal: boolean = false;
  reservationForm!: FormGroup;
  availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]
  numerosReservados: number[] = [];
  selectedNumber: number = 0;
  raffleCode: any;



  constructor(
    private route: ActivatedRoute,
    private rifaService: RaffleService,
    private fb: FormBuilder,
    private participanteService: ParticipanteService) {
      this.reservationForm = this.fb.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{6,8}$/)]],
        dni: ['', Validators.required],
       // code: ['', [Validators.required, this.validateRaffleCode.bind(this)]], // Validación correcta
        code: ['', Validators.required],
        reservedNumber: [{ value: '', disabled: true }, Validators.required]
      });
    }


  ngOnInit(): void {
    /*if (history.state && history.state.raffle) {
      this.raffle = history.state.raffle;
      this.raffleId = this.raffle?.id ?? null;
      this.raffleCode = this.raffle?.code ?? '';
      console.log('Rifa obtenida desde state:', this.raffle);
      console.log('Codigo de la rifa:', this.raffleCode);
    } else {

      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.raffleId = Number(idParam);
        this.cargarRifa(this.raffleId);
        this.raffleCode = this.raffle?.code ?? '';
        console.log('Codigo de la rifa:', this.raffleCode);
        if (this.raffle && this.raffle.cantidadParticipantes) {
          this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
        }
        this.loadParticipantes(this.raffleId);
      } else {
        console.error('No se encontró el ID de la rifa en la URL.');
      }
    }*/


      if (history.state && history.state.raffle) {
        this.raffle = history.state.raffle;
        this.raffleId = this.raffle?.id ?? null;
        this.raffleCode = this.raffle?.code ?? '';
        console.log('🎟️ Código de la rifa obtenido:', this.raffleCode);
        this.initializeForm(); // Ahora que tenemos los datos, inicializamos el formulario
      } else {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
          this.raffleId = Number(idParam);
          this.cargarRifa(this.raffleId).then(() => {
            this.initializeForm(); // Solo después de cargar la rifa, se inicializa el formulario
            if (this.raffle && this.raffle.cantidadParticipantes) {
              this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
            }
            this.loadParticipantes(this.raffleId);
          });
        } else {
          console.error('No se encontró el ID de la rifa en la URL.');
        }
      }



    this.responsiveOptions = [
      {
          breakpoint: '1400px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '1220px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '1100px',
          numVisible: 1,
          numScroll: 1
      }


  ];

  }




  // Validador personalizado para el código de la rifa
  validateRaffleCode(control: AbstractControl): ValidationErrors | null {
    console.log('🔍 Código ingresado por el usuario:', control.value);
    console.log('✅ Código esperado:', this.raffleCode);
    return control.value === this.raffleCode ? null : { incorrectCode: true };
  }


  // Método para verificar si un campo es inválido y fue tocado o modificado
isInvalid(field: string): boolean {
  const control = this.reservationForm.get(field);
  return control?.invalid && (control.dirty || control.touched) || false;
}



  cargarRifa1(id: number): void {
    this.rifaService.obtenerRifaPorId(id).subscribe({
      next: (data) => {
        this.raffle = data;
        console.log('Datos de la rifa cargada:', this.raffle);
        this.raffleCode = this.raffle?.code ?? '';
        console.log('Codigo de la rifa:', this.raffleCode);
        if (this.raffle && this.raffle.cantidadParticipantes) {
          this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
        }

      },
      error: (err) => console.error('Error al cargar la rifa:', err)
    });
  }


  async cargarRifa(id: number) {
    try {
      const response = await this.rifaService.obtenerRifaPorId(id).toPromise();
      this.raffle = response;
      console.log('Datos de la rifa cargada:', this.raffle);
      this.raffleCode = this.raffle?.code ?? '';
      console.log('🎟️ Código de la rifa cargado:', this.raffleCode);
      if (this.raffle && this.raffle.cantidadParticipantes) {
        this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
      }
    } catch (error) {
      console.error('❌ Error al cargar la rifa:', error);
    }
  }

  initializeForm1() {
    this.reservationForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{6,8}$/)]],
      dni: ['', Validators.required],
      code: ['', [Validators.required, this.validateRaffleCode.bind(this)]], // Validación correcta
      reservedNumber: [{ value: '', disabled: true }, Validators.required]
    });
  }

  initializeForm() {
    this.reservationForm.get('code')?.setValidators([
      Validators.required,
      this.validateRaffleCode.bind(this)
    ]);
    this.reservationForm.get('code')?.updateValueAndValidity();
  }


  showDialog() {
    this.visible = true;
    }

    mostrarDatosP(){
      this.datosParticipantes = true;
    }


    openModal(number: number) {
      this.selectedNumber = number;
      this.displayModal = true;

      this.reservationForm.patchValue({
        reservedNumber: number
      });
    }



    loadParticipantes(raffleId: number) {
      // Limpia los arrays antes de cargar los participantes para la rifa actual
      this.participantes = [];
      this.numerosReservados = [];
      this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
        next: (data) => {
          this.participantes = data;
          // Extraer solo los números reservados válidos
          this.numerosReservados = this.participantes
            .filter(p => p.reservedNumber !== null)
            .map(p => p.reservedNumber);
          console.log('Participantes para la rifa', raffleId, ':', this.participantes);
          console.log('Números reservados:', this.numerosReservados);
        },
        error: (err) => console.error('Error al cargar participantes:', err)
      });
    }


    saveData() {
      if (this.reservationForm.valid) {
        // Crea el objeto de reserva e incluye el id de la rifa
        const newReservation: Participante = {
          ...this.reservationForm.getRawValue(),
          raffleId: this.raffleId // Asigna el id obtenido de la URL
        };
        this.participanteService.createParticipante(newReservation).subscribe({
          next: (data) => {
            console.log('✅ Datos enviados:', data);
            // Actualiza la lista de participantes para esta rifa
            this.loadParticipantes(Number(this.raffleId));
            this.reservationForm.reset();
            this.displayModal = false;
          },
          error: (err) => console.error('Error al enviar datos al API:', err)
        });
      }
    }

    closeModal() {
      this.reservationForm.reset(); // 🔄 Resetea el formulario al cerrar sin enviar
      this.displayModal = false;
    }

    isReserved(num: number): boolean {
      return this.numerosReservados.includes(num);
    }
}
