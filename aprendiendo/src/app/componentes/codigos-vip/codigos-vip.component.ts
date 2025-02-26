import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CodigoVip } from '../../interfaces/codigo-vip';
import { CodigoVipServiceService } from '../../services/codigo-vip-service.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-codigos-vip',
  standalone: true,
  imports: [CommonModule,  FormsModule, TableModule, ButtonModule, DropdownModule],
  templateUrl: './codigos-vip.component.html',
  styleUrl: './codigos-vip.component.scss'
})
export class CodigosVipComponent implements OnInit{
  codigosVip: CodigoVip[] = [];
  cantidadRifasOptions = [
    { label: '10 Rifas', value: 10 },
    { label: '15 Rifas', value: 15 },
    { label: '30 Rifas', value: 30 }
  ];
  cantidadRifas: number = 10;
  selectedCodigo!: CodigoVip;
  constructor(private codigoVipService: CodigoVipServiceService) {}

  ngOnInit(): void {
  this.obtenerCodigosVip()
  }

  obtenerCodigosVip() {
    this.codigoVipService.obtenerCodigosVip().subscribe({
      next: (data) => {
        this.codigosVip = data;
        console.log('📋 Lista de Códigos VIP obtenidos:', this.codigosVip);
        Swal.fire({
          title: 'Códigos cargados',
          text: `Se han cargado ${this.codigosVip.length} códigos VIP correctamente.`,
          icon: 'success'
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener los códigos VIP:', err);
        Swal.fire({
          title: 'Error al cargar',
          text: 'No se pudieron cargar los códigos VIP. Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    });
  }

  generarCodigoVip() {
    this.codigoVipService.generarCodigoVip(this.cantidadRifas).subscribe({
      next: (res) => {
        const nuevoCodigo: any = { codigo: res.codigoVip, cantidadRifas: this.cantidadRifas, utilizado: false };
        this.codigosVip.push(nuevoCodigo);
        console.log('✅ Código VIP generado:', nuevoCodigo);
        Swal.fire({
          title: '¡Código generado!',
          text: `Se ha generado el código VIP: ${res.codigoVip} con ${this.cantidadRifas} rifas.`,
          icon: 'success'
        });
      },
      error: (err) => {
        console.error('❌ Error al generar el código VIP:', err);
        Swal.fire({
          title: 'Error al generar código',
          text: 'Hubo un problema al generar el código VIP. Inténtalo más tarde.',
          icon: 'error'
        });
      }
    });
  }

}
