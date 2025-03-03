import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { forkJoin, Subscription, tap } from 'rxjs';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { SidebarModule} from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Participante } from '../../interfaces/participante';
import { ParticipanteService } from '../../services/participante.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToolbarModule ,ReactiveFormsModule, FormsModule, DialogModule, ButtonModule, InputTextModule, TableModule,
    CalendarModule, InputTextareaModule, ListboxModule, FileUploadModule, CarouselModule, TagModule, SidebarModule, ToastModule ],
    providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;
  userName: string = '';
  userId!: any;
  daysLeft: number = 30;
  activeRaffles: Raffle[] = [];
  completedRaffles: Raffle[] = [];
  userRaffles: Raffle[] = [];

  newRaffle: Raffle = {
    nombre: '',
    cantidadParticipantes: 0,
    fechaSorteo: new Date(),
    usuario: this.userId, // Asigna el usuario actual aquí
    //producto: {} as Producto,
    producto: {
      nombre: '',
      descripcion: '',
      imagenes: [],

    },
    // Asigna el producto seleccionado aquí
    active: true
  };
  cantidadInvalida: boolean = false;
  descripcionInvalida: boolean = false;

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

  constructor(
    private authService: AuthenticationService,private cdRef: ChangeDetectorRef,
    private router:Router,
    private raffleService: RaffleService,
    private messageService: MessageService,
    private participanteService: ParticipanteService,
    private route: ActivatedRoute
  ){ }

  ngOnInit(): void {
    this.loadUserId()



   this.loadAllParticipantes();

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



  loadUserRaffles(): void {
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


executeRaffle(event: Event, raffle: Raffle): void {
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


  showDialog(): void {
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
  onFileChange(event: Event, index: number) {
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



  validarCantidadParticipantes(): void {
    this.cantidadInvalida = this.newRaffle.cantidadParticipantes > 100;
  }

  validarDescripcion(): void {
    this.descripcionInvalida = this.productData.descripcion.length > 1500;
    if (this.descripcionInvalida) {
      this.productData.descripcion = this.productData.descripcion.substring(0, 1500);
    }
  }




onSubmit(): void {
  if (!this.isValid()) {
    console.error('El formulario no es válido.');
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
    code: this.newRaffle.code
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



// Método reutilizable para mostrar mensajes
private mostrarMensaje(icono: 'success' | 'error' | 'warning', titulo: string, mensaje: string): void {
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: icono,
    confirmButtonText: 'Aceptar',
  });
}



  isValid(): boolean {
    return (
      this.newRaffle.nombre.trim() !== '' &&
      this.newRaffle.cantidadParticipantes > 0 &&
      this.productData.nombre.trim() !== '' &&
      this.productData.descripcion.trim() !== '' &&
      this.productData.imagenes.length > 0
    );
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
        };

        // Solo borrar el código VIP si el usuario NO es VIP
        if (!this.isVip) {
          this.codigoVip = '';
        }
      }



      saveProductData(): void {
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




      loadAllParticipantes() {
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
              console.log(`Participantes para la rifa ${raffleId}:`, participantesPorRifa[raffleId]);
            }
          },
          error: (err) => console.error('Error al cargar participantes:', err)
        });
      }

      mostrarParticipantes(raffleId: number): void {
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



}
