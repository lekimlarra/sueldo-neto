import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartOptions,
  ChartType,
  ChartDataset,
  ChartTypeRegistry,
} from 'chart.js';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';
import { CommonModule } from '@angular/common';

interface FilaGasto {
  key: string;
  estado: number;
  ccaa: number;
  local: number;
  total: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BaseChartDirective, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'sueldo-neto';
  chart: any;
  // Property for two-way data binding
  public selectedPeriod: string = 'anual';
  public brutoNeto: string = 'bruto';
  public pagas: string = '12';
  public sueldo: number | null = null;

  calcularSSEmpresa(): any {
    const sse = {
      total: 0,
      contingenciasComunes: this.calcularSalarioBrutoAnutal() * 0.236,
      desempleo: this.calcularSalarioBrutoAnutal() * 0.055,
      contingenciasProfesionales: this.calcularSalarioBrutoAnutal() * 0.035,
      formacion: this.calcularSalarioBrutoAnutal() * 0.006,
      fogasa: this.calcularSalarioBrutoAnutal() * 0.002,
      // Mecanismo de Equidad Intergeneracional 2026: 0,90 % (0,75 % empresa, 0,15 % trabajador)
      mei: this.calcularSalarioBrutoAnutal() * 0.0075,
    };
    sse.total =
      sse.contingenciasComunes +
      sse.desempleo +
      sse.contingenciasProfesionales +
      sse.formacion +
      sse.fogasa +
      sse.mei;
    return sse;
  }

  results: any = {
    cuota_irpf: 0,
    cuota_segsocial: 0,
    sueldo_neto: 0,
    tipo_retencion_irpf: 0,
    total_pagado_empresa: 0,
  };

  aproximarBrutoAPartirDeNeto(): number {
    let brutoAproximado = 0;
    if (this.sueldo !== null) {
      let netoAnual = this.sueldo!;
      if (this.selectedPeriod == 'mensual') {
        netoAnual = this.sueldo! * Number(this.pagas);
      }
      // Primera aproximación
      brutoAproximado = netoAnual * 2;
      let resultadosIteracion = this.f_calcular_resultado(brutoAproximado);
      let error = resultadosIteracion.sueldo_neto - netoAnual;
      let it = 0;
      console.log(
        `error it[${it}]: ${error} para bruto inicial: ${brutoAproximado}`
      );
      while (Math.abs(error) > 0.5 && it < 100) {
        it++;
        brutoAproximado = brutoAproximado - error;
        resultadosIteracion = this.f_calcular_resultado(brutoAproximado);
        error = resultadosIteracion.sueldo_neto - netoAnual;
        console.log(
          `error it[${it}]: ${error} para bruto inicial: ${brutoAproximado}`
        );
      }
    }
    return brutoAproximado;
  }

  calcularSalarioBrutoAnutal(): number {
    let salario_bruto_anual = 0;
    if (this.brutoNeto === 'bruto') {
      salario_bruto_anual = this.sueldo!;
      if (this.selectedPeriod == 'mensual') {
        salario_bruto_anual = this.sueldo! * Number(this.pagas);
      }
    } else {
      salario_bruto_anual = this.aproximarBrutoAPartirDeNeto();
    }
    return salario_bruto_anual;
  }

  actualizarGrafico() {
    if (this.sueldo) {
      let salario_bruto_anual = this.calcularSalarioBrutoAnutal();
      this.results = this.f_calcular_resultado(salario_bruto_anual);
      this.results.total_pagado_empresa =
        this.calcularSSEmpresa().total + salario_bruto_anual;
      this.barChartData.datasets[0].data = [this.results.sueldo_neto, 0];
      this.barChartData.datasets[1].data = [0, this.calcularSSEmpresa().total];
      this.barChartData.datasets[2].data = [0, this.results.cuota_segsocial];
      this.barChartData.datasets[3].data = [0, this.results.cuota_irpf];
      this.chart.update();
      // Pintando grafico de en que se gastan los impuestos
      this.initializeExpensesChart();
    }
  }

  ngOnInit() {
    this.initializeChart();
  }

  initializeChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.barChartData,
      options: this.barChartOptions,
    });
  }

  colors: any = {
    red: 'rgb(255, 99, 132)',
    red_bg: 'rgba(255, 99, 132, 0.2)',
    green: 'rgb(75, 192, 192)',
    green_bg: 'rgba(75, 192, 192, 0.2)',
    blue: 'rgb(75, 75, 192)',
    blue_bg: 'rgba(75, 75, 192, 0.2)',
    purple: 'rgb(129, 68, 179)',
    purple_bg: 'rgba(129, 68, 179, 0.2)',
  };
  public dataSet: ChartDataset<'bar'>[] = [
    {
      label: 'Salario neto',
      data: [0, 0],
      backgroundColor: [this.colors.green_bg, this.colors.green_bg],
      borderColor: [this.colors.green, this.colors.green],
      borderWidth: 1,
    },
    {
      label: 'Seguridad Social Empresa',
      data: [0, 0],
      backgroundColor: [this.colors.red_bg, this.colors.red_bg],
      borderColor: [this.colors.red, this.colors.red],
      borderWidth: 1,
    },
    {
      label: 'Seguridad Social Trabajador',
      data: [0, 0],
      backgroundColor: [this.colors.blue_bg, this.colors.blue_bg],
      borderColor: [this.colors.blue, this.colors.blue],
      borderWidth: 1,
    },
    {
      label: 'IRPF',
      data: [0, 0],
      backgroundColor: [this.colors.purple_bg, this.colors.purple_bg],
      borderColor: [this.colors.purple, this.colors.purple],
      borderWidth: 1,
    },
  ];
  public barChartData = {
    labels: ['Para el trabajador', 'Para el estado'],
    datasets: this.dataSet,
  };
  public barChartOptions: ChartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Distribution de tu salario',
      },
      legend: {
        display: true,
      },
    },
    indexAxis: 'y',
    aspectRatio: window.innerWidth < 500 ? 1 : 2,
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  sueldoMensual(): string {
    return (this.results.sueldo_neto / Number(this.pagas)).toFixed(0);
  }

  f_calcuar_cuota_mensual_pagar(
    bruto_anual: number,
    categoria_profesional: string
  ) {
    // cálculo para Pensionistas
    if (categoria_profesional == 'PENSIONISTA') {
      return 0;
    }

    var datos: { [key: string]: { min: number; max: number }[] } = {
      // Bases mensuales de 2026 (Orden PJC/297/2026). Grupos 8-11: bases diarias x 30.
      A: [{ min: 1989.3, max: 5101.2 }],
      B: [{ min: 1649.7, max: 5101.2 }],
      C: [{ min: 1435.2, max: 5101.2 }],
      D: [{ min: 1424.4, max: 5101.2 }],
      E: [{ min: 1424.4, max: 5101.2 }],
      F: [{ min: 1424.4, max: 5101.2 }],
      G: [{ min: 1424.4, max: 5101.2 }],
      H: [{ min: 1424.4, max: 5101.2 }],
      I: [{ min: 1424.4, max: 5101.2 }],
      J: [{ min: 1424.4, max: 5101.2 }],
      K: [{ min: 1424.4, max: 5101.2 }],
    };

    // Trabajador en 2026: 4,70 % contingencias comunes + 1,55 % desempleo + 0,10 % formación
    // profesional + 0,15 % MEI = 6,50 %.
    const tipo_trabajador = 0.065;

    var cuota_mensual_pagar = 0;
    if (bruto_anual / 12 < datos[categoria_profesional][0].min) {
      cuota_mensual_pagar = datos[categoria_profesional][0].min * tipo_trabajador;
    } else if (bruto_anual / 12 > datos[categoria_profesional][0].max) {
      const max = datos[categoria_profesional][0].max;
      cuota_mensual_pagar =
        max * tipo_trabajador +
        this.f_calcular_solidaridad_mensual(bruto_anual / 12, max);
    } else {
      if (categoria_profesional == 'J') {
        cuota_mensual_pagar = (bruto_anual / 12) * 0.0192;
      } else cuota_mensual_pagar = (bruto_anual / 12) * tipo_trabajador;
    }
    return cuota_mensual_pagar;
  }

  // Cotización adicional de solidaridad 2026 (parte del trabajador) sobre lo que supera la base máxima.
  f_calcular_solidaridad_mensual(bruto_mensual: number, base_maxima: number) {
    const tramos = [
      [base_maxima, 5611.32, 0.0019],
      [5611.32, 7651.8, 0.0021],
      [7651.8, Infinity, 0.0024],
    ];
    let cuota = 0;
    for (const [desde, hasta, tipo] of tramos) {
      if (bruto_mensual > desde) {
        cuota += (Math.min(bruto_mensual, hasta) - desde) * tipo;
      }
    }
    return cuota;
  }

  f_calcular_reduccion_rendimiento_neto(
    rendimiento_neto: number,
    categoria_profesional: string
  ) {
    // TODO quitar hardcode
    var movilidad_geografica = false;
    var minusvalia_33_al_65 = false;
    var minusvalia_sup_al_65 = false;
    var hijos_menores_25 = 0;

    var reduccion_comun_todos = 2000;

    // La reducción se calcula sobre el rendimiento neto previo, que ya descuenta los 2.000 € de
    // otros gastos además de la Seguridad Social.
    const rnt = rendimiento_neto - reduccion_comun_todos;
    if (rnt <= 14852) var reduccion_rendimiento_neto = 7302;
    else if (rnt <= 17673.52)
      var reduccion_rendimiento_neto = 7302 - 1.75 * (rnt - 14852);
    else if (rnt < 19747.5)
      var reduccion_rendimiento_neto = 2364.34 - 1.14 * (rnt - 17673.52);
    else var reduccion_rendimiento_neto = 0;

    var incremento_prolongacion_vida_laboral = 0;

    //si el check de movilidad_geografica esta seleccionado
    if (movilidad_geografica)
      var incremento_movilidad_geografica = reduccion_comun_todos;
    else var incremento_movilidad_geografica = 0;

    if (minusvalia_33_al_65 && categoria_profesional != 'PENSIONISTA')
      var minusvalia_igual_superior_33 = 3500;
    else var minusvalia_igual_superior_33 = 0;

    if (minusvalia_sup_al_65 && categoria_profesional != 'PENSIONISTA')
      var minusvalia_sup_65_o_movilidad_reducida = 7750;
    else var minusvalia_sup_65_o_movilidad_reducida = 0;

    var reduccion_tener_mas_dos_hijos = 0;
    // if (hijos_menores_25 > 2 )
    //     var reduccion_tener_mas_dos_hijos = 600;

    //por el momento no tenemos los calculos para desempleados o pensionistas
    var reduccion_desempleado = 0;
    var reduccion_pesionista = 0;

    return (
      reduccion_rendimiento_neto +
      reduccion_comun_todos +
      incremento_prolongacion_vida_laboral +
      incremento_movilidad_geografica +
      minusvalia_igual_superior_33 +
      minusvalia_sup_65_o_movilidad_reducida +
      reduccion_desempleado +
      reduccion_pesionista +
      reduccion_tener_mas_dos_hijos
    );
  }

  f_calcular_base_imponible(
    bruto_anual: number,
    categoria_profesional: string,
    bruto_anual_flex?: number
  ): any {
    var cuota_mensual_pagar = this.f_calcuar_cuota_mensual_pagar(
      bruto_anual,
      categoria_profesional
    );
    var cuota_acumulado_anio = cuota_mensual_pagar * 12;
    var rendimiento_neto = bruto_anual - cuota_acumulado_anio;
    var reduccion_rendimiento_neto = this.f_calcular_reduccion_rendimiento_neto(
      rendimiento_neto,
      categoria_profesional
    );
    var base_imponible =
      bruto_anual - cuota_acumulado_anio - reduccion_rendimiento_neto;

    if (typeof bruto_anual_flex != 'undefined') {
      var base_imponible =
        bruto_anual_flex - cuota_acumulado_anio - reduccion_rendimiento_neto;
    }

    //PENSIONISTAS
    if (categoria_profesional == 'PENSIONISTA') {
      base_imponible = base_imponible - 600;
    }

    if (base_imponible < 0) return 0;
    else return base_imponible.toFixed(2);
  }

  f_calcular_minimo_descendientes(hijos_menores_25_anos: number) {
    if (hijos_menores_25_anos == 0) return 0;
    else if (hijos_menores_25_anos == 1) return 2400;
    else if (hijos_menores_25_anos == 2) return 2400 + 2700;
    else if (hijos_menores_25_anos == 3) return 2400 + 2700 + 4000;
    else if (hijos_menores_25_anos == 4) return 2400 + 2700 + 4000 + 4500;
    else return 2400 + 2700 + 4000 + 4500 + 4500 * (hijos_menores_25_anos - 4);
  }

  f_calcular_minimo_personal(datos: any) {
    var hijos_menores_25_anos = datos['hijos_menores_25_anos'];
    var ascendente_mayor_65_menor_75 = datos['ascendente_mayor_65_menor_75'];
    var ascendente_mayor_75 = datos['ascendente_mayor_75'];
    var divisor_para_minimos_deduccion_ascendientes =
      datos['divisor_para_minimos_deduccion_ascendientes'];
    divisor_para_minimos_deduccion_ascendientes =
      divisor_para_minimos_deduccion_ascendientes > 0
        ? divisor_para_minimos_deduccion_ascendientes
        : 1;

    var hijos_en_exclusiva = datos['hijos_en_exclusiva'];
    var minusvalia_33_al_65 = datos['minusvalia_33_al_65'];
    var minusvalia_sup_al_65 = datos['minusvalia_sup_al_65'];
    var hijos_menores_3_anos = datos['hijos_menores_3_anos'];
    var menor_65_con_discapacidad_cargo =
      datos['menor_65_con_discapacidad_cargo'];
    var descendientes_con_minusvalia_33_al_65 =
      datos['descendientes_con_minusvalia_33_al_65'];
    var descendientes_con_minusvalia_sup_al_65 =
      datos['descendientes_con_minusvalia_sup_al_65'];
    var ascendientes_con_minusvalia_33_al_65 =
      datos['ascendientes_con_minusvalia_33_al_65'];
    var ascendientes_con_minusvalia_sup_al_65 =
      datos['ascendientes_con_minusvalia_sup_al_65'];
    var edad = datos['edad'];

    var minimo_personal = 0;

    var minimo_descendientes = this.f_calcular_minimo_descendientes(
      hijos_menores_25_anos
    );
    //hijos en exclusiva
    if (hijos_en_exclusiva) {
      var minimo_hijos_beneficiarios = minimo_descendientes;
    } else {
      var minimo_hijos_beneficiarios = minimo_descendientes / 2;
    }
    minimo_personal += minimo_hijos_beneficiarios;

    var minimo_hijos_menores_3_anos = hijos_menores_3_anos * 2800;
    if (hijos_en_exclusiva) {
      var minimo_hijos_menores_3_anos_beneficiarios =
        minimo_hijos_menores_3_anos;
    } else {
      var minimo_hijos_menores_3_anos_beneficiarios =
        minimo_hijos_menores_3_anos / 2;
    }
    minimo_personal += minimo_hijos_menores_3_anos_beneficiarios;

    /* Estos valores dependen de "divisor_para_minimos_deduccion_ascendientes" */
    var minimo_ascendente_mayor_65_menor_75 =
      (ascendente_mayor_65_menor_75 * 1150) /
      divisor_para_minimos_deduccion_ascendientes;
    minimo_personal += minimo_ascendente_mayor_65_menor_75;

    var minimo_ascendente_mayor_75 =
      (ascendente_mayor_75 * 2550) /
      divisor_para_minimos_deduccion_ascendientes;
    minimo_personal += minimo_ascendente_mayor_75;

    var minimo_menor_65_con_discapacidad_cargo =
      (menor_65_con_discapacidad_cargo * 1150) /
      divisor_para_minimos_deduccion_ascendientes;
    minimo_personal += minimo_menor_65_con_discapacidad_cargo;

    /* Minusvalias  */
    var minimo_descendientes_con_minusvalia_33_al_65 =
      descendientes_con_minusvalia_33_al_65 * 3000;
    if (hijos_en_exclusiva) {
      var minimo_descendientes_con_minusvalia_33_al_65_beneficiarios =
        minimo_descendientes_con_minusvalia_33_al_65;
    } else {
      var minimo_descendientes_con_minusvalia_33_al_65_beneficiarios =
        minimo_descendientes_con_minusvalia_33_al_65 / 2;
    }
    minimo_personal +=
      minimo_descendientes_con_minusvalia_33_al_65_beneficiarios;

    var minimo_descendientes_con_minusvalia_sup_al_65 =
      descendientes_con_minusvalia_sup_al_65 * 12000;
    if (hijos_en_exclusiva) {
      var minimo_descendientes_con_minusvalia_sup_al_65_beneficiarios =
        minimo_descendientes_con_minusvalia_sup_al_65;
    } else {
      var minimo_descendientes_con_minusvalia_sup_al_65_beneficiarios =
        minimo_descendientes_con_minusvalia_sup_al_65 / 2;
    }
    minimo_personal +=
      minimo_descendientes_con_minusvalia_sup_al_65_beneficiarios;

    /* Estos valores dependen de "divisor_para_minimos_deduccion_ascendientes" */
    var minimo_ascendientes_con_minusvalia_33_al_65 =
      (ascendientes_con_minusvalia_33_al_65 * 3000) /
      divisor_para_minimos_deduccion_ascendientes;
    minimo_personal += minimo_ascendientes_con_minusvalia_33_al_65;

    var minimo_ascendientes_con_minusvalia_sup_al_65 =
      (ascendientes_con_minusvalia_sup_al_65 * 12000) /
      divisor_para_minimos_deduccion_ascendientes;
    minimo_personal += minimo_ascendientes_con_minusvalia_sup_al_65;

    /* Si esta selccionado la opcion "Minusvalía entre el 33% y el 65%" tiene un valor fijo en caso contrario el dato es 0 */
    if (minusvalia_33_al_65) {
      var minimo_minusvalia_33_al_65 = 3000;
    } else {
      var minimo_minusvalia_33_al_65 = 0;
    }
    minimo_personal += minimo_minusvalia_33_al_65;

    /* Si esta selccionado la opcion "Minusvalía superior al 65% o con movilidad reducida" tiene un valor fijo en caso contrario el dato es 0 */
    if (minusvalia_sup_al_65) {
      var minimo_minusvalia_sup_al_65 = 12000;
    } else {
      var minimo_minusvalia_sup_al_65 = 0;
    }

    minimo_personal += minimo_minusvalia_sup_al_65;

    /* Edad */
    var minimoEdad = 0;
    if (edad <= 65) {
      minimoEdad = 5550;
    } else if (edad > 75) {
      minimoEdad = 5550 + 1150 + 1400;
    } else {
      minimoEdad = 5550 + 1150;
    }
    minimo_personal += minimoEdad;
    return minimo_personal;
  }

  campos: any = {
    num_decimales: 2,
    categoria_profesional: 'A',
    hijos_en_exclusiva: false,
    minusvalia_33_al_65: false,
    minusvalia_sup_al_65: false,
    comunidad_autonoma: '9',
    //"bruto_anual": this.sueldo,
    edad: 30,
    hijos_menores_25_anos: 0,
    hijos_menores_3_anos: 0,
    ascendente_mayor_65_menor_75: 0,
    ascendente_mayor_75: 0,
    menor_65_con_discapacidad_cargo: 0,
    numero_personas_deduccion_ascendientes: 0,
    divisor_para_minimos_deduccion_ascendientes: 1,
    descendientes_con_minusvalia_33_al_65: 0,
    descendientes_con_minusvalia_sup_al_65: 0,
    ascendientes_con_minusvalia_33_al_65: 0,
    ascendientes_con_minusvalia_sup_al_65: 0,
  };

  f_calcular_tramos_base_liquidable_comunidad(
    base_imponible: number,
    comunidad: string
  ) {
    var datos: { [key: string]: any[] } = {
      // (*) ESTATAL
      E: [
        [0, 12450, 9.5],
        [12450, 20200, 12],
        [20200, 35200, 15],
        [35200, 60000, 18.5],
        [60000, 300000, 22.5],
        [300000, 999999999999, 24.5],
      ],
      //Andalucía
      '1': [
        [0, 12450, 9.5],
        [12450, 20200, 12],
        [20200, 28000, 15],
        [28000, 35200, 15.6],
        [35200, 50000, 18.7],
        [50000, 60000, 18.9],
        [60000, 120000, 22.9],
        [120000, 999999999999, 23.7],
      ],
      // Aragón
      '2': [
        [0, 12450, 10],
        [12450, 20200, 12.5],
        [20200, 34000, 15.5],
        [34000, 50000, 19],
        [50000, 60000, 21],
        [60000, 70000, 22],
        [70000, 90000, 22.5],
        [90000, 130000, 23.5],
        [130000, 150000, 24.5],
        [150000, 999999999999, 25],
      ],
      // Asturias
      '3': [
        [0, 12450, 10],
        [12450, 17707.2, 12],
        [17707.2, 33007.2, 14],
        [33007.2, 53407.2, 18.5],
        [53407.2, 70000, 21.5],
        [70000, 90000, 22.5],
        [90000, 175000, 25],
        [175000, 999999999999, 25.5],
      ],

      // Baleares
      '4': [
        [0, 10000, 9.5],
        [10000, 18000, 11.75],
        [18000, 30000, 14.75],
        [30000, 48000, 17.75],
        [48000, 70000, 19.25],
        [70000, 90000, 22],
        [90000, 120000, 23],
        [120000, 175000, 24],
        [175000, 999999999999, 25],
      ],

      // Canarias
      '5': [
        [0, 12450.01, 9],
        [12450.01, 17707.21, 11.5],
        [17707.21, 33007.21, 14],
        [33007.21, 53407.21, 18.5],
        [53407.21, 90000.01, 23.5],
        [90000.01, 120000, 25],
        [120000.01, 999999999999, 26],
      ],

      // Cantabria
      '6': [
        [0, 12450, 9.5],
        [12450, 20200, 12],
        [20200, 34000, 15],
        [34000, 46000, 18.5],
        [46000, 60000, 19.5],
        [60000, 90000, 24.5],
        [90000, 999999999999, 25.5],
      ],

      // Castilla y León
      '7': [
        [0, 12450, 9.5],
        [12450, 20200, 12],
        [20200, 35200, 14],
        [35200, 53407.2, 18.5],
        [53407.2, 999999999999, 21.5],
      ],

      // Castilla-La Mancha
      '8': [
        [0, 12450, 9.5],
        [12450, 20200, 12],
        [20200, 35200, 15],
        [35200, 60000, 18.5],
        [60000, 999999999999, 22.5],
      ],

      // Cataluña
      '9': [
        [0, 12500, 9.5],
        [12500, 22000, 12.5],
        [22000, 33000, 16],
        [33000, 53000, 19],
        [53000, 90000, 21.5],
        [90000, 120000, 23.5],
        [120000, 175000, 24.5],
        [175000, 999999999999, 25.5],
      ],

      // Comunidad Valenciana
      '10': [
        [0, 12450, 10],
        [12450, 17000, 11],
        [17000, 30000, 13.9],
        [30000, 50000, 18],
        [50000, 65000, 23.5],
        [65000, 80000, 24.5],
        [80000, 120000, 25],
        [120000, 140000, 25.5],
        [140000, 175000, 27.5],
        [175000, 999999999999, 29.5],
      ],

      // Extremadura
      '11': [
        [0, 12450, 9.5],
        [12450, 20200, 12.5],
        [20200, 24200, 15.5],
        [24200, 35200, 16.5],
        [35200, 60000, 20.5],
        [60000, 80200, 23.5],
        [80200, 99200, 24],
        [99200, 120200, 24.5],
        [120200, 999999999999, 25],
      ],
      // Galicia
      '12': [
        [0, 12450, 9.5],
        [12450, 20200, 11.75],
        [20200, 27700, 15.5],
        [27700, 35200, 17],
        [35200, 47600, 18.5],
        [47600, 60000, 20.5],
        [60000, 999999999999, 22.5],
      ],
      // La Rioja
      '13': [
        [0, 12450, 9],
        [12450, 20200, 11.6],
        [20200, 35200, 14.6],
        [35200, 50000, 18.8],
        [50000, 60000, 19.5],
        [60000, 120000, 25],
        [120000, 999999999999, 27],
      ],

      //
      // Madrid
      '14': [
        [0, 12450, 9],
        [12450, 17707, 11.2],
        [17707, 33007, 13.3],
        [33007, 53407, 17.9],
        [53407, 999999999999, 21],
      ],

      // Murcia
      '15': [
        [0, 12450, 9.7],
        [12450, 20200, 11.72],
        [20200, 34000, 14.18],
        [34000, 60000, 18.54],
        [60000, 999999999999, 22.9],
      ],
    };

    var totalTramos = 0;
    if (datos[comunidad as keyof typeof datos] != undefined) {
      let dComunidad = datos[comunidad];
      for (var i = 0; i < dComunidad.length; i++) {
        var tramo = 0;
        //último
        if (i == dComunidad.length - 1) {
          if (base_imponible > dComunidad[i][0])
            tramo = base_imponible - dComunidad[i][0];
          else tramo = 0;
        } else {
          if (base_imponible > dComunidad[i][0]) {
            if (base_imponible <= dComunidad[i][1])
              tramo = base_imponible - dComunidad[i][0];
            else tramo = dComunidad[i][1] - dComunidad[i][0];
          } else tramo = 0;
        }

        tramo = tramo < 0 ? 0 : tramo;
        totalTramos = totalTramos + (tramo * dComunidad[i][2]) / 100;
      } //for
    } //if

    return totalTramos;
  }

  // Deducción 2026 de la cuota para salarios bajos (rendimientos íntegros hasta 20.048,45 €).
  // Nunca supera la cuota. Se aplica en la declaración de la renta, no en las retenciones.
  f_calcular_deduccion_rentas_bajas(bruto_anual: number, cuota_irpf: number) {
    let deduccion = 0;
    if (bruto_anual <= 17094) deduccion = 590.89;
    else if (bruto_anual < 20048.45)
      deduccion = 590.89 - 0.2 * (bruto_anual - 17094);
    return Math.min(deduccion, cuota_irpf);
  }

  f_calcular_sueldo_neto(
    bruto_anual: number,
    categoria_profesional: string,
    irpf: number
  ) {
    var cuota_mensual_pagar = this.f_calcuar_cuota_mensual_pagar(
      bruto_anual,
      categoria_profesional
    );
    var cuota_acumulado_anio = cuota_mensual_pagar * 12;

    return bruto_anual - irpf - cuota_acumulado_anio;
  }

  f_calcular_tipo_medio_sobre_rendimiento_neto(
    bruto_anual: number,
    categoria_profesional: string,
    irpf: number
  ) {
    var cuota_mensual_pagar = this.f_calcuar_cuota_mensual_pagar(
      bruto_anual,
      categoria_profesional
    );
    var cuota_acumulado_anio = cuota_mensual_pagar * 12;
    var rendimiento_neto = bruto_anual - cuota_acumulado_anio;

    return (irpf * 100) / rendimiento_neto;
  }

  formatNumber = function (num: any, decimals: boolean = false) {
    var separador = '.';
    var sepDecimal = ',';
    num += '';

    var splitStr = num.split('.');
    var splitLeft = splitStr[0];
    var splitRight = splitStr.length > 1 ? sepDecimal + splitStr[1] : '';
    var regx = /(\d+)(\d{3})/;
    while (regx.test(splitLeft)) {
      splitLeft = splitLeft.replace(regx, '$1' + separador + '$2');
    }
    if (decimals) return splitLeft + splitRight;
    return splitLeft;
  }; //end function formatNumber

  f_calcular_resultado(bruto_anual: number) {
    var categoria_profesional = this.campos['categoria_profesional'];
    var comunidad_autonoma = '9'; // TODO quitar hardcode de Cataluña

    /* base imponible */
    var base_imponible: number = this.f_calcular_base_imponible(
      bruto_anual,
      categoria_profesional
    );
    var minimo_personal = this.f_calcular_minimo_personal(this.campos);
    // comunidad + estatal
    var cuota_retencion =
      this.f_calcular_tramos_base_liquidable_comunidad(
        base_imponible,
        comunidad_autonoma
      ) +
      this.f_calcular_tramos_base_liquidable_comunidad(base_imponible, 'E') -
      (this.f_calcular_tramos_base_liquidable_comunidad(
        minimo_personal,
        comunidad_autonoma
      ) +
        this.f_calcular_tramos_base_liquidable_comunidad(minimo_personal, 'E'));

    /* IRPF */
    var cuota_irpf = cuota_retencion;
    if (cuota_irpf < 0) cuota_irpf = 0;
    cuota_irpf -= this.f_calcular_deduccion_rentas_bajas(
      bruto_anual,
      cuota_irpf
    );

    /* Sueldos netos */
    var sueldo_neto = this.f_calcular_sueldo_neto(
      bruto_anual,
      categoria_profesional,
      cuota_irpf
    );

    var tipo_medio_sobre_rendimiento_neto =
      this.f_calcular_tipo_medio_sobre_rendimiento_neto(
        bruto_anual,
        categoria_profesional,
        cuota_irpf
      );
    var aux_tipo_medio_sobre_sueldo_bruto: any =
      (cuota_irpf * 100) / bruto_anual;
    var tipo_medio_sobre_sueldo_bruto: any =
      aux_tipo_medio_sobre_sueldo_bruto + 100 - 100;
    // cuotas a la seguridad social
    var cuota_segsocial =
      this.f_calcuar_cuota_mensual_pagar(bruto_anual, categoria_profesional) *
      12;

    return {
      cuota_irpf: Math.trunc(cuota_irpf),
      cuota_segsocial: Math.trunc(cuota_segsocial),
      sueldo_neto: Math.trunc(sueldo_neto),
      tipo_retencion_irpf: tipo_medio_sobre_sueldo_bruto,
    };
  }

  // CALCULANDO EN QUÉ SE GASTAN LOS IMPUESTOS

  public expensesChartDataSet: ChartDataset<'bar'>[] = [];
  public expensesChartData = {
    labels: ['Para el trabajador', 'Otros'],
    datasets: this.expensesChartDataSet,
  };

  public expensesChartOptions: ChartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'En qué se gastan tus impuestos',
      },
      legend: {
        display: false,
      },
      tooltip: {
        // No mostrar las procedencias que valen 0 en esa barra.
        filter: (item) => item.raw !== 0,
      },
    },
    indexAxis: 'y',
    aspectRatio: window.innerWidth < 500 ? 0.7 : 1.1,
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  expensesChart: any;
  expensesThreshold: number = 0.01;

  initializeExpensesChart() {
    const ctx2 = document.getElementById('expensesChart') as HTMLCanvasElement;
    if (!ctx2) {
      // La primera vez el canvas aún no existe (lo crea el *ngIf del sueldo): reintentar.
      setTimeout(() => this.initializeExpensesChart());
      return;
    }
    let type = 'bar' as keyof ChartTypeRegistry;
    if (type === 'bar')
      this.formatExpensesData(this.expensesThreshold);
    else
      this.formatExpensesDataPie(
        this.distribucionGastos,
        this.expensesThreshold
      );

    // Destruir instancia anterior si existe
    if (this.expensesChart) {
      this.expensesChart.destroy();
    }
    this.expensesChart = new Chart(ctx2, {
      type: type,
      data: this.expensesChartData,
      options: this.expensesChartOptions,
    });
  }

  byValueDesc = (
    a: { key: string; value: number },
    b: { key: string; value: number }
  ) => b.value - a.value;

  distribucionGastos: { [key: string]: number } = {
    Pensiones: 0.4230644,
    'Transferencias a otras admones. públicas': 0.1474464,
    'Deuda pública': 0.069389,
    'Otras prestaciones económicas': 0.0494745,
    Desempleo: 0.0472074,
    Defensa: 0.0273203,
    Infraestructuras: 0.024116,
    'Seguridad ciudadana e instituciones penitenciarias': 0.0237801,
    'Investigación, desarrollo e innovación': 0.0231834,
    'Servicios de carácter general': 0.0214277,
    'Industria y energía': 0.0199733,
    'Agricultura, pesca y alimentación': 0.0188838,
    'Fomento del empleo': 0.0178128,
    'Servicios sociales y promoción social': 0.0157832,
    Sanidad: 0.0156382,
    Educación: 0.0109219,
    'Subvenciones al transporte': 0.0076492,
    Justicia: 0.0050822,
    'Gestión y administración de la Seguridad Social': 0.0050125,
    'Política exterior': 0.0048597,
    'Acceso a la vivienda y fomento de la edificación': 0.0046965,
    Cultura: 0.003973,
    'Administración financiera y tributaria': 0.0038887,
    'Comercio, turismo y PYMES': 0.0037036,
    'Otras actuaciones de carácter económico': 0.0032136,
    'Alta dirección': 0.0020693,
    'Gestión y administración de Trabajo y Economía Social': 0.0004291,
  };

  // Reparto de la partida «Transferencias a otras admones. públicas» (estimación).
  // Entre autonomías y entidades locales: entregas a cuenta de 2026 (M€).
  // Dentro de las autonomías: % de sus presupuestos de 2023. Lo que va a sanidad, educación y
  // servicios sociales se suma a la misma fila que el gasto del Estado en esa política.
  private readonly claveTransferencias =
    'Transferencias a otras admones. públicas';
  private readonly entregasCCAA = 157731;
  private readonly entregasEELL = 29246;
  private readonly mezclaCCAA: { pct: number; destino: string | null }[] = [
    { pct: 0.306, destino: 'Sanidad' },
    { pct: 0.202, destino: 'Educación' },
    { pct: 0.076, destino: 'Servicios sociales y promoción social' },
    { pct: 0.416, destino: null },
  ];
  private readonly claveCCAAResto = 'Autonomías: resto de su gasto';
  private readonly claveLocales = 'Ayuntamientos y entidades locales';

  desglosarAutonomias = true;

  filasSinAutonomias: FilaGasto[] = this.calcularFilas(false);
  filasConAutonomias: FilaGasto[] = this.calcularFilas(true);

  get filasActuales(): FilaGasto[] {
    return this.desglosarAutonomias
      ? this.filasConAutonomias
      : this.filasSinAutonomias;
  }

  // Cada fila es una política de gasto, con la fracción de tus impuestos que paga el Estado,
  // las autonomías y los ayuntamientos. Ordenadas de mayor a menor total.
  private calcularFilas(conAutonomias: boolean): FilaGasto[] {
    const filas = new Map<string, FilaGasto>();
    const fila = (key: string): FilaGasto => {
      let f = filas.get(key);
      if (!f) {
        f = { key, estado: 0, ccaa: 0, local: 0, total: 0 };
        filas.set(key, f);
      }
      return f;
    };
    for (const [key, value] of Object.entries(this.distribucionGastos)) {
      if (conAutonomias && key === this.claveTransferencias) continue;
      fila(key).estado = value;
    }
    if (conAutonomias) {
      const partida = this.distribucionGastos[this.claveTransferencias];
      const parteCCAA =
        this.entregasCCAA / (this.entregasCCAA + this.entregasEELL);
      for (const m of this.mezclaCCAA) {
        fila(m.destino ?? this.claveCCAAResto).ccaa +=
          partida * parteCCAA * m.pct;
      }
      fila(this.claveLocales).local = partida * (1 - parteCCAA);
    }
    for (const f of filas.values()) f.total = f.estado + f.ccaa + f.local;
    return [...filas.values()].sort((x, y) => y.total - x.total);
  }

  totalImpuestos: number = 0;
  calculateTmpExpensesValues(distribucionGastos: Object, threshold: number) {
    this.totalImpuestos =
      this.calcularSSEmpresa().total +
      this.results.cuota_segsocial +
      this.results.cuota_irpf;

    let tempData = [];
    let lastItem = [];
    for (const [key, value] of Object.entries(distribucionGastos)) {
      if (value > threshold) {
        tempData.push({
          key: key,
          value: value * this.totalImpuestos,
        });
      } else {
        lastItem.push({
          key: key,
          value: value * this.totalImpuestos,
        });
      }
    }
    return {
      tempData: tempData,
      lastItem: lastItem,
    };
  }

  formatExpensesData(threshold: number) {
    this.totalImpuestos =
      this.calcularSSEmpresa().total +
      this.results.cuota_segsocial +
      this.results.cuota_irpf;
    const total = this.totalImpuestos;

    const grandes = this.filasActuales.filter((f) => f.total > threshold);
    const pequenas = this.filasActuales.filter((f) => f.total <= threshold);
    const n = grandes.length + 1; // la última barra es «Otros»

    const serie = (label: string, color: string, colorBg: string) => ({
      label,
      data: Array(n).fill(0) as number[],
      backgroundColor: colorBg,
      borderColor: color,
      borderWidth: 1,
    });
    const estado = serie(
      'Estado y Seguridad Social',
      this.colors.green,
      this.colors.green_bg
    );
    const ccaa = serie('Autonomías', this.colors.blue, this.colors.blue_bg);
    const local = serie(
      'Ayuntamientos y entidades locales',
      this.colors.purple,
      this.colors.purple_bg
    );

    grandes.forEach((f, i) => {
      estado.data[i] = Math.floor(f.estado * total);
      ccaa.data[i] = Math.floor(f.ccaa * total);
      local.data[i] = Math.floor(f.local * total);
    });
    const sumar = (campo: 'estado' | 'ccaa' | 'local') =>
      Math.floor(pequenas.reduce((acc, f) => acc + f[campo], 0) * total);
    estado.data[n - 1] = sumar('estado');
    ccaa.data[n - 1] = sumar('ccaa');
    local.data[n - 1] = sumar('local');

    this.expensesChartDataSet = [estado, ccaa, local].filter((d) =>
      d.data.some((v) => v > 0)
    );
    // La leyenda solo hace falta cuando hay más de una procedencia del dinero.
    this.expensesChartOptions.plugins!.legend!.display =
      this.expensesChartDataSet.length > 1;
    this.expensesChartData = {
      labels: [...grandes.map((f) => f.key), 'Otros'],
      datasets: this.expensesChartDataSet,
    };
  }

  // Devuelve arrays de fondo y borde para N elementos
  getChartColors(n: number): {
    backgroundColor: string[];
    borderColor: string[];
  } {
    const backgroundColor: string[] = [];
    const borderColor: string[] = [];

    for (let i = 0; i < n; i++) {
      // Recorremos el círculo de color HSL
      const hue = ((i * 360) / n) % 360;

      // Fondo: color pastel translúcido
      backgroundColor.push(`hsla(${hue}, 70%, 65%, 0.5)`);

      // Borde: mismo color pero sólido y más oscuro
      borderColor.push(`hsl(${hue}, 70%, 45%)`);
    }

    return { backgroundColor, borderColor };
  }

  formatExpensesDataPie(distribucionGastos: Object, threshold: number) {
    const tmpValues = this.calculateTmpExpensesValues(
      distribucionGastos,
      threshold
    );
    let tempData = tmpValues.tempData;
    let lastItem = tmpValues.lastItem;
    let finalLabels = tempData.map((obj) => obj.key);
    finalLabels.push('Otros');
    let finalData = tempData.map((obj) => Math.floor(obj.value));
    finalData.push(
      lastItem.reduce((acumulado, actual) => acumulado + actual.value, 0)
    );

    const finalColors = this.getChartColors(finalLabels.length);
    this.expensesChartDataSet = [];
    const data = {
      labels: finalLabels,
      datasets: [
        {
          data: finalData,
          backgroundColor: finalColors.backgroundColor,
          borderColor: finalColors.borderColor,
          hoverOffset: 4,
        },
      ],
    };
    this.expensesChartData = data;
    this.expensesChartOptions = {
      plugins: {
        title: {
          display: true,
          text: 'En qué se gastan tus impuestos',
        },
      },
      aspectRatio: window.innerWidth < 500 ? 1 : 2,
      responsive: true,
    };
  }

  allocateRetention(totalRetention: any) {
    return Object.fromEntries(
      Object.entries(this.distribucionGastos).map(([k, v]) => [
        k,
        +((totalRetention * v) / 100).toFixed(2),
      ])
    );
  }
}
