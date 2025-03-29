import { animate, state, style, transition, trigger } from '@angular/animations';

export const slideDownUp = trigger('slideDownUp', [
    state('true', style({ height: '0', opacity: '0' })),
    state('false', style({ height: '*', opacity: '1' })),
    transition('true => false', animate(300)),
    transition('false => true', [animate(300)]),
]);

export const toggleAnimation = trigger('toggleAnimation', [
    transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
    transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
]);
