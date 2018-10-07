import UniversalAnalytics, { Visitor } from 'universal-analytics';
import { CONFIG } from '../../config';

export const ua: Visitor = UniversalAnalytics(CONFIG.GOOGLE_GA);
