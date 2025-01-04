import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseChartDirective, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sueldo-neto';
  // Property for two-way data binding
  public selectedPeriod: string = 'anual';
  public brutoNeto: string = 'bruto';
  public pagas: string = '12';
  public sueldo: number | null = null;

  calcularSSEmpresa(){
    const sse = {
      total: 0,
      contingenciasComunes: this.sueldo! * 0.236,
      desempleo: this.sueldo! * 0.055,
      contingenciasProfesionales: this.sueldo! * 0.035,
      formacion: this.sueldo! * 0.006,
      fogasa: this.sueldo! * 0.002
    }
    sse.total = sse.contingenciasComunes + sse.desempleo + sse.contingenciasProfesionales + sse.formacion + sse.fogasa;
    return sse;
  }

  calcularSSTrabajador(){
  }


  calcularIRPF(){
  }

  
  calcularNeto(){
  }

  actualizarGrafico(){
    console.log("Actualizando gráfico");
    this.barChartData.datasets[0].data = [this.calcularSSEmpresa().total, 59, 80, 81];
    console.log("this.dataSet:", this.dataSet)
    console.log("this.barChartData:", this.barChartData)
  }


  public dataSet: ChartDataset<'bar'>[] = [{
    data: [0, 0, 0, 0],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)'
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)'
    ],
    borderWidth: 1
  }];
  public barChartData = {
    labels: ['Seguridad Social empresa', "Seguridad Social trabajador", "IRPF", "Salario neto"],
    datasets: this.dataSet
  };
    public barChartOptions: ChartOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Distribution de tu salario',
        },
      },
      
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      }}
}
