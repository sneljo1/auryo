import * as UniversalAnalytics from 'universal-analytics';
import { CONFIG } from '../../config';

export const ua: UniversalAnalytics.Visitor = UniversalAnalytics(CONFIG.GOOGLE_GA);
