import {
  AfterViewChecked,
  Component,
  OnInit,
  ViewChild,
  viewChild
} from '@angular/core';
import { finalize } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { MatAccordion } from "@angular/material/expansion";
import {
  ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexStroke,
  ApexTitleSubtitle, ApexTooltip, ApexXAxis, ChartComponent
} from "ng-apexcharts";

import { SettingsService } from "@core";
import { ISession } from "../../interfaces";
import { SessionsService } from "../../services";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-user-session-summary',
  templateUrl: './user-session-summary.component.html',
  styleUrl: './user-session-summary.component.scss'
})
export class UserSessionSummaryComponent implements OnInit, AfterViewChecked {
  isLoading = true;

  session!: ISession;
  correctQuizAnswers = 0;

  accordion = viewChild.required(MatAccordion);

  @ViewChild("chart", {static: false}) chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;

  get dark() {
    return this.settings.themeColor == 'dark';
  }

  constructor(
      private sessionsService: SessionsService,
      private settings: SettingsService,
      private activatedRoute: ActivatedRoute) {
    this.initChart();
  }

  ngAfterViewChecked(): void {
    if (this.chart) {
      this.chart.updateSeries(
          [
            {
              name: "Correct",
              data: [
                this.session.questionSet?.questions?.length,
                this.correctQuizAnswers
              ],
            },
            {
              name: "Incorrect",
              data: [
                Number(this.session.userAnswers?.length) - Number(this.session.questionSet?.questions?.length),
                Number(this.session.questionSet?.questions?.length) - Number(this.correctQuizAnswers)
              ],
            }
          ]
      );
    }
  }

  ngOnInit() {
    this.isLoading = true;

    this.activatedRoute.params.subscribe(({id}) => {
      this.sessionsService.getById(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(session => {
            this.session = session;
            this.correctQuizAnswers = session.quizAnswers?.filter(a => a.correct).length || 0;
          });
    });

    this.settings.notify.subscribe(({theme}) => {
          if (this.chart) {
            this.chart.updateOptions({theme: {mode: theme}});
          }
        },
    );
  }

  initChart() {
    this.chartOptions = {
      colors : ['#8db95e', '#e57575'],
      series:
          [],
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        stackType: "100%"
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      title: {
        text: "Session summary"
      },
      xaxis: {
        categories: ['Questions', 'Quizzes']
      },
      tooltip: {
        y: {
          formatter: function (val: string) {
            return val + " answer(s)";
          }
        }
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40,
        colors: ['#FFF'],
        style: {
          colors: ['#FFF']
        }
      },
      theme: {
        mode: this.dark ? 'dark' : 'light'
      }
    };
  }

  getUserAnswer(id: any) {
    return this.session.userAnswers?.find(a => a.question?.id === id);
  }

  getQuizAnswer(id: any) {
    return this.session.quizAnswers?.find(a => a.quiz?.id === id);
  }
}