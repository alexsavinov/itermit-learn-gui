import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { finalize, map } from "rxjs/operators";
import { BreakpointObserver } from "@angular/cdk/layout";
import { StepperOrientation, StepperSelectionEvent } from "@angular/cdk/stepper";
import { DomSanitizer } from "@angular/platform-browser";

import { ISession } from "../../interfaces";
import { SetsService } from "../../../sets/services";
import { IQuizAnswer } from "../../../quizzes/interfaces";
import { IUserAnswer } from "../../../questions/interfaces";
import { SessionsService } from "../../services";


@Component({
  selector: 'app-user-session',
  templateUrl: './user-session.component.html',
  styleUrl: './user-session.component.scss'
})
export class UserSessionComponent implements OnInit {
  formGroup!: FormGroup;

  isLoading = true;
  isSubmitting = false;

  session!: ISession;
  steps: any[] = [];
  selectedIndex: number = 0;

  stepperOrientation: Observable<StepperOrientation>;

  get formArray(): AbstractControl | null {
    return this.formGroup.get('formArray');
  }

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private sessionsService: SessionsService,
      private setsService: SetsService,
      private sanitizer: DomSanitizer,
      breakpointObserver: BreakpointObserver) {
    this.stepperOrientation = breakpointObserver
        .observe('(min-width: 800px)')
        .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit() {
    this.isLoading = true;

    this.activatedRoute.params.subscribe(({id}) => {
          this.sessionsService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(session => {
                this.session = session;

                if (session.questionSet?.id) {
                  this.setsService
                      .getById(String(session.questionSet.id))
                      .pipe(finalize(() => this.isLoading = false))
                      .subscribe(set => {
                            this.steps = [...set.quizzes || [], ...set.questions || []];

                            let arr: FormGroup[] = [];

                            this.steps.forEach(step => {
                              let innerForm: FormGroup = this.fb.group({
                                answer: ['', Validators.required],
                                isSaved: [false],
                              });

                              step.content = this.contentAdapter(String(step.content));

                              if (Object.hasOwn(step, 'answer')) { // IUserAnswer
                                let userAnswer = session.userAnswers?.find(
                                    a => a.question?.answer?.id === step.id);

                                if (userAnswer) {
                                  innerForm.patchValue({answer: userAnswer?.content});
                                  this.selectedIndex++;
                                }
                              } else { // IQuiz
                                let quizAnswer = session.quizAnswers?.find(
                                    a => a.quiz?.id === step.id);

                                if (quizAnswer) {
                                  let quizAnswers: IQuizAnswer[] = step.quizAnswers;
                                  let quizAnswerExisted = quizAnswers
                                      .find(a => a?.id === quizAnswer?.id);
                                  innerForm.patchValue({answer: quizAnswerExisted});
                                  this.selectedIndex++;
                                }
                              }

                              arr.push(innerForm);
                            });

                            this.formGroup = this.fb.group({
                              formArray: this.fb.array(arr)
                            });
                          }
                      )
                  ;
                }
              });
        }
    );
  }

  addQuizAnswer(data: IQuizAnswer) {
    this.sessionsService.addQuizAnswer(String(this.session.id), data)
        .subscribe(res => {
              this.session = res;
            }
        )
  }

  addUserAnswer(data: IUserAnswer) {
    this.sessionsService.addUserAnswer(String(this.session.id), data)
        .subscribe(res => {
              this.session = res;
            }
        );
  }

  stepChange(e: StepperSelectionEvent) {
    this.addCodePrettify();

    let index = e.selectedIndex;
    let prevIndex = e.previouslySelectedIndex;

    if (this.session.finishedDate || index === this.steps.length + 1 || prevIndex === this.steps.length) {
      return;
    }

    const innerForm = this.formArray?.get([prevIndex]);
    let answer = innerForm?.value.answer;

    if (Object.hasOwn(this.steps[prevIndex], 'answer') && answer) {
      const userAnswer: IUserAnswer = {
        content: answer,
        session: {id: this.session.id},
        question: {id: this.steps[prevIndex].id}
      };

      this.addUserAnswer(userAnswer);

      if (innerForm) {
        innerForm.patchValue({isSaved: true});
      }
    } else if (!Object.hasOwn(this.steps[prevIndex], 'answer') && answer) {
      answer.quiz = {id: this.steps[prevIndex].id};
      console.log('save Quiz', answer);
      this.addQuizAnswer(answer);

      if (innerForm) {
        innerForm.patchValue({isSaved: true});
      }
    }
  }

  private addCodePrettify() {
    const body = <HTMLDivElement>document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    // desert doxy sons-of-obsidian sunburst
    script.src = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?lang=java&skin=sons-of-obsidian';
    script.async = true;
    script.defer = true;
    body.appendChild(script);
  }

  finish() {
    this.sessionsService.finish(String(this.session.id))
        .subscribe(res => {
              this.session = res;
            }
        );
  }

  isCompleted(index: number) {
    const innerForm = this.formArray?.get([index]);
    return innerForm?.value.isSaved;
  }

  changeSelectedIndex(number: number) {
    // this.selectedIndex = this.selectedIndex + number;
  }

  contentAdapter(content: string) {
    return this.sanitizer.bypassSecurityTrustHtml(
        content.replaceAll(
            'pre class="language-java"',
            'pre class="prettyprint linenums lang-java w-80"'
        ) || '');
  }
}