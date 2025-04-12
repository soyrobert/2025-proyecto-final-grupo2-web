import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-wrapper">
      <div class="modal-backdrop" (click)="closeOnBackdrop ? close() : null"></div>
      <div [@fadeInOut] class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">{{title}}</h3>
          <button type="button" class="modal-close" (click)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-container *ngIf="headerTemplate">
            <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          </ng-container>
          <ng-content></ng-content>
          <ng-container *ngIf="bodyTemplate">
            <ng-container *ngTemplateOutlet="bodyTemplate"></ng-container>
          </ng-container>
        </div>
        <div *ngIf="footerTemplate" class="modal-footer">
          <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .modal-container {
      position: relative;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow: auto;
      z-index: 51;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }
    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #718096;
    }
    .modal-close:hover {
      color: #2d3748;
    }
    .modal-body {
      padding: 1rem;
    }
    .modal-footer {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    :host-context(.dark) .modal-container {
      background-color: #1a202c;
      color: white;
    }
    :host-context(.dark) .modal-header,
    :host-context(.dark) .modal-footer {
      border-color: #2d3748;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
})
export class ModalComponent {
  @Input() title: string = 'Modal';
  @Input() closeOnBackdrop: boolean = true;
  
  @ContentChild('headerTemplate') headerTemplate!: TemplateRef<any>;
  @ContentChild('bodyTemplate') bodyTemplate!: TemplateRef<any>;
  @ContentChild('footerTemplate') footerTemplate!: TemplateRef<any>;
  
  @Output() closed = new EventEmitter<void>();
  
  isOpen: boolean = false;
  
  open(): void {
    this.isOpen = true;
    document.body.classList.add('overflow-hidden');
  }
  
  close(): void {
    this.isOpen = false;
    document.body.classList.remove('overflow-hidden');
    this.closed.emit();
  }
}