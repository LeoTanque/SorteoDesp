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


// Mapa de participantes por rifa
participantesPorRifa: { [raffleId: number]: Participante[] } = {};
// Mapa de números reservados por rifa
numerosReservadosPorRifa: { [raffleId: number]: number[] } = {};

availableNumbersMap: { [raffleId: number]: number[] } = {};


  showCountdown: boolean = false;


  selectedRaffleId: number | null = null;
  participantesPorMisRifas: Record<number, Participante[]> = {};
  participantsByRaffle = new Map<number, Participante[]>();
  cantidadRifasPermitidas:any
  constructor(
    private authService: AuthenticationService,private cdRef: ChangeDetectorRef,
    private router:Router,
    private raffleService: RaffleService,
    private messageService: MessageService,
    private participanteService: ParticipanteService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private raffleExecutionService: RaffleExecutionService,


  ){ }

  ngOnInit(): void {
    window.addEventListener('storage', this.onStorageEvent.bind(this));
    this.loadUserId()
    this.loadWinningInfo();

    this.activeRaffles = this.activeRaffles.map(raffle => {
      raffle.producto.descripcion = this.sanitizer.bypassSecurityTrustHtml(raffle.producto.descripcion) as unknown as string;
      return raffle;
    });


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


private onStorageEvent(event: StorageEvent) {
  if (event.key === 'participantsUpdated') {
    console.log('🎉 Detectada nueva reserva en componente externo, recargando participantes…');
    this.loadAllParticipantsForMyRaffles();
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






    logout0(): void {
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

          // Si es VIP, guarda sus datos VIP persistentes
          if (currentUser && currentUser.esVip && currentUser.id) {
            const datosVip = {
              esVip: currentUser.esVip,
              codigoVip: currentUser.codigoVip,
              cantidadRifas: currentUser.cantidadRifas,
            };
            localStorage.setItem(`vip_${currentUser.id}`, JSON.stringify(datosVip));
          }

          // Limpiar solo currentUser (y otros datos de sesión si es necesario)
          this.authService.logout();
          localStorage.removeItem('currentUser');
          // O remove cualquier otro token si lo estás usando

          this.router.navigate(['/login']);
          Swal.fire('¡Cerrado!', 'Tu sesión ha sido cerrada', 'success');
        }
      });
    }




  loadUserId0(): void {
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

  loadUserId(): void {
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser && currentUser.id) {
      // Intentamos rescatar los datos VIP de la clave vip_{id}
      const vipDataRaw = localStorage.getItem(`vip_${currentUser.id}`);
      if (vipDataRaw) {
        try {
          const vipData = JSON.parse(vipDataRaw);
          // Inyectamos siempre estos tres valores
          currentUser.esVip = vipData.esVip;
          currentUser.codigoVip = vipData.codigoVip;
          currentUser.cantidadRifas = vipData.cantidadRifas;
          // Sobrescribimos currentUser en localStorage para que esté completo
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } catch {
          console.warn('No se pudo parsear vipData de localStorage');
        }
      }

      this.userId   = currentUser.id;
      this.codigoVip = currentUser.codigoVip || null;
      this.isVip    = currentUser.esVip === true;

      console.log('ID del usuario logueado:',   this.userId);
      console.log('Código VIP del usuario:',     this.codigoVip);
      console.log('Es VIP?:',                    this.isVip);
      console.log('Cantidad de rifas permitidas:', currentUser.cantidadRifas);

      this.loadUserRaffles();
    } else {
      console.error('No se encontró el usuario logueado en localStorage');
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

        //this.asignarCodigoVip(this.cantidadRifas);
        this.asignarCodigoVipAlUsuario(this.cantidadRifas);
       // this.loadUserId()
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


private asignarCodigoVipAlUsuario(cantidadRifas: number): void {
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    console.error('No hay usuario logueado en localStorage');
    return;
  }

  // 4. Parseamos y actualizamos el usuario
  const currentUser = JSON.parse(currentUserRaw);
  currentUser.esVip = true;
  currentUser.codigoVip = this.codigoVip.trim();
  currentUser.cantidadRifas = cantidadRifas;

  // 5. Guardamos el currentUser actualizado
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // 6. Guardamos también un objeto VIP por separado para persistirlo incluso tras logout/clear()
  const vipData = {
    esVip: true,
    codigoVip: currentUser.codigoVip,
    cantidadRifas: cantidadRifas
  };
  localStorage.setItem(`vip_${currentUser.id}`, JSON.stringify(vipData));

  // 7. Refrescamos tus variables de componente
  this.isVip = true;
  this.cantidadRifasPermitidas = cantidadRifas;

  this.mostrarMensaje('success', '¡VIP activado!', `Tienes permiso para crear ${cantidadRifas} rifas.`);
  this.cdRef.detectChanges();
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


validarCantidadParticipantes() {
  this.cantidadInvalida = this.newRaffle.cantidadParticipantes > 100;
}

validarDescripcion() {
  this.descripcionInvalida = this.productData.descripcion.length > 1500;
}






executeRaffle(event: Event | null, raffle: Raffle): void {
  if (event) event.stopPropagation();

  // 1) Recarga en caliente los participantes de esta rifa
  this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
    next: participantesRifa => {
      console.log(`Participantes recargados para rifa ${raffle.id}:`, participantesRifa);

      if (participantesRifa.length === 0) {
        Swal.fire({
          title: 'No hay participantes',
          text: 'No se puede ejecutar la rifa sin participantes registrados.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      // 2) Abre confirmación
      Swal.fire({
        title: '¿Ejecutar rifa?',
        text: 'Esta acción ejecutará el sorteo y desactivará la rifa. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, ejecutar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          // 3) Guarda la selección y arranca la cuenta
          this.selectedRaffle = raffle;
          this.showCountdown = true;
          this.raffleExecutionService.startCountdown(5);
        }
      });
    },
    error: err => {
      console.error(`Error recargando participantes para rifa ${raffle.id}:`, err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo verificar los participantes. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}





checkRifasParaAutoEjecutar(): void {
  const now = Date.now();

  this.activeRaffles.forEach(raffle => {
    // 1) Vuelve a recargar participantes desde el backend
    this.participanteService.getParticipantesByRaffleId(raffle.id!).subscribe({
      next: participantesRifa => {
        console.log(`✅ Participantes recargados para rifa ${raffle.id}:`, participantesRifa);

        // 2) Evalúa condiciones con datos actualizados
        const raffleTime = new Date(raffle.fechaSorteo).getTime();
        const overdue = now >= raffleTime;
        const allReserved = participantesRifa.length === Number(raffle.cantidadParticipantes);

        // 3) Si está activa y cumple alguna de las dos condiciones
        if (raffle.active && participantesRifa.length > 0 && (overdue || allReserved)) {
          console.log(`🚀 Auto–ejecutando rifa ${raffle.id}: vencida? ${overdue}, completa? ${allReserved}`);
          this.selectedRaffle = raffle;
          this.showCountdown = true;
          this.raffleExecutionService.startCountdown(5);
        } else if (raffle.active && participantesRifa.length === 0 && overdue) {
          console.log(`⚠️ Rifa ${raffle.id} vencida sin participantes.`);
        }
      },
      error: err => {
        console.error(`❌ No se pudo recargar participantes para rifa ${raffle.id}:`, err);
      }
    });
  });
}



onCountdownFinished(): void {
  this.showCountdown = false;

  if (!this.selectedRaffle) {
    console.error('No hay rifa seleccionada.');
    return;
  }

  // 1) Recalcula totalNumbers **directo desde la rifa** para evitar stale availableNumbers
  const total = Number(this.selectedRaffle.cantidadParticipantes) || 0;
  const numbers = Array.from({ length: total }, (_, i) => i + 1);
  const randomIndex = Math.floor(Math.random() * numbers.length);
  const winningNumber = numbers[randomIndex];
  console.log('Cantidad de números disponibles:', total);
  console.log('Arreglo de números válidos:', numbers);
  console.log('Índice aleatorio generado:', randomIndex);


  console.log('🎯 Número ganador generado:', winningNumber);

  // 2) Vuelve a recargar participantes para esta rifa (por si hubo cambios durante la cuenta)
  this.participanteService.getParticipantesByRaffleId(this.selectedRaffle.id!).subscribe({
    next: participantes => {
      console.log(`Participantes al cierre de rifa ${this.selectedRaffle!.id}:`, participantes);

      const ganadorObj = participantes.find(p => p.reservedNumber === winningNumber);
      const ganadorTexto = ganadorObj
        ? `${ganadorObj.name} ${ganadorObj.lastName}`
        : 'No ha sido reservado';

      // 3) Guarda en localStorage
      const entry = {
        raffleId: this.selectedRaffle!.id!,
        winningNumber,
        winningParticipant: ganadorTexto
      };
      const prev = JSON.parse(localStorage.getItem('winningData') || '[]');
      const idx = prev.findIndex((e: any) => e.raffleId === this.selectedRaffle!.id!);
      if (idx > -1) prev[idx] = entry; else prev.push(entry);
      localStorage.setItem('winningData', JSON.stringify(prev));

      // 4) Mensajes finales
      if (!ganadorObj) {
        Swal.fire({
          title: 'Sorteo sin ganador',
          text: `El número ganador es ${winningNumber}, pero no ha sido reservado. La rifa sigue activa.`,
          icon: 'info',
          confirmButtonText: 'Aceptar'
        });
        return;
      }

      // 5) Cierra la rifa si hay ganador
      const updated = { ...this.selectedRaffle!, active: false };
      this.raffleService.updateRaffle(this.selectedRaffle!.id!, updated).subscribe({
        next: r => {
          Swal.fire({
            title: '¡Sorteo Ejecutado!',
            text: `Número: ${winningNumber}. Ganador: ${ganadorTexto}.`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.userRaffles = this.userRaffles.map(ur => ur.id === r.id ? r : ur);
            this.updateRafflesByStatus();
            this.loadWinningInfo();
          });
        },
        error: e => {
          console.error('Error al cerrar rifa:', e);
          Swal.fire({ title: 'Error', text: 'No se pudo cerrar la rifa.', icon: 'error' });
        }
      });
    },
    error: e => {
      console.error('Error al recargar participantes final:', e);
      Swal.fire({ title: 'Error', text: 'No se pudo verificar reservas finales.', icon: 'error' });
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




compartirRifa(raffle: any) {
  this.router.navigate(['/external-raffle', raffle.id], { state: { raffle } });
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








loadAllParticipantsForMyRaffles(): void {
  if (!this.userRaffles || this.userRaffles.length === 0) {
    console.warn('No hay rifas del usuario para cargar participantes.');
    return;
  }

  this.userRaffles.forEach((raffle) => {
    this.participanteService.getParticipantesByRaffleId(raffle.id).subscribe({
      next: (participantes) => {
        // Puedes agregar los participantes directamente a la rifa
        (raffle as any).participantes = participantes;
        console.log(`✅ Participantes cargados para la rifa ${raffle.id}:`, participantes);
      },
      error: (error) => {
        console.error(`❌ Error al cargar participantes para la rifa ${raffle.id}:`, error);
      }
    });
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
        window.removeEventListener('storage', this.onStorageEvent.bind(this));
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      }

}
