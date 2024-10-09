export interface Meal {
  id: string;
  date: string;
  type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  foods: string[];
  alcohol: {
    consumed: boolean;
    type: string;
    glasses: number;
  };
  exercise: string;
  feelings: string;
  sensationScore: number;
}