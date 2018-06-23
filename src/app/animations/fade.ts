import { trigger, transition, style, animate } from '@angular/animations';

export const fade = trigger('fade', [
    transition('*<=>*', [
        style({ opacity: 0 }),
        animate('0.4s', style({ opacity: 1 }))
    ]),
]);
