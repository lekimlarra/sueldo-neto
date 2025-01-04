import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseChartDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sueldo-neto';
    // Dummy data for the bar chart
    public barChartOptions: ChartOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Chart.js Bar Chart - Stacked'
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
    public barChartLabels: string[] = ['Seguridad Social empresa', "Seguridad Social trabajador", "IRPF", "Salario neto"];
    public barChartType: ChartType = 'bar';
    public barChartLegend = true;
    public barChartPlugins = [];
    
    public barChartData = {
      labels: this.barChartLabels,
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81],
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
      }/*,{
        label: 'My Second Dataset',
        data: [10, 10, 10, 10, 10, 10, 10],
        backgroundColor: [
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)',
          'rgba(12, 76, 204, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }*/]
    }
}
