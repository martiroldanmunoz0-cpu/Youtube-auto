// Registro de escenas disponibles. El generador de guiones solo puede usar estas.
import { car_window, rearview_eyes, city_street } from './vehicle.mjs';
import { phone } from './phone.mjs';
import { bedroom, front_door, hallway, house_exterior, clock, tv } from './home.mjs';
import { forest, ocean, space, eyes_dark, silhouette } from './nature.mjs';
import { big_text, newspaper, map_pin } from './facts.mjs';
import { character, money, calendar } from './life.mjs';
import { duo, closeup, vice_street, vice_beach, car_ride, police_chase } from './vice.mjs';

export const SCENES = {
  car_window, rearview_eyes, city_street, phone,
  bedroom, front_door, hallway, house_exterior, clock, tv,
  forest, ocean, space, eyes_dark, silhouette,
  big_text, newspaper, map_pin,
  character, money, calendar,
  duo, closeup, vice_street, vice_beach, car_ride, police_chase,
};
