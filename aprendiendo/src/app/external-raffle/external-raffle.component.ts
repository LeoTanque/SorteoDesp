import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Raffle } from '../interfaces/raffle';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import Swal from 'sweetalert2';
import { CountdownComponent } from "../componentes/countdown/countdown.component";
import { RaffleExecutionService } from '../services/raffle-execution.service';
import { Subscription } from 'rxjs';
import { ConfettiComponent } from "../componentes/confetti/confetti.component";



@Component({
  selector: 'app-external-raffle',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule, ButtonModule, TagModule, DialogModule, TableModule, InputTextModule,
    FormsModule, ReactiveFormsModule, InputMaskModule, CountdownComponent, ConfettiComponent],
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
  info:boolean = false;
  displayModal: boolean = false;
  reservationForm!: FormGroup;
  availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]
  numerosReservados: number[] = [];
  selectedNumber: number = 0;
  raffleCode: any;
  private storageListener = this.onStorageEvent.bind(this);
  showCountdown: boolean = false;
  countdownValue: number | null = null;
  winningNumber: number | null = null;
  winningParticipant: string | null = null;
  winningData: { raffleId: number; winningNumber: number; winningParticipant: string }[] = [];



  winningRaffleId: number | null = null;
  showConfetti = false;

  private subscription!: Subscription;
  constructor(
    private route: ActivatedRoute,
    private rifaService: RaffleService,
    private fb: FormBuilder, private router:Router,
    private raffleExecutionService: RaffleExecutionService,
    private participanteService: ParticipanteService) {
      this.reservationForm = this.fb.group({
        name: ['', Validators.required],
        lastName: ['', Validators.required],
        //phone: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{6,8}$/)]],
        phone: ['', [
          Validators.required,
          Validators.pattern(/^\+54 9 \d{2} \d{4}-\d{4}$/)
        ]],
        //dni: ['', Validators.required],
       // code: ['', [Validators.required, this.validateRaffleCode.bind(this)]], // Validación correcta
        code: ['', Validators.required],
        reservedNumber: [{ value: '', disabled: true }, Validators.required]
      });
    }


  ngOnInit(): void {
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

            this.loadParticipantes(this.raffleId);
           // this.loadParticipantesPorRifa(this.raffleId)
          });
        } else {
          console.error('No se encontró el ID de la rifa en la URL.');
        }
      }



      this.subscription = this.raffleExecutionService.countdown$.subscribe(value => {
        this.countdownValue = value;
        this.showCountdown = value !== null;
        console.log('Contador recibido por servicio:', value);

        // ⏱️ Cuando el servicio llegue a cero, dispara el resultado aquí
        if (value === 0) {
          this.onCountdownFinishedExternal();
        }
      });


  window.addEventListener('storage', this.onStorageEvent.bind(this));


  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'winningData') {
      console.log('storage event → winningData:', event.newValue);
      this.loadWinningInfo();
    }
  });


      this.loadWinningInfo();




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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    window.removeEventListener('storage', this.storageListener);
  }



  private onStorageEvent(event: StorageEvent): void {
    if (event.key === 'countdown') {
      const newValue = event.newValue;
      if (newValue !== null) {
        this.countdownValue = parseInt(newValue, 10);
        this.showCountdown = true;
      } else {
        this.showCountdown = false;
      }
      console.log('Contador actualizado desde localStorage:', event.newValue);
    }
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




  async cargarRifa(id: number) {
    try {
      const response = await this.rifaService.obtenerRifaPorId(id).toPromise();
      this.raffle = response;
      console.log('Datos de la rifa cargada:', this.raffle);
      console.log('Teléfono del admin:', this.raffle.usuario.telefono);
      this.raffleCode = this.raffle?.code || '';

      const totalParticipantes = this.raffle && this.raffle.cantidadParticipantes

        ? parseInt(this.raffle.cantidadParticipantes, 10)
        : 10;
      // Actualizamos availableNumbers de 1 hasta totalParticipantes:
      this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
      console.log('Números disponibles:', this.availableNumbers);
    } catch (error) {
      console.error('❌ Error al cargar la rifa:', error);
    }
  }

  async cargarRifa0(id: number) {
    try {
      const response = await this.rifaService.obtenerRifaPorId(id).toPromise();
      this.raffle = response;
      this.raffleCode = this.raffle.code;
      this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
      console.log('Datos de la rifa cargada:', this.raffle);
    } catch (error) {
      console.error('Error al cargar la rifa:', error);
    }
  }


  loadRaffle(): void {
    if (this.raffleId !== null) {
      this.rifaService.obtenerRifaPorId(this.raffleId).subscribe({
        next: (data: Raffle) => {
          this.raffle = data;
          console.log('🎟️ Código de la rifa obtenido:', data);
          if (this.raffle && this.raffle.cantidadParticipantes) {
            this.availableNumbers = Array.from({ length: this.raffle.cantidadParticipantes }, (_, i) => i + 1);
          }
        },
        error: (error) => {
          console.error('Error al cargar la rifa:', error);
        }
      });
    }
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

    showInfo() {
      this.info = true
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

    loadParticipantesPorRifa(raffleId: number): void {
      // Si prefieres filtrar sobre la lista compartida:
      this.participanteService.getAllParticipantes().subscribe({
        next: (data) => {
          this.participantes = data.filter(p => p.raffleId === raffleId);
          console.log(`Participantes para la rifa ${raffleId}:`, this.participantes);
          this.numerosReservados = this.participantes
          .filter(p => p.reservedNumber !== null)
          .map(p => p.reservedNumber);
        console.log('Participantes para la rifa', raffleId, ':', this.participantes);
        console.log('Números reservados:', this.numerosReservados);
        },
        error: (err) => console.error(`Error al cargar participantes para la rifa ${raffleId}:`, err)
      });
    }




    saveData(): void {
      if (this.reservationForm.valid) {
        const newReservation: Participante = {
          ...this.reservationForm.getRawValue(),
          raffleId: this.raffleId  // Asigna el id obtenido de la URL
        };

        this.participanteService.createParticipante(newReservation).subscribe({
          next: (data) => {
            console.log('✅ Datos enviados:', data);
            this.loadParticipantes(Number(this.raffleId));
            this.reservationForm.reset();
            this.displayModal = false;
            Swal.fire({
              icon: 'success',
              title: '¡Reserva exitosa!',
              text: 'Tu número ha sido reservado correctamente.',
              confirmButtonText: 'Aceptar'
            });
            localStorage.setItem('participantsUpdated', Date.now().toString());
          },
          error: (err) => {
            console.error('Error al enviar datos al API:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo reservar el número. Por favor, inténtalo de nuevo.',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Formulario inválido',
          text: 'Por favor, completa todos los campos requeridos.',
          confirmButtonText: 'Aceptar'
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





onCountdownFinishedExternal(): void {
  // Recupera la información ganadora del localStorage
  const storedData = localStorage.getItem('winningData');
  if (!storedData) {
    console.log('No se encontró información de ganadores en localStorage.');
    return;
  }

  let winningDataArray: any[];
  try {
    winningDataArray = JSON.parse(storedData);
  } catch {
    console.error('Error al parsear winningData:', storedData);
    return;
  }

  this.winningData = winningDataArray;
  const currentWinner = this.getWinningEntry(this.raffle?.id);
  if (!currentWinner) {
    console.log('No hay información de ganador para esta rifa.');
    return;
  }

  const { winningNumber, winningParticipant } = currentWinner;
  this.winningNumber = winningNumber;
  this.winningParticipant = winningParticipant;
  console.log('Número ganador en ExternalRaffleComponent:', winningNumber);
  console.log('Ganador:', winningParticipant);

  // Comprueba si el ganador está reservado
  const isReserved = this.participantes.some(
    p => p.raffleId === this.raffle?.id && p.reservedNumber === winningNumber
  );

  if (isReserved) {
    // —————— GANADOR VÁLIDO ——————
    // Muestra Confetti
    this.showConfetti = true;
    // Desactiva confetti tras 3 segundos (puedes ajustar)
    setTimeout(() => this.showConfetti = false, 3000);

    Swal.fire({
      title: '¡Sorteo Ejecutado!',
      text: `El número ganador es ${winningNumber}. Ganador: ${winningParticipant}.`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  } else {
    // —————— SIN PARTICIPANTE PARA ESE NÚMERO ——————
    Swal.fire({
      title: 'Sorteo sin ganador',
      text: `El número ganador es ${winningNumber}, pero no ha sido reservado por ningún participante. La rifa sigue activa.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }
}





loadWinningInfo(): void {
  const storedData = localStorage.getItem('winningData');
  let data: any[] = [];
  if (storedData) {
    try {
      data = JSON.parse(storedData);
      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (error) {
      console.error('Error al parsear winningData:', error);
      data = [];
    }
  }
  this.winningData = data;
  console.log('Información de ganadores cargada:', this.winningData);
  // Si la rifa actual tiene una entrada ganadora, actualiza las propiedades locales
  if (this.raffle && this.raffle.id) {
    const currentWinner = this.getWinningEntry(this.raffle.id);
    if (currentWinner) {
      this.winningNumber = currentWinner.winningNumber;
      this.winningParticipant = currentWinner.winningParticipant;
    } else {
      this.winningNumber = null;
      this.winningParticipant = null;
    }
  }
}



getWinningEntry(raffleId: number) {
  if (!this.winningData) return null;
  return this.winningData.find(e => e.raffleId === raffleId) || null;
}


shareRaffleViaWhatsApp(): void {
  if (!this.raffleId) {
    console.error('No se puede compartir la rifa porque no se encontró el ID.');
    return;
  }

  // Construir la URL de la rifa
  const raffleUrl = `${window.location.origin}/external-raffle/${this.raffleId}`;

  // Mensaje personalizado para compartir
  const message = `¡Participa en esta rifa increíble! 🎟️\n\n` +
                  //`Código de la rifa: ${this.raffleCode}\n` +
                  `Enlace para participar: ${raffleUrl}`;

  // Codificar el mensaje para incluirlo en la URL de WhatsApp
  const encodedMessage = encodeURIComponent(message);

  // Construir el enlace de WhatsApp para abrir la app directamente
  const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

  // Abrir el enlace
  window.location.href = whatsappUrl;
}


whatsappAppLink(): string {
  const phone = this.raffle?.usuario?.telefono ?? '';
  const clean = phone.replace(/\D+/g, '');
  const adminName = this.raffle?.usuario?.name ?? 'Administrador';
  const text = encodeURIComponent(`Hola ${adminName}, quisiera participar en su sorteo.`);
  return `whatsapp://send?phone=${clean}&text=${text}`;
}



}
