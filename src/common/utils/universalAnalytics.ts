import UA from 'universal-analytics';
import { CONFIG } from '../../config';

export const ua: UA.Visitor = UA(CONFIG.GOOGLE_GA);
