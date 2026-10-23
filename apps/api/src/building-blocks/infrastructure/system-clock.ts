import { Injectable } from '@nestjs/common';
import type { Clock } from '../application/clock';

@Injectable()
export class SystemClock implements Clock {
  ahora(): Date {
    return new Date();
  }
}
