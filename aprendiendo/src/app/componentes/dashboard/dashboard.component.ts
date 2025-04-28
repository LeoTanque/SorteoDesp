import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RaffleService } from '../../services/raffle.service';
import { ListboxModule } from 'primeng/listbox';
import Swal from 'sweetalert2';
import { Raffle } from '../../interfaces/raffle';
import { FileUploadModule } from 'primeng/fileupload';
import { User } from '../../interfaces/user';
import { Producto } from '../../interfaces/producto';
import { forkJoin, Subscription, switchMap, tap } from 'rxjs';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { SidebarModule} from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { Participante } from '../../interfaces/participante';
import { ParticipanteService } from '../../services/participante.service';
import { RaffleBannerComponent } from "../raffle-banner/raffle-banner.component";
import { DropdownModule } from 'primeng/dropdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CountdownComponent } from "../countdown/countdown.component";
import { RaffleExecutionService } from '../../services/raffle-execution.service';
import { RaffleResultService } from '../../services/raffle-result.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ReactiveFormsModule, FormsModule, DialogModule, ButtonModule, InputTextModule,
    TableModule, TagModule,
    CalendarModule, InputTextareaModule, ListboxModule, FileUploadModule, CarouselModule, TagModule, SidebarModule, ToastModule,
    SpeedDialModule, RaffleBannerComponent, DropdownModule, CountdownComponent],
    providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;
  @ViewChild(RaffleBannerComponent) raffleBannerComponent!: RaffleBannerComponent;

  @ViewChild('raffleBanner') raffleBanner!: RaffleBannerComponent;
  userName: string = '';
  userId!: any;
  daysLeft: number = 30;
  activeRaffles: Raffle[] = [];
  completedRaffles: any[] = [];
  userRaffles: any[] = [];

  newRaffle: Raffle = {
    nombre: '',
    cantidadParticipantes: '',
    fechaSorteo: new Date(),
    usuario: this.userId, // Asigna el usuario actual aquí
    //producto: {} as Producto,
    producto: {
      nombre: '',
      descripcion: '',
      imagenes: [],

    },
    // Asigna el producto seleccionado aquí
    active: true,
    precio: ''
  };

  //newlyCreatedRaffle!: Raffle;
  newlyCreatedRaffle: any = null;
  selectedRaffle!: Raffle;
  displayBanner: boolean = false;
  imageDataUrl: string | null = null;
  // Para la rifa
  nombreSorteoInvalido: boolean = false;
  cantidadInvalida: boolean = false;
  descripcionInvalida: boolean = false;
  fechaSorteoInvalida: boolean = false;

  // Para el producto
nombreProductoInvalido: boolean = false;
descripcionProductoInvalida: boolean = false;
imagenProductoInvalida: boolean = false;

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];


participantes: Participante[] = [];
numerosReservados: number[] = [];
raffleId: any | null = null;
  codigoVip: string = '';
  raffle: Raffle | null = null;
  cantidadRifas: number = 0;
  isVip!: boolean | null;
  tieneRifa!: boolean;
  subida:boolean = false;
  mensaje = '';

  displayDialog: boolean = false;

  participantsText: string = '';

  newParticipant: string = '';

  displayProductDialog: boolean = false;

  displayDialog1: boolean = false;

  productData: Producto = {
    id: 0,
    nombre: '',
    descripcion: '',
    imagenes: []
  };

  selectedFile: File | null = null;
  selectedFiles1: File[] = [];
  selectedFiles: (any | null)[] = [];
  previews: (string | null)[] = [];
  uploading: boolean = false;
  subscription!: Subscription;

  sidebarVisible: boolean = false;
  datosParticipantes: boolean = false;
  remainingTime: { days: number; hours: number; minutes: number; seconds: number } = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private timerInterval: any;
  currentUser: any;


winningNumber: number | null = null;
winningParticipant: string | null = null;
winningRaffleId: number | null = null;
winningData: { raffleId: number; winningNumber: number; winningParticipant: string }[] = [];

  displayFormatDialog: boolean = false;
  // Variables para el formato
  selectedFont: string = '';
  fontSize: number = 14;
  textColor: string = '#000000';
  selectedFontSize: string = '3';
  fontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' }
  ];

  fontSizes = [
    { label: 'Pequeño', value: '2' },
    { label: 'Normal', value: '3' },
    { label: 'Grande', value: '4' },
    { label: 'Muy Grande', value: '5' },
    { label: 'Enorme', value: '6' }
  ];

  safeDescription!: SafeHtml;

  @ViewChild('mainEditor') mainEditor!: ElementRef<HTMLDivElement>;
  @ViewChild('modalEditor') modalEditor!: ElementRef<HTMLDivElement>;
  availableNumbers: number[] = [1,2,3,4,5,6,7,8,9];
  numerosReservadosByRaffle: Record<number, number[]> = {};
  //availableNumbersByRaffle: Record<number, number[]> = {};

// Mapa de participantes por rifa
participantesPorRifa: { [raffleId: number]: Participante[] } = {};
// Mapa de números reservados por rifa
numerosReservadosPorRifa: { [raffleId: number]: number[] } = {};
// Mapa de números disponibles (1…cantidadParticipantes) por rifa
availableNumbersMap: { [raffleId: number]: number[] } = {};

  //availableNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
  showCountdown: boolean = false;

  private rifasNotificadas: Set<number> = new Set();
  selectedRaffleId: number | null = null;
  participantesPorMisRifas: Record<number, Participante[]> = {};
  participantsByRaffle = new Map<number, Participante[]>();

  constructor(
    private authService: AuthenticationService,private cdRef: ChangeDetectorRef,
    private router:Router,
    private raffleService: RaffleService,
    private messageService: MessageService,
    private participanteService: ParticipanteService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private raffleExecutionService: RaffleExecutionService,
    private raffleResultService: RaffleResultService,

  ){ }

  ngOnInit(): void {
    this.loadUserId()
    this.loadWinningInfo();

    this.activeRaffles = this.activeRaffles.map(raffle => {
      raffle.producto.descripcion = this.sanitizer.bypassSecurityTrustHtml(raffle.producto.descripcion) as unknown as string;
      return raffle;
    });


   //this.loadAllParticipantes();
   //this.mostrarParticipantes(this.raffleId)
   //this.loadAllParticipantsForMyRaffles();


     this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
   this.userName = this.currentUser.name || 'Usuario';


   if (this.currentUser && this.currentUser.fechaRegistro) {
    const registrationDate = new Date(this.currentUser.fechaRegistro);
    // Calcula la fecha de expiración sumando 30 días
    const expiryDate = new Date(registrationDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    this.startCountdown(expiryDate);
  } else {
    // Si no hay fecha de registro, asume que la cuenta ha expirado
    this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }


  setInterval(() => {
    this.checkRifasParaAutoEjecutar();
  }, 60000); // 60000 ms = 1 minuto
  // Opcional: llámalo una vez al inicio:
  this.checkRifasParaAutoEjecutar();

  setInterval(() => {
    console.log('⏰ Trigger revisión automática de rifas caducadas');
    this.autoDeleteExpiredEmptyRaffles();
  }, 360000);

}


loadWinningInfo0(): void {
  const winningNumberStr = localStorage.getItem('winningNumber');
  const winningParticipantStr = localStorage.getItem('winningParticipant');
  const winningRaffleIdStr = localStorage.getItem('winningRaffleId');
  this.winningNumber = winningNumberStr ? parseInt(winningNumberStr, 10) : null;
  this.winningParticipant = winningParticipantStr || null;
  this.winningRaffleId = winningRaffleIdStr ? parseInt(winningRaffleIdStr, 10) : null;

  console.log('Información del ganador cargada:', this.winningNumber, this.winningParticipant, this.winningRaffleId);
}

loadWinningInfo1(): void {
  const storedData = localStorage.getItem('winningData');
  let winningData: any[] = [];
  if (storedData) {
    try {
      winningData = JSON.parse(storedData);
      if (!Array.isArray(winningData)) {
        winningData = [];
      }
    } catch (error) {
      console.error('Error al parsear winningData:', error);
      winningData = [];
    }
  }
  console.log('Información de ganadores cargada:', winningData);
  // Si deseas, puedes asignar a una variable local para usarla en el HTML:
  this.winningData = winningData;
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
}


getWinningEntry(raffleId: number): { raffleId: number; winningNumber: number; winningParticipant: string } | undefined {
  return this.winningData.find(entry => entry.raffleId === raffleId);
}


getActions(raffle: Raffle) {
  return [
    {
      label: 'Compartir',
      icon: 'pi pi-external-link',
      command: () => {
        this.shareOnWhatsApp();
      }
    },
    {
      label: 'Ejecutar Sorteo',
      icon: 'pi pi-play',
      command: (event: any) => {
        console.log('Ejecutar Sorteo callback invocado para la rifa:', raffle);
        this.executeRaffle(null, raffle);

      }
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => {
        this.deleteRaffle(raffle);
      }
    },
    {
      label: 'Ver Participantes',
      icon: 'pi pi-users',
      command: () => {
        if (raffle.id) { this.mostrarParticipantes(raffle.id); }
      }
    },
    {
      label: 'Ver Banner',
      icon: 'pi pi-eye',
      command: () => {
        this.openBanner(raffle);
      }
    }
  ];
}


openFormatDialog(): void {
  this.displayFormatDialog = true;
  setTimeout(() => {
    if (this.modalEditor && this.mainEditor) {
      this.modalEditor.nativeElement.innerHTML = this.mainEditor.nativeElement.innerHTML;
      console.log("Contenido cargado en el modal editor:", this.modalEditor.nativeElement.innerHTML);
    }
  }, 300);
}



applyFormat(command: string, value?: any): void {
  this.modalEditor.nativeElement.focus();
  document.execCommand(command, false, value || null);
}


applyFont(): void {
  this.applyFormat('fontName', this.selectedFont);
}


applyFontSize(): void {
  this.applyFormat('fontSize', this.selectedFontSize);
}


applyTextColor(): void {
  this.applyFormat('foreColor', this.textColor);
}



   closeFormatDialog1(applyChanges: boolean): void {
    if (applyChanges && this.modalEditor && this.mainEditor) {
      const newContent = this.modalEditor.nativeElement.innerHTML;
      this.mainEditor.nativeElement.innerHTML = newContent;
      this.productData.descripcion = newContent;
      this.descripcionInvalida = newContent.length > 1500;
    }
    this.displayFormatDialog = false;
  }

  closeFormatDialog(applyChanges: boolean): void {
    if (applyChanges && this.modalEditor && this.mainEditor) {
      const newContent = this.modalEditor.nativeElement.innerHTML;
      this.mainEditor.nativeElement.innerHTML = newContent;
      this.productData.descripcion = newContent;
      this.descripcionInvalida = newContent.length === 0 || newContent.length > 1500;
      console.log("Contenido final en el modal editor:", newContent);
      console.log("Descripción actualizada:", this.productData.descripcion);
    } else {
      console.log("Cambios descartados");
    }
    this.displayFormatDialog = false;
  }

  updateDescription(): void {
    // Actualiza productData.descripcion con el contenido HTML del editor
    const content = this.mainEditor.nativeElement.innerHTML.trim();
    this.productData.descripcion = content;
    // Valida: se considera inválida si está vacía o supera 1500 caracteres
    this.descripcionInvalida = content.length === 0 || content.length > 1500;
    console.log("Descripción actualizada:", this.productData.descripcion);
  }





startCountdown(expiryDate: Date): void {
  this.timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = expiryDate.getTime() - now;

    if (distance <= 0) {
      // Si se acaba el tiempo, detener el cronómetro y poner todo en 0
      this.remainingTime = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      clearInterval(this.timerInterval);
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      this.remainingTime = { days, hours, minutes, seconds };
    }
  }, 1000);


  }

  openBanner(raffle: Raffle): void {
    this.selectedRaffle = raffle;

    if (this.raffleBannerComponent) {
      this.raffleBannerComponent.raffle = raffle;
      this.raffleBannerComponent.openBanner();
    }
  }

   // 🔹 Método para descargar la imagen
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

  downloadBannerImage(): void {
    if (this.raffleBannerComponent) {
      this.raffleBannerComponent.downloadImage();
    } else {
      console.error('No se encontró el componente del banner');
    }
  }




   logout1(): void {
      this.sidebarVisible = false
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, permanecer'
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.logout();
          this.router.navigate(['/']);
          Swal.fire( '¡Cerrado!', 'Tu sesión ha sido cerrada', 'success' );
        }
      });
    }


    logout(): void {
      this.sidebarVisible = false;
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'No, permanecer'
      }).then((result) => {
        if (result.isConfirmed) {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

          // Guardar la cantidad de rifas antes de limpiar el localStorage
          let rifasGuardadas = null;
          if (currentUser && currentUser.id) {
            rifasGuardadas = localStorage.getItem(`rifas_${currentUser.id}`);
          }

          // Cerrar sesión y limpiar localStorage
          this.authService.logout();
          localStorage.clear();

          // Restaurar la cantidad de rifas si existía
          if (currentUser && currentUser.id && rifasGuardadas) {
            localStorage.setItem(`rifas_${currentUser.id}`, rifasGuardadas);
          }

          this.router.navigate(['/login']);
          Swal.fire('¡Cerrado!', 'Tu sesión ha sido cerrada', 'success');
        }
      });
    }


  loadUserId(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Verifica si el currentUser tiene la propiedad esVip
    console.log('currentUser en localStorage:', currentUser);

    if (currentUser && currentUser.id) {
      this.userId = currentUser.id;
      this.codigoVip = currentUser.codigoVip || null;
      this.isVip = currentUser.esVip === true; // Aquí usamos esVip en lugar de isVip

      console.log('Detalles del usuario logueado:', currentUser);
      console.log('ID del usuario logueado:', this.userId);
      console.log('Código VIP del usuario:', this.codigoVip);
      console.log('Es VIP?:', this.isVip);

      // Imprimir la cantidad de rifas permitidas
      if (this.isVip && currentUser.cantidadRifas !== undefined) {
        console.log('Cantidad de rifas permitidas:', currentUser.cantidadRifas);
      } else {
        console.log('El usuario no tiene una cantidad de rifas asignada o no es VIP.');
      }

      this.loadUserRaffles();
    } else {
      console.error('No se encontró el usuario logueado en el localStorage.');
    }
  }



  loadUserRaffles1(): void {
    if (this.userId) {
      this.raffleService.getRafflesByUser(this.userId).subscribe({
        next: (raffles: Raffle[]) => {
          this.userRaffles = raffles;
          this.updateRafflesByStatus();

          // Asegúrate de que cada rifa tenga al menos una imagen válida en el producto
          this.userRaffles.forEach(raffle => {
            if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
              // Si no hay imágenes, asignamos una imagen por defecto
              raffle.producto.imagenes = ['path/to/default/image.jpg'];
            }
          });

          console.log('Rifas asociadas al usuario:', this.userRaffles);
        },
        error: (error) => {
          console.error('Error al cargar las rifas:', error);
        }
      });
    } else {
      console.error('El userId no está definido.');
    }
  }


  loadUserRaffles(): void {
    if (this.userId) {
      this.raffleService.getRafflesByUser(this.userId).subscribe({
        next: (raffles: Raffle[]) => {
          this.userRaffles = raffles;
          this.updateRafflesByStatus();
          this.loadAllParticipantsForMyRaffles();

          //this.autoDeleteExpiredEmptyRaffles();
          // Asegúrate de que cada rifa tenga al menos una imagen válida
          this.userRaffles.forEach(raffle => {
            if (!raffle.producto.imagenes || raffle.producto.imagenes.length === 0) {
              raffle.producto.imagenes = ['assets/images/default.jpg'];
            }
          });




          // Por ejemplo, asigna la rifa más reciente como banner
          if (this.userRaffles.length > 0) {
            // Supón que la rifa creada más recientemente está al inicio
            this.newlyCreatedRaffle = this.userRaffles[0];
          }

          console.log('Rifas asociadas al usuario:', this.userRaffles);
        },
        error: (error) => {
          console.error('Error al cargar las rifas:', error);
        }
      });
    } else {
      console.error('El userId no está definido.');
    }
  }

  loadUserRaffles0(): void {
    if (!this.userId) {
      console.error('El userId no está definido.');
      return;
    }

    this.raffleService.getRafflesByUser(this.userId).subscribe({
      next: (raffles: Raffle[]) => {
        this.userRaffles = raffles;
        this.updateRafflesByStatus();

        // Asegúrate de que cada rifa tenga al menos una imagen válida
        this.userRaffles.forEach(r => {
          if (!r.producto.imagenes || r.producto.imagenes.length === 0) {
            r.producto.imagenes = ['assets/images/default.jpg'];
          }
        });

        // Banner con la rifa más reciente
        if (this.userRaffles.length > 0) {
          this.newlyCreatedRaffle = this.userRaffles[0];
        }

        console.log('Rifas asociadas al usuario:', this.userRaffles);

        // ——— NUEVO: para cada rifa asociada, obtenemos sus participantes ———
        this.userRaffles.forEach(raffle => {
          const id = raffle.id!;
          this.participanteService.getParticipantesByRaffleId(id).subscribe({
            next: participants => {
              console.log(`Participantes para rifa ${id} (auto-carga):`, participants);
              // Si además quieres guardarlos en un objeto por rifa:
              this.participantesPorRifa[id] = participants;
            },
            error: err => {
              console.error(`Error al auto-cargar participantes rifa ${id}:`, err);
            }
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar las rifas:', error);
      }
    });
  }

 // Validar y asignar código VIP
validarYAsignarCodigoVip(): void {
  if (!this.codigoVip.trim()) {
    this.mostrarMensaje('error', 'Código VIP requerido', 'Por favor, ingrese un código VIP.');
    return;
  }

  this.raffleService.obtenerCodigosVip().subscribe({
    next: (codigosVip) => {
      console.log('Codigos VIP obtenidos:', codigosVip); // 🟢 Verificar la estructura de la API

      const codigoEncontrado = codigosVip.find(codigo => codigo.codigo === this.codigoVip && !codigo.usuarioAsignado);

      if (codigoEncontrado) {
        console.log('Código VIP encontrado:', codigoEncontrado); // 🟢 Verificar que se encuentra correctamente

        this.cantidadRifas = codigoEncontrado.cantidadRifas ?? 0;
        console.log('Cantidad de rifas obtenida:', this.cantidadRifas); // 🟢 Verificar que se obtiene la cantidad correcta

        this.asignarCodigoVip(this.cantidadRifas);
        this.loadUserId()
      } else {
        this.mostrarMensaje('warning', 'Código inválido o asignado', 'El código VIP no es válido o ya está asignado a otro usuario.');
      }
    },
    error: (error) => {
      this.mostrarMensaje('error', 'Error de validación', error);
    }
  });

  this.hideProductDialog();
}



private asignarCodigoVip(cantidadRifas: number): void {
  console.log('Asignando código VIP con rifas:', cantidadRifas); // 🟢 Verifica el valor antes de guardar

  this.isVip = true;
  this.codigoVip = this.codigoVip!.trim();

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (currentUser && currentUser.id) {
    currentUser.esVip = true;
    currentUser.codigoVip = this.codigoVip;
    currentUser.cantidadRifas = cantidadRifas; // 🔴 Asegurar que se almacene correctamente


    console.log('Usuario actualizado antes de guardar en localStorage:', currentUser); // 🟢 Verificar que tiene cantidadRifas

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    this.userId = currentUser.id;
    this.cantidadRifas = cantidadRifas;


    this.mostrarMensaje('success', 'Código VIP asignado', `¡Felicidades! Ahora eres un usuario VIP con ${cantidadRifas} rifas.`);
    this.hideProductDialog();
    this.codigoVip = '';

    this.cdRef.detectChanges();
  } else {
    console.log('No se encontró el usuario en el localStorage.');
    this.mostrarMensaje('error', 'Error al asignar el código VIP', 'Hubo un error al actualizar el usuario.');
  }
}





deleteRaffle0(raffle: Raffle): void {
  // Primero, consulta al API para obtener participantes asociados a la rifa actual
  this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
    next: (participants) => {
      if (participants && participants.length > 0) {
        // Si existen participantes, no se permite eliminar la rifa
        Swal.fire({
          title: 'No se puede eliminar la rifa',
          text: 'Esta rifa tiene participantes reservados. Elimine primero los participantes asociados.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      } else {
        // Si no hay participantes, se muestra confirmación para eliminar la rifa
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Primero eliminamos las imágenes
            const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
              const imageName = imageUrl.split('/').pop(); // Extraemos el nombre de la imagen
              return this.raffleService.deleteImage(imageName!);
            });

            forkJoin(imageDeletions).subscribe({
              next: () => {
                // Luego, eliminamos la rifa
                this.raffleService.deleteRaffle(raffle.id!).subscribe({
                  next: () => {
                    console.log('Rifa eliminada con éxito');
                    // Actualizar las listas locales
                    this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
                    this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
                    this.loadUserRaffles();
                    Swal.fire({
                      title: '¡Eliminada!',
                      text: 'La rifa ha sido eliminada correctamente.',
                      icon: 'success',
                      confirmButtonText: 'Aceptar',
                    });
                  },
                  error: (error) => {
                    console.error('Error al eliminar la rifa:', error);
                    Swal.fire({
                      title: 'Error',
                      text: 'No se pudo eliminar la rifa.',
                      icon: 'error',
                      confirmButtonText: 'Aceptar',
                    });
                  }
                });
              },
              error: (error) => {
                console.error('Error al eliminar las imágenes:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo eliminar las imágenes.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                });
              }
            });
          }
        });
      }
    },
    error: (err) => {
      console.error('Error al verificar participantes:', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo verificar los participantes asociados a la rifa.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  });
}

deleteRaffle1(raffle: Raffle): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la rifa y todos los datos relacionados (participantes, números reservados, imágenes). Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      // Primero eliminamos las imágenes (opcional, si ya se quiere borrar manualmente)
      const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
        const imageName = imageUrl.split('/').pop(); // Extrae el nombre de la imagen
        return this.raffleService.deleteImage(imageName!);
      });

      forkJoin(imageDeletions).subscribe({
        next: () => {
          // Luego, eliminamos la rifa (y el backend se encargará de eliminar los participantes)
          this.raffleService.deleteRaffle(raffle.id!).subscribe({
            next: () => {
              console.log('Rifa eliminada con éxito');
              this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
              this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
              this.loadUserRaffles();
              Swal.fire({
                title: '¡Eliminada!',
                text: 'La rifa y todos los datos relacionados han sido eliminados correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
              });
            },
            error: (error) => {
              console.error('Error al eliminar la rifa:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la rifa.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            }
          });
        },
        error: (error) => {
          console.error('Error al eliminar las imágenes:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar las imágenes.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  });
}

deleteRaffle(raffle: Raffle): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la rifa y todos los datos relacionados (participantes, números reservados, imágenes). Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      // Primero eliminamos las imágenes asociadas a la rifa
      const imageDeletions = raffle.producto.imagenes.map(imageUrl => {
        const imageName = imageUrl.split('/').pop(); // Extrae el nombre de la imagen
        return this.raffleService.deleteImage(imageName!);
      });

      forkJoin(imageDeletions).subscribe({
        next: () => {
          // Luego, eliminamos la rifa del backend
          this.raffleService.deleteRaffle(raffle.id!).subscribe({
            next: () => {
              console.log('Rifa eliminada con éxito');

              // Eliminar la rifa de las listas locales
              this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
              this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);

              // Eliminar datos relacionados en el localStorage
              this.removeRaffleDataFromLocalStorage(raffle.id!);

              // Recargar las rifas del usuario
              this.loadUserRaffles();

              Swal.fire({
                title: '¡Eliminada!',
                text: 'La rifa y todos los datos relacionados han sido eliminados correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
              });
            },
            error: (error) => {
              console.error('Error al eliminar la rifa:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la rifa.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
              });
            }
          });
        },
        error: (error) => {
          console.error('Error al eliminar las imágenes:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar las imágenes.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    }
  });
}

private removeRaffleDataFromLocalStorage(raffleId: number): void {
  // Eliminar datos de ganadores relacionados con la rifa
  const storedData = localStorage.getItem('winningData');
  if (storedData) {
    try {
      let winningData = JSON.parse(storedData);
      if (Array.isArray(winningData)) {
        winningData = winningData.filter(entry => entry.raffleId !== raffleId);
        localStorage.setItem('winningData', JSON.stringify(winningData));
        console.log(`Datos de ganadores para la rifa ${raffleId} eliminados del localStorage.`);
      }
    } catch (error) {
      console.error('Error al parsear winningData:', error);
    }
  }

  // Eliminar cualquier otro dato relacionado con la rifa en el localStorage
  const raffleKey = `raffle_${raffleId}`;
  if (localStorage.getItem(raffleKey)) {
    localStorage.removeItem(raffleKey);
    console.log(`Datos específicos de la rifa ${raffleId} eliminados del localStorage.`);
  }
}



private autoDeleteExpiredEmptyRaffles0(): void {
  const now = new Date().getTime();

  this.activeRaffles.forEach(raffle => {
    // 1) Fecha de sorteo + 7 días en milisegundos
    const expiration = new Date(raffle.fechaSorteo).getTime() + 7 * 24 * 60 * 60 * 1000;

    // 2) Filtrar participantes de esta rifa
    const participantesRifa = this.participantes.filter(p => p.raffleId === raffle.id);

    if (participantesRifa.length === 0 && now >= expiration) {
      // → Eliminar imágenes primero
      const imageDeletes = raffle.producto.imagenes.map(url => {
        const filename = url.split('/').pop()!;
        return this.raffleService.deleteImage(filename);
      });

      forkJoin(imageDeletes).subscribe({
        next: () => {
          // Luego eliminar la propia rifa
          this.raffleService.deleteRaffle(raffle.id!).subscribe({
            next: () => {
              // Limpiar arrays locales
              this.activeRaffles = this.activeRaffles.filter(r => r.id !== raffle.id);
              this.completedRaffles = this.completedRaffles.filter(r => r.id !== raffle.id);
              this.removeRaffleDataFromLocalStorage(raffle.id!);
              // Notificar al usuario
              Swal.fire({
                title: 'Rifa eliminada',
                text: `La rifa "${raffle.nombre}" ha sido eliminada porque venció hace más de 7 días y no tenía participantes.`,
                icon: 'info',
                timer: 4000,
                showConfirmButton: false
              });
            },
            error: err => console.error('Error borrando rifa', err)
          });
        },
        error: err => console.error('Error borrando imágenes', err)
      });
    }
  });
}

private autoDeleteExpiredEmptyRaffles(): void {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  console.log(`🔄 Iniciando revisión automática: ${new Date(now).toLocaleString()}`);

  // 1) Rifas activas sin participantes y vencidas > 1 semana
  this.activeRaffles.forEach(r => {
    const fechaSort = new Date(r.fechaSorteo).getTime();
    const tienePart = this.participantes.some(p => p.raffleId === r.id);
    if (!tienePart && now - fechaSort > oneWeekMs) {
      console.log(`🗑️ Rifas activas SIN participantes vencida >7d: id=${r.id}, nombre="${r.nombre}", fechaSorteo=${r.fechaSorteo}`);
      this.deleteRaffleSilently(r);
    }
  });

  // 2) Rifas ya ejecutadas (inactive) y vencidas > 1 semana
  this.completedRaffles.forEach(r => {
    const fechaSort = new Date(r.fechaSorteo).getTime();
    if (now - fechaSort > oneWeekMs) {
      console.log(`🗑️ Rifa completada vencida >7d: id=${r.id}, nombre="${r.nombre}", fechaSorteo=${r.fechaSorteo}`);
      this.deleteRaffleSilently(r);
    }
  });
}


private deleteRaffleSilently(raffle: Raffle): void {
  console.log(`   ➡️ Eliminando silenciosamente rifa ${raffle.id}`);
  const imageDeletions = raffle.producto.imagenes.map(url => {
    const name = url.split('/').pop()!;
    return this.raffleService.deleteImage(name);
  });

  forkJoin(imageDeletions).pipe(
    switchMap(() => this.raffleService.deleteRaffle(raffle.id!))
  ).subscribe({
    next: () => {
      console.log(`   ✔️ Rifa ${raffle.id} eliminada con éxito`);
      this.userRaffles = this.userRaffles.filter(r => r.id !== raffle.id);
      this.updateRafflesByStatus();
      this.removeRaffleDataFromLocalStorage(raffle.id!);
      Swal.fire({
        title: 'Rifa eliminada',
        text: `La rifa "${raffle.nombre}" ha sido eliminada automáticamente.`,
        icon: 'info',
        timer: 3000
      });
    },
    error: err => console.error(`   ❌ Error borrando rifa ${raffle.id}:`, err)
  });
}


actualizarEstadoUsuario(): void {
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (rifas: Raffle[]) => {
      console.log('Rifas actuales del usuario después de eliminar:', rifas);

      // 🟢 Si el usuario ya no tiene rifas, actualizamos el estado
      if (rifas.length === 0) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.tieneRifa = false; // 🔄 Actualizar el estado en localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        this.tieneRifa = false; // 🔄 Actualizar variable en el componente
        console.log('Usuario actualizado: ahora puede crear una nueva rifa.');
      }

      // 🔄 Recargar las rifas del usuario sin recargar la página
      //this.loadUserRaffles();
      this.loadUserId()
    },
    error: (error) => {
      console.error('Error al obtener rifas del usuario:', error);
    }
  });
}




copyToClipboard(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    this.messageService.add({
      severity: 'success',
      summary: 'Copiado',
      detail: `Código ${code} copiado al portapapeles`,
      life: 1000
    });
  }).catch(err => {
    console.error('Error al copiar: ', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo copiar el código',
      life: 3000
    });
  });
}

copyToClipboard1(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    Swal.fire({
      title: 'Copiado',
      text: 'El enlace ha sido copiado al portapapeles',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }).catch(err => console.error('Error al copiar:', err));
}


getRaffleUrl(id: number): string {
  return `${window.location.origin}/external-raffle/${id}`;
}

executeRaffle1(event: Event, raffle: Raffle): void {
  event.stopPropagation();
  Swal.fire({
    title: '¿Ejecutar rifa?',
    text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, ejecutar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      raffle.active = false;
      this.raffleService.updateRaffle(raffle.id!, raffle).subscribe({
        next: (updatedRaffle) => {
          console.log('Rifa ejecutada:', updatedRaffle);
          Swal.fire({
            title: 'Ejecutada!',
            text: 'La rifa ha sido ejecutada correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.updateRafflesByStatus();
        },
        error: (error) => {
          console.error('Error al ejecutar la rifa:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo ejecutar la rifa. Por favor, inténtelo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  });
}


validarCantidadParticipantes() {
  this.cantidadInvalida = this.newRaffle.cantidadParticipantes > 100;
}

validarDescripcion() {
  this.descripcionInvalida = this.productData.descripcion.length > 1500;
}

executeRaffle0(event: Event | null, raffle: Raffle): void {
  if (event) {
    event.stopPropagation();
  }
  Swal.fire({
    title: '¿Ejecutar rifa?',
    text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, ejecutar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      raffle.active = false;
      this.raffleService.updateRaffle(raffle.id!, raffle).subscribe({
        next: (updatedRaffle) => {
          console.log('Rifa ejecutada:', updatedRaffle);
          Swal.fire({
            title: 'Ejecutada!',
            text: 'La rifa ha sido ejecutada correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.updateRafflesByStatus();
        },
        error: (error) => {
          console.error('Error al ejecutar la rifa:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo ejecutar la rifa. Por favor, inténtelo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  });
}


// En el DashboardComponent (código relevante)
executeRaffle(event: Event | null, raffle: Raffle): void {
  if (event) event.stopPropagation();

  // Verificar que existan participantes para la rifa actual
  //const participantesRifa = this.participantes.filter(p => p.raffleId === raffle.id);
  const participantesRifa = this.participantsByRaffle.get(raffle.id!) || [];
  if (participantesRifa.length === 0) {
    Swal.fire({
      title: 'No hay participantes',
      text: 'No se puede ejecutar la rifa sin participantes registrados.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  Swal.fire({
    title: '¿Ejecutar rifa?',
    text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, ejecutar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      // Inicia la cuenta regresiva
      this.raffleExecutionService.startCountdown(5);
      this.selectedRaffle = raffle;
      this.showCountdown = true;
    }
  });
}


checkRifasParaAutoEjecutar1(): void {
  const now = new Date();
  // Recorremos las rifas activas
  this.activeRaffles.forEach(raffle => {
    // Convertimos el valor de fechaSorteo a Date (asegúrate de que esté en formato reconocible)
    const fechaSorteo = new Date(raffle.fechaSorteo);
    if (now.getTime() >= fechaSorteo.getTime()) { // Si la fecha de sorteo ya venció
      // Si la rifa sigue activa (para evitar re-ejecución) y tiene participantes
      if (raffle.active) {
        const participantesRifa = this.participantes.filter(p => p.raffleId === raffle.id);
        if (participantesRifa.length > 0) {
          console.log(`La rifa ${raffle.id} ya venció y se procede a autoejecutar.`);
          this.selectedRaffle = raffle;
          this.showCountdown = true;
          // Inicia la cuenta regresiva para esta rifa
          this.raffleExecutionService.startCountdown(5);
        } else {
          console.log(`Rifa ${raffle.id} vencida pero sin participantes.`);
        }
      }
    }
  });
}

checkRifasParaAutoEjecutar(): void {
  const now = new Date();

  this.activeRaffles.forEach(raffle => {
    // Convertir la fecha del sorteo a Date
    const fechaSorteo = new Date(raffle.fechaSorteo);

    // Condición A: La fecha de sorteo ya venció
    const conditionOverdue: boolean = now.getTime() >= fechaSorteo.getTime();

    // Filtrar los participantes que pertenecen a esta rifa
    const participantesRifa = this.participantes.filter(p => p.raffleId === raffle.id);

    // Condición B: La cantidad de reservas (participantes registrados) es igual a la capacidad total de la rifa
    // Esto indica que se han reservado TODOS los números
    const conditionAllReserved: boolean = participantesRifa.length === raffle.cantidadParticipantes;

    // Si la rifa sigue activa y tiene participantes...
    if (raffle.active && participantesRifa.length > 0) {
      // Si se cumple que la fecha de sorteo ya venció OR se han reservado todos los números...
      if (conditionOverdue || conditionAllReserved) {
        console.log(`La rifa ${raffle.id} cumple condiciones para autoejecución.`);
        // Ejecutar la rifa automáticamente:
        this.selectedRaffle = raffle;
        this.showCountdown = true;
        // Inicia la cuenta regresiva (se puede usar 5 segundos, por ejemplo)
        this.raffleExecutionService.startCountdown(5);
      }
    } else {
      // Opcionalmente, puedes registrar en consola rifas vencidas sin participantes (o sin reserva completa).
      if (raffle.active && participantesRifa.length === 0 && conditionOverdue) {
        console.log(`Rifa ${raffle.id} vencida pero sin participantes.`);
      }
    }
  });
}

checkRifasParaAutoEjecutar0(): void {
  const now = Date.now();

  this.activeRaffles.forEach(raffle => {
    const fechaSorteo = new Date(raffle.fechaSorteo).getTime();
    const overdue = now >= fechaSorteo;
    const participantesRifa = this.participantsByRaffle.get(raffle.id!) || [];
    const allReserved = participantesRifa.length === raffle.cantidadParticipantes;

    if (raffle.active && participantesRifa.length > 0 && (overdue || allReserved)) {
      console.log(`Autoejecutar rifa ${raffle.id}`);
      this.selectedRaffle = raffle;
      this.raffleExecutionService.startCountdown(5);
      this.showCountdown = true;
    } else if (raffle.active && participantesRifa.length === 0 && overdue) {
      console.log(`Rifa ${raffle.id} vencida sin participantes.`);
    }
  });
}




onCountdownFinished0(): void {
  this.showCountdown = false;

  // Asegúrate de que se use la cantidad correcta
  const totalNumbers = this.availableNumbers.length;
  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * numbers.length);
  const winningNumber = numbers[randomIndex];

  console.log('Cantidad de números disponibles:', totalNumbers);
  console.log('Arreglo de números válidos:', numbers);
  console.log('Índice aleatorio generado:', randomIndex);

  console.log('🎯 Número ganador generado:', winningNumber);

  // Busca al participante dentro de los de la rifa actual
  const winningParticipantObj = this.participantes.find(
    p => p.reservedNumber === winningNumber && p.raffleId === this.selectedRaffle?.id
  );

  const winningParticipant = winningParticipantObj
    ? `${winningParticipantObj.name} ${winningParticipantObj.lastName}`
    : "No ha sido reservado";

  const winningDataEntry = {
    raffleId: this.selectedRaffle.id,
    winningNumber: winningNumber,
    winningParticipant: winningParticipant
  };

  // Guardar en localStorage
  let winningData: any[] = [];
  const storedData = localStorage.getItem('winningData');
  if (storedData) {
    try {
      winningData = JSON.parse(storedData);
      if (!Array.isArray(winningData)) winningData = [];
    } catch (e) {
      console.error('Error al parsear winningData:', e);
    }
  }

  const existingIndex = winningData.findIndex(entry => entry.raffleId === this.selectedRaffle.id);
  if (existingIndex !== -1) {
    winningData[existingIndex] = winningDataEntry;
  } else {
    winningData.push(winningDataEntry);
  }
  localStorage.setItem('winningData', JSON.stringify(winningData));

  this.winningNumber = winningNumber;
  this.winningParticipant = winningParticipant;
  this.winningRaffleId = this.selectedRaffle.id ?? null;

  // Marcar rifa como ejecutada (inactiva)
  const updatedRaffle = { ...this.selectedRaffle, active: false };
  this.raffleService.updateRaffle(this.selectedRaffle.id!, updatedRaffle).subscribe({
    next: (updated) => {
      console.log('✅ Rifa ejecutada:', updated);
      Swal.fire({
        title: 'Sorteo Ejecutado!',
        text: 'El número ganador es: ' + winningNumber +
              (winningParticipantObj ? ('. Ganador: ' + winningParticipant) : '. Este número no fue reservado.'),
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        const index = this.userRaffles.findIndex(r => r.id === updated.id);
        if (index !== -1) this.userRaffles[index] = updated;

        this.updateRafflesByStatus();
        this.loadWinningInfo();
      });
    },
    error: (error) => {
      console.error('Error al ejecutar la rifa:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo ejecutar la rifa. Por favor, inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}

onCountdownFinished(): void {
  this.showCountdown = false;

  // Asegurarse de usar la cantidad correcta
  const totalNumbers = this.availableNumbers.length;
  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * numbers.length);
  const winningNumber = numbers[randomIndex];

  console.log('Cantidad de números disponibles:', totalNumbers);
  console.log('Arreglo de números válidos:', numbers);
  console.log('Índice aleatorio generado:', randomIndex);
  console.log('🎯 Número ganador generado:', winningNumber);

  // Buscar al participante que reservó el número
  const winningParticipantObj = this.participantes.find(
    p => p.reservedNumber === winningNumber && p.raffleId === this.selectedRaffle?.id
  );

  const winningParticipant = winningParticipantObj
    ? `${winningParticipantObj.name} ${winningParticipantObj.lastName}`
    : "No ha sido reservado";

  const winningDataEntry = {
    raffleId: this.selectedRaffle!.id!,
    winningNumber: winningNumber,
    winningParticipant: winningParticipant
  };

  // Guardar en localStorage
  let winningData: any[] = [];
  const storedData = localStorage.getItem('winningData');
  if (storedData) {
    try {
      winningData = JSON.parse(storedData);
      if (!Array.isArray(winningData)) winningData = [];
    } catch (e) {
      console.error('Error al parsear winningData:', e);
    }
  }

  const existingIndex = winningData.findIndex(entry => entry.raffleId === this.selectedRaffle!.id!);
  if (existingIndex !== -1) {
    winningData[existingIndex] = winningDataEntry;
  } else {
    winningData.push(winningDataEntry);
  }
  localStorage.setItem('winningData', JSON.stringify(winningData));

  this.winningNumber = winningNumber;
  this.winningParticipant = winningParticipant;
  this.winningRaffleId = this.selectedRaffle?.id ?? null;

  // --- ✅ Aquí la parte nueva que tú pediste:
  if (!winningParticipantObj) {
    Swal.fire({
      title: 'Sorteo sin ganador',
      text: `El número ganador es ${winningNumber}, pero no ha sido reservado por ningún participante. La rifa sigue activa y debe volver a ejecutarse.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
    return; // 👉 Salimos, NO actualizamos la rifa como terminada
  }

  // Si hubo ganador, terminar la rifa
  const updatedRaffle = { ...this.selectedRaffle, active: false };
  this.raffleService.updateRaffle(this.selectedRaffle!.id!, updatedRaffle).subscribe({
    next: (updated) => {
      console.log('✅ Rifa ejecutada:', updated);
      Swal.fire({
        title: 'Sorteo Ejecutado!',
        text: 'El número ganador es: ' + winningNumber +
              (winningParticipantObj ? ('. Ganador: ' + winningParticipant) : '. Este número no fue reservado.'),
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        const index = this.userRaffles.findIndex(r => r.id === updated.id);
        if (index !== -1) this.userRaffles[index] = updated;

        this.updateRafflesByStatus();
        this.loadWinningInfo();
      });
    },
    error: (error) => {
      console.error('Error al ejecutar la rifa:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo ejecutar la rifa. Por favor, inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}


updateRafflesByStatus(): void {
  console.log('Datos de userRaffles:', this.userRaffles);
  this.activeRaffles = this.userRaffles.filter((raffle) => raffle.active);
  this.completedRaffles = this.userRaffles.filter((raffle) => !raffle.active);
  console.log('Rifas activas:', this.activeRaffles);
  console.log('Rifas terminadas:', this.completedRaffles);
}


compartirRifa1(raffle: any) {
  this.router.navigate(['/datos-rifa', raffle.id], { state: { raffle } });
}

compartirRifa(raffle: any) {
  this.router.navigate(['/external-raffle', raffle.id], { state: { raffle } });
}


  showDialog0(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const cantidadRifasPermitidas = currentUser.cantidadRifas || 1; // Si no hay un valor, se asume 1 como mínimo

    // Verificar si el usuario NO es VIP y ya tiene al menos una rifa creada
    if (!this.isVip && this.activeRaffles.length >= 1) {
      console.error('Error: Los usuarios no VIP solo pueden crear una rifa.');

      Swal.fire({
        title: 'Límite alcanzado',
        text: 'Los usuarios que no son VIP solo pueden tener una rifa activa.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    // Verificar si el usuario VIP ha alcanzado su límite de rifas permitidas
    if (this.isVip && this.userRaffles.length >= cantidadRifasPermitidas) {
      console.error('Error: Has alcanzado el límite de rifas permitidas según tu código VIP.');

      Swal.fire({
        title: 'Límite alcanzado',
        text: `Ya has alcanzado el número máximo de ${cantidadRifasPermitidas} rifas permitidas según tu código VIP.`,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    // Si pasa la validación, abrir el modal normalmente
    this.displayDialog = true;
  }

  showDialog(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Si no existe la propiedad 'cantidadRifas' se asume que el usuario solo puede tener 1 rifa
    const cantidadRifasPermitidas = currentUser.cantidadRifas || 1;

    // En lugar de solo contar las rifas activas, se cuenta el total de rifas (activas + terminadas)
    const totalRifas = this.userRaffles ? this.userRaffles.length : 0;

    // Si el usuario NO es VIP y ya tiene al menos una rifa (activa o terminada), se bloquea la apertura del modal
    if (!this.isVip && totalRifas >= 1) {
      console.error('Error: Los usuarios no VIP solo pueden crear una rifa.');
      Swal.fire({
        title: 'Límite alcanzado',
        text: 'Los usuarios que no son VIP solo pueden tener una rifa activa o terminada.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Para usuarios VIP, se verifica si han alcanzado el límite (tomando en cuenta todas sus rifas)
    if (this.isVip && totalRifas >= cantidadRifasPermitidas) {
      console.error('Error: Has alcanzado el límite de rifas permitidas según tu código VIP.');
      Swal.fire({
        title: 'Límite alcanzado',
        text: `Ya has alcanzado el número máximo de ${cantidadRifasPermitidas} rifas permitidas según tu código VIP.`,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Si pasa la validación, se abre el modal normalmente
    this.displayDialog = true;
  }


  showProductDialog() {
    this.displayProductDialog = true;
  }

  // Ocultar modal de producto
  hideProductDialog() {
    this.displayProductDialog = false;
    this.displayDialog1 = false;
  }

  hideProductDialog1(): void {

    this.subida = false
    // Reinicia los arrays para que al volver a abrir se muestren inputs vacíos
    this.selectedFiles = [];
    this.previews = [];

    if (this.fileInputs) {
      this.fileInputs.forEach(input => input.nativeElement.value = '');
    }
  }

   // Abrir el modal
   abrirModal(): void {
    this.displayDialog1 = true;
    this.codigoVip= ''
  }

  openSubir() {
   this.subida = true
    }


//Este es para controlar la calidad de las imagenes
  onFileChange1(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const maxWidth = 1024;  // Cambia esto al valor que desees
        const maxHeight = 1024; // Cambia esto al valor que desees

        if (img.width > maxWidth || img.height > maxHeight) {
        //  alert(`La imagen supera la resolución permitida de ${maxWidth}x${maxHeight}px`);
          this.messageService.add({
            severity: 'error',
            summary: 'File Uploaded',
            detail: `La imagen supera la resolución permitida de ${maxWidth}x${maxHeight}px`,
            life: 1000

          });
          input.value = ""; // Resetea el input para que el usuario pueda elegir otra imagen
        } else {
          this.selectedFiles[index] = file;

          // Leer la imagen para la vista previa
          const reader = new FileReader();
          reader.onload = (e) => {
            this.previews[index] = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        URL.revokeObjectURL(img.src); // Liberar memoria
      };
    }
  }


  onFileChange(event: Event, index: number) {
    // Restricción: solo se permiten 4 imágenes en total.
    // Si el índice es mayor o igual a 4, muestra un error y no procesa el archivo.
    if (index >= 3) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo puedes subir 4 imágenes para el producto',
        life: 3000
      });
      return;
    }

    // Adicionalmente, si el array de imágenes del producto ya tiene 4 elementos, muestra error.
    if (this.productData.imagenes && this.productData.imagenes.length >= 4) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo puedes subir 4 imágenes para el producto',
        life: 3000
      });
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const maxWidth = 1024;  // Resolución máxima permitida
        const maxHeight = 1024; // Resolución máxima permitida

        if (img.width > maxWidth || img.height > maxHeight) {
          this.messageService.add({
            severity: 'error',
            summary: 'Advertencia',
            detail: `La imagen supera la resolución permitida de ${maxWidth}x${maxHeight}px`,
            life: 3000
          });
          input.value = ""; // Resetea el input
        } else {
          // Asigna el archivo al slot indicado
          this.selectedFiles[index] = file;

          // Lee la imagen para mostrar vista previa
          const reader = new FileReader();
          reader.onload = (e) => {
            this.previews[index] = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        URL.revokeObjectURL(img.src); // Libera memoria
      };
    }
  }


  removeSelectedImage(index: number): void {
    this.selectedFiles[index] = null;
    this.previews[index] = null;
    if (this.fileInputs) {
      this.fileInputs.forEach(input => input.nativeElement.value = '');
    }
  }

  clearFile(index: number): void {
    this.previews[index] = null;
    this.selectedFiles[index] = null;
  }

  shareOnWhatsApp(): void {
    const url = 'www.metroapp.site';
    const text = `Necesito un codigo VIP. ${url}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`; window.location.href = whatsappUrl;
  }


onSubmit0(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');

    return;
  }
 // Valida que se haya agregado un producto a la rifa
 if (!this.productData || !this.productData.nombre) {
  this.messageService.add({
    severity: 'error',
    summary: 'Error en el producto',
    detail: 'Debe agregar un producto correctamente antes de guardar la rifa.',
    life: 2000
  });
  return;
}


  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  const requestBody = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: this.newRaffle.cantidadParticipantes,
    fechaSorteo: this.newRaffle.fechaSorteo,
    usuario: { id: this.userId },
    producto: {
      nombre: this.productData.nombre,
      descripcion: this.productData.descripcion,
      imagenes: this.productData.imagenes,
    },
    active: true,
    code: this.newRaffle.code,
    precio: this.newRaffle.precio
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('Rifa creada con éxito:', response);
        this.activeRaffles.unshift(response); // Se actualiza sin refrescar la pantalla
        this.loadUserId();
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
            customClass: {
      popup: 'my-swal-popup'
    }
        });

        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };

      },
      error: (error) => {
        console.error('Error al crear la rifa:', error);
        let errorMessage = 'No se pudo crear la rifa. Por favor, inténtelo nuevamente.';

        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        if (errorMessage.includes('Has alcanzado el límite de rifas permitidas.')) {
          Swal.fire({
            title: 'Límite alcanzado',
            text: 'Ya has alcanzado el número máximo de rifas permitidas según tu código VIP.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar',

          });
        }
      },
    });
    this.hideDialog();
    this.resetFormulario();
    this.productData = { nombre: '', descripcion: '', imagenes: [] };

}

/*
onSubmit1(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }

  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error en el producto',
      detail: 'Debe agregar un producto correctamente antes de guardar la rifa.',
      life: 2000
    });
    return;
  }

  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }

  const requestBody = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: this.newRaffle.cantidadParticipantes,
    fechaSorteo: this.newRaffle.fechaSorteo,
    usuario: { id: this.userId },
    producto: {
      nombre: this.productData.nombre,
      descripcion: this.productData.descripcion,
      imagenes: this.productData.imagenes,
    },
    active: true,
    code: this.newRaffle.code,
    precio: this.newRaffle.precio
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      switchMap((response) => {
        console.log('Rifa creada con éxito:', response);
        this.activeRaffles.unshift(response);
        return this.raffleService.generarImagenRifa(response.id);
      }),
      tap((imageUrl) => {
        console.log('Imagen generada:', imageUrl);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada con su imagen generada.',
          icon: 'success',
          imageUrl: imageUrl, // Muestra la imagen generada en el modal
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
      })
    )
    .subscribe({
      next: () => {
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };
      },
      error: (error) => {
        console.error('Error al generar la imagen de la rifa:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo generar la imagen de la rifa.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      },
    });
}*/

onSubmit(): void {
  if (!this.validarFormularioRifa()) {
    console.error('El formulario no es válido.');
    return;
  }
  if (!this.productData || !this.productData.nombre) {
    this.messageService.add({ severity: 'error', summary: 'Error en el producto', detail: 'Debe agregar un producto correctamente antes de guardar la rifa.', life: 2000 });
    return;
  }
  if (this.isVip && !this.codigoVip) {
    console.error('Código VIP no válido');
    return;
  }




  const requestBody = {
    nombre: this.newRaffle.nombre,
    cantidadParticipantes: this.newRaffle.cantidadParticipantes,
    fechaSorteo: this.newRaffle.fechaSorteo,
    usuario: { id: this.userId },
    producto: {
      nombre: this.productData.nombre,
      descripcion: this.productData.descripcion,
      imagenes: this.productData.imagenes
    },
    active: true,
    code: this.newRaffle.code,
    precio: this.newRaffle.precio
  };

  console.log('Cuerpo de la solicitud:', requestBody);

  const createRaffle$ = this.isVip && this.codigoVip
    ? this.raffleService.crearRifaConCodigoVip(requestBody, this.codigoVip)
    : this.raffleService.crearRifa(requestBody);

  createRaffle$
    .pipe(
      tap((response) => {
        console.log('Rifa creada con éxito:', response);
        this.activeRaffles.unshift(response);
        this.newlyCreatedRaffle = response; // Guardamos la rifa creada para el banner
        console.log('Datos de la rifa en newlyCreatedRaffle:', this.newlyCreatedRaffle);
        this.loadUserId();
      })
    )
    .subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rifa creada y añadida a las rifas activas.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { popup: 'my-swal-popup' }
        });
        this.hideDialog();
        this.resetFormulario();
        this.productData = { nombre: '', descripcion: '', imagenes: [] };

        if (this.mainEditor) {
          this.mainEditor.nativeElement.innerHTML = '';
        }
      },
      error: (error) => {
        console.error('Error al crear la rifa:', error);
        let errorMessage = 'No se pudo crear la rifa. Por favor, inténtelo nuevamente.';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        if (errorMessage.includes('Has alcanzado el límite de rifas permitidas.')) {
          Swal.fire({ title: 'Límite alcanzado', text: 'Ya has alcanzado el número máximo de rifas permitidas según tu código VIP.', icon: 'warning', confirmButtonText: 'Aceptar' });
        } else {
          Swal.fire({ title: 'Error', text: errorMessage, icon: 'error', confirmButtonText: 'Aceptar' });
        }
      },
    });
}




// Método reutilizable para mostrar mensajes
private mostrarMensaje(icono: 'success' | 'error' | 'warning', titulo: string, mensaje: string): void {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: icono,
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'my-swal-popup'
    }
  });
}



  isValid1(): boolean {
    return (
      this.newRaffle.nombre.trim() !== '' &&
      this.newRaffle.cantidadParticipantes > 0 &&
      this.productData.nombre.trim() !== '' &&
      this.productData.descripcion.trim() !== '' &&
      this.productData.imagenes.length > 0
    );
  }

  isValid(): boolean {
    if (
      !this.newRaffle.nombre || this.newRaffle.nombre.trim() === '' ||
      !this.newRaffle.cantidadParticipantes || this.newRaffle.cantidadParticipantes <= 0 ||
      !this.newRaffle.fechaSorteo ||
      !this.productData.nombre || this.productData.nombre.trim() === '' ||
      !this.productData.descripcion || this.productData.descripcion.trim() === '' ||
      !this.productData.imagenes || this.productData.imagenes.length === 0
    ) {
      return false;
    }
    return true;
  }


  hideDialog(): void {
    this.displayDialog = false;

      }


      resetFormulario() {
        this.newRaffle = {
          nombre: '',
          cantidadParticipantes: 0,
          fechaSorteo: new Date(),
          usuario: this.userId,
          producto: {} as Producto,
          active: true,
          precio: 0
        };

        // Solo borrar el código VIP si el usuario NO es VIP
        if (!this.isVip) {
          this.codigoVip = '';
        }
      }

      validarFormularioProducto(): boolean {
        let mensajeError = '';

        if (!this.productData.nombre || this.productData.nombre.trim().length === 0) {
          mensajeError += '⚠️ El nombre del producto es obligatorio.\n';
        }

        if (!this.productData.descripcion || this.productData.descripcion.trim().length === 0) {
          mensajeError += '⚠️ La descripción del producto es obligatoria.\n';
        } else if (this.productData.descripcion.length > 1500) {
          mensajeError += '⚠️ La descripción no puede superar los 1500 caracteres.\n';
        }

        if (!this.productData.imagenes || this.productData.imagenes.length === 0) {
          mensajeError += '⚠️ Debes agregar al menos una imagen del producto.\n';
        }

        if (mensajeError) {
          this.messageService.add({
            severity: 'error',
            summary: 'Errores en el producto',
            detail: mensajeError,
            life: 5000
          });
          return false;
        }

        return true;
      }

      validarFormularioRifa(): boolean {
        let mensajeError = '';

        if (!this.newRaffle.nombre || this.newRaffle.nombre.trim().length === 0) {
          mensajeError += '⚠️ El nombre del sorteo es obligatorio.\n';
        }

        if (!this.newRaffle.cantidadParticipantes || this.newRaffle.cantidadParticipantes <= 0) {
          mensajeError += '⚠️ La cantidad de participantes debe ser mayor a 0.\n';
        } else if (this.newRaffle.cantidadParticipantes > 100) {
          mensajeError += '⚠️ No pueden haber más de 100 participantes.\n';
        }

        if (!this.newRaffle.fechaSorteo) {
          mensajeError += '⚠️ La fecha del sorteo es obligatoria.\n';
        } else {
          const fechaIngresada = new Date(this.newRaffle.fechaSorteo);
          const fechaActual = new Date();
          if (fechaIngresada < fechaActual) {
            mensajeError += '⚠️ La fecha del sorteo debe ser futura.\n';
          }
        }

        if (!this.newRaffle.producto) {
          mensajeError += '⚠️ Debes agregar un producto antes de guardar la rifa.\n';
        }

        if (mensajeError) {
          this.messageService.add({
            severity: 'error',
            summary: 'Errores en la rifa',
            detail: mensajeError,
            life: 5000
          });
          return false;
        }

        return true;
      }




      saveProductData(): void {
        if (!this.validarFormularioProducto()) {
          return;
        }

        this.newRaffle.producto = this.productData;
        console.log('Datos del producto guardados:', this.productData);
        this.hideProductDialog();
      }

      saveProductData1(): void {
        this.newRaffle.producto = this.productData;
        console.log('Datos del producto guardados:', this.productData);
        this.hideProductDialog();

      }


      uploadProductImages1(): void {
        if (this.selectedFiles.length === 0) {
          console.warn('No hay imágenes para subir.');
          return;
        }

        this.uploading = true;

        this.raffleService.uploadImages(this.selectedFiles1).subscribe({
          next: (uploadedUrls) => {
            this.productData.imagenes.push(...uploadedUrls);
            this.selectedFiles = []; // Limpiar la selección después de subir
            this.uploading = false;
            console.log('Imágenes subidas correctamente:', this.productData.imagenes);
          },
          error: (error) => {
            console.error('Error al subir imágenes:', error);
            this.uploading = false;
          }
        });
      }


      uploadProductImage0(index: number): void {
        if (!this.selectedFiles[index]) {
          console.warn(`No hay imagen para subir en el slot ${index}.`);
          return;
        }

        this.uploading = true;

        // Llama al servicio enviando solo el archivo correspondiente en un array
        this.raffleService.uploadImages([this.selectedFiles[index]]).subscribe({
          next: (uploadedUrls: string[]) => {
            // Se asume que el servicio devuelve un array con la URL de la imagen subida
            this.productData.imagenes.push(...uploadedUrls);

            // Limpia el slot una vez subida la imagen
            this.selectedFiles[index] = null;
            this.previews[index] = null;
            this.uploading = false;
            console.log(`Imagen subida correctamente en el slot ${index}:`, uploadedUrls);
          },
          error: (error) => {
            console.error(`Error al subir la imagen del slot ${index}:`, error);
            this.uploading = false;
          }
        });
      }


      uploadProductImage(index: number): void {
        const file = this.selectedFiles[index];

        if (!file) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: `No hay imagen para subir en el slot ${index}.`,
            life: 1000
          });
          return;
        }

        this.uploading = true;

        this.raffleService.uploadImages([file]).subscribe({
          next: (uploadedUrls: string[]) => {
            this.productData.imagenes.push(...uploadedUrls);

            // Limpia el slot una vez subida la imagen
            this.selectedFiles[index] = null;
            this.previews[index] = null;
            this.uploading = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Imagen subida correctamente en el slot ${index}.`,
              life: 1000
            });
          },
          error: (error) => {
            this.uploading = false;

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al subir la imagen en el slot ${index}.`,
              life: 1000
            });
          }
        });
      }




      loadAllParticipantes0() {
        // Limpia los arrays antes de cargar los participantes
        this.participantes = [];
        this.numerosReservados = [];
        this.participanteService.getAllParticipantes().subscribe({
          next: (data) => {
            this.participantes = data;
            console.log('Participantes:', this.participantes);

            // Agrupar participantes por raffleId
            const participantesPorRifa = this.participantes.reduce((grupo, participante) => {
              const id = participante.raffleId;
              if (!grupo[id]) {
                grupo[id] = [];
              }
              grupo[id].push(participante);
              return grupo;
            }, {} as { [key: number]: Participante[] });

            // Imprimir en consola los participantes agrupados por rifa
            for (const raffleId in participantesPorRifa) {
              console.log(`Participantes para la rifa ver ${raffleId}:`, participantesPorRifa[raffleId]);
            }
          },
          error: (err) => console.error('Error al cargar participantes:', err)
        });
      }

      loadAllParticipantes1() {
        this.participantes = [];
        this.numerosReservados = [];

        this.participanteService.getAllParticipantes().subscribe({
          next: (data) => {
            this.participantes = data;
            console.log('📦 Todos los participantes:', this.participantes);

            // Filtra los participantes solo de la rifa seleccionada
            const participantesActuales = this.participantes.filter(
              p => p.raffleId === this.selectedRaffle?.id
            );
            console.log(`🎯 Participantes de la rifa ${this.selectedRaffle?.id}:`, participantesActuales);

            this.participantes = participantesActuales; // Sobrescribe solo con los de la rifa actual

            // Carga la rifa actual para obtener su cantidad de participantes
            this.raffleService.obtenerRifaPorId(this.selectedRaffle.id!).subscribe({
              next: (raffle) => {
                const totalParticipantes = parseInt(raffle.cantidadParticipantes, 10) || 10;
                this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
                console.log(`🎲 Números disponibles para la rifa ${raffle.id}:`, this.availableNumbers);
              },
              error: (err) => {
                console.error(`❌ Error al obtener rifa con ID ${this.selectedRaffle.id}:`, err);
              }
            });
          },
          error: (err) => console.error('Error al cargar participantes:', err)
        });
      }

      loadAllParticipantes2() {
        this.participantes = [];
        this.numerosReservados = [];

        this.participanteService.getAllParticipantes().subscribe({
          next: (data) => {
            this.participantes = data;
            console.log('Participantes:', this.participantes);

            // Agrupar participantes por raffleId
            const participantesPorRifa = this.participantes.reduce((grupo, participante) => {
              const id = participante.raffleId;
              if (!grupo[id]) {
                grupo[id] = [];
              }
              grupo[id].push(participante);
              return grupo;
            }, {} as { [key: number]: Participante[] });

            // Iterar sobre cada grupo y obtener la rifa para capturar cantidadParticipantes
            for (const raffleId in participantesPorRifa) {
              console.log(`Participantes para la rifa ${raffleId}:`, participantesPorRifa[raffleId]);

              // Aquí se carga la rifa por ID para obtener la cantidad de participantes
              this.raffleService.obtenerRifaPorId(+raffleId).subscribe({
                next: (raffle) => {
                  console.log(`Cantidad de participantes para la rifa ${raffleId}:`, raffle.cantidadParticipantes);

                  // Si quieres crear availableNumbers, hazlo aquí también:
                  const totalParticipantes = parseInt(raffle.cantidadParticipantes, 10) || 10;
                   this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
                  console.log(` Números disponibles para la rifa ${raffleId}:`, this.availableNumbers);

                  // Aquí puedes guardar esos números si los necesitas para algo después
                  // Por ejemplo:
                  // this.availableNumbersPorRifa[raffleId] = availableNumbers;
                },
                error: (err) => {
                  console.error(`❌ Error al obtener rifa con ID ${raffleId}:, err`);
                }
              });
            }
          },
          error: (err) => console.error('Error al cargar participantes:', err)
        });
      }

// dashboard.component.ts (sólo el método, dentro de tu DashboardComponent)

loadAllParticipantes(): void {
  // Primero borramos cualquier dato previo
  this.participantesPorRifa = {};
  this.numerosReservadosPorRifa = {};
  this.availableNumbersMap = {};

  this.participanteService.getAllParticipantes().subscribe({
    next: (all) => {
      console.log('📦 Todos los participantes:', all);

      // 1) Agrupo participantes por raffleId
      const grouped = all.reduce((grp, p) => {
        (grp[p.raffleId] = grp[p.raffleId] || []).push(p);
        return grp;
      }, {} as { [key: number]: Participante[] });

      // 2) Para cada rifa del usuario, proceso solo si tengo participantes
      this.userRaffles.forEach(r => {
        const id = r.id!;
        const parts = grouped[id] || [];
        this.participantesPorRifa[id] = parts;
        console.log(`🎯 Participantes de la rifa ${id}:`, parts);

        // 3) Extraigo sus números reservados
        const reserved = parts.map(p => p.reservedNumber);
        this.numerosReservadosPorRifa[id] = reserved;
        console.log(`🔢 Reservados de la rifa ${id}:`, reserved);

        // 4) Cargo la propia rifa para leer cantidadParticipantes
        this.raffleService.obtenerRifaPorId(id).subscribe({
          next: (raffle) => {
            const cap = parseInt(raffle.cantidadParticipantes as any, 10) || reserved.length;
            console.log(`📦 capacidad rifa ${id}:`, cap);

            // 5) Genero el array [1…cap]
            const nums = Array.from({ length: cap }, (_, i) => i + 1);
            this.availableNumbersMap[id] = nums;
            console.log(`🔢 disponibles rifa ${id}:`, nums);
          },
          error: err => console.error(`❌ fallo al cargar rifa ${id}:`, err)
        });
      });
    },
    error: err => console.error('❌ Error al cargar participantes:', err)
  });
}


loadAllParticipantsForMyRaffles0(): void {
  if (!this.userId) {
    console.error('El userId no está definido.');
    return;
  }

  // 1) Primero cargamos las rifas del usuario...
  this.raffleService.getRafflesByUser(this.userId).subscribe({
    next: (rifas: Raffle[]) => {
      this.userRaffles = rifas;
      console.log('Rifas del usuario:', this.userRaffles)
      this.updateRafflesByStatus();

      // Extraemos solo los IDs de esas rifas
      const misRifaIds = this.userRaffles.map(r => r.id!) as number[];

      // 2) Ahora obtenemos todos los participantes de la API
      this.participanteService.getAllParticipantes().subscribe({
        next: (todos) => {
          // 3) Filtramos solo los que pertenecen a mis rifas
          const filtrados = todos.filter(p => misRifaIds.includes(p.raffleId));

          // 4) Agrupamos por raffleId
          this.participantesPorMisRifas = filtrados.reduce((acc, p) => {
            if (!acc[p.raffleId]) acc[p.raffleId] = [];
            acc[p.raffleId].push(p);
            return acc;
          }, {} as Record<number, Participante[]>);

          // 5) Imprimimos en consola
          for (const id of misRifaIds) {
            console.log(`Participantes rifa ${id}:`, this.participantesPorMisRifas[id] || []);
          }
        },
        error: (err) => console.error('Error al cargar todos los participantes:', err)
      });
    },
    error: (err) => console.error('Error al cargar rifas del usuario:', err)
  });
}

private loadAllParticipantsForMyRaffles(): void {

  this.participanteService.getAllParticipantes().subscribe({
    next: all => {
      // sólo los participantes de mis rifas activas y completadas
      const myIds = this.userRaffles.map(r => r.id!) as number[];
      this.participantsByRaffle = all
        .filter(p => myIds.includes(p.raffleId))
        .reduce((m, p) => {
          if (!m.has(p.raffleId)) m.set(p.raffleId, []);
          m.get(p.raffleId)!.push(p);
          return m;
        }, new Map<number, Participante[]>());
      console.log('Map de participantes por rifa:', this.participantsByRaffle);
    },
    error: err => console.error('Error cargando todos los participantes:', err)
  });
}

      mostrarParticipantes0(raffleId: number): void {
        this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
          next: (data) => {
            this.participantes = data;
            console.log(`Participantes para la rifa ${raffleId}:`, this.participantes);
            this.datosParticipantes = true;  // Abre el modal
          },
          error: (err) => {
            console.error(`Error al cargar participantes para la rifa ${raffleId}:`, err);
          }
        });
      }

      cerrarModalParticipantes(){
        this.datosParticipantes = false
      }

      mostrarParticipantes(raffleId: number): void {
        this.participanteService.getParticipantesByRaffleId(raffleId).subscribe({
          next: (data) => {
            this.participantes = data;
            console.log(`Participantes para la rifa ${raffleId}:`, this.participantes);

            // Cargar la rifa para obtener la cantidad de participantes
            this.raffleService.obtenerRifaPorId(raffleId).subscribe({
              next: (raffle) => {
                const totalParticipantes = parseInt(raffle.cantidadParticipantes, 10) || 10;
                this.availableNumbers = Array.from({ length: totalParticipantes }, (_, i) => i + 1);
                console.log(`Números disponibles para la rifa ${raffleId}:`, this.availableNumbers);
              },
              error: (err) => console.error(`Error al cargar la rifa ${raffleId}:`, err)
            });

            this.datosParticipantes = true; // Abre el modal
          },
          error: (err) => console.error(`Error al cargar participantes para la rifa ${raffleId}:`, err)
        });
      }

      eliminarParticipante0(id: number): void {
        this.participanteService.deleteParticipante(id).subscribe({
          next: () => {
            // Filtrar la lista local para eliminar el participante borrado
            this.participantes = this.participantes.filter(p => p.id !== id);
            // Actualizar la lista de números reservados
            this.numerosReservados = this.participantes
              .filter(p => p.reservedNumber !== null)
              .map(p => p.reservedNumber);

            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Participante eliminado correctamente',
              life: 1500
            });

          },
          error: (err) => {
            console.error('Error al eliminar el participante:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el participante',
              life: 3000
            });
          }
        });
      }



      eliminarParticipante(id: number): void {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta seguro que desea eliminar este participante',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.participanteService.deleteParticipante(id).subscribe({
              next: () => {
                this.participantes = this.participantes.filter(p => p.id !== id);
                this.numerosReservados = this.participantes
                  .filter(p => p.reservedNumber !== null)
                  .map(p => p.reservedNumber);

                Swal.fire({
                  title: 'Eliminado',
                  text: 'El participante ha sido eliminado correctamente',
                  icon: 'success',
                  timer: 1500,
                  confirmButtonText: 'Aceptar',
                });
              },
              error: (err) => {
                console.error('Error al eliminar el participante:', err);
                Swal.fire({
                  title: 'Error',
                  text: 'No se pudo eliminar el participante',
                  icon: 'error',
                  timer: 3000,
                  confirmButtonText: 'Aceptar',
                });
              }
            });
          }
        });
        this.cerrarModalParticipantes()

      }

      eliminarParticipante1(id: number): void {
        this.participanteService.deleteParticipante(id).subscribe({
          next: () => {
            console.log('Participante eliminado:', id);
            // No es necesario llamar a refresh aquí, ya que el BehaviorSubject actualizará automáticamente
          },
          error: (err) => console.error('Error al eliminar participante:', err)
        });
      }

      ngOnDestroy(): void {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }

}
