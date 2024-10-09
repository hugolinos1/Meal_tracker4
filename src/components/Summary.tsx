import React from 'react';
import { Meal } from '../types';

interface SummaryProps {
  meals: Meal[];
}

const Summary: React.FC<SummaryProps> = ({ meals }) => {
  const totalMeals = meals.length;
  const alcoholConsumption = meals.filter(meal => meal.alcohol.consumed).length;
  const totalGlasses = meals.reduce((sum, meal) => sum + (meal.alcohol.consumed ? meal.alcohol.glasses : 0), 0);
  const exerciseDays = meals.filter(meal => meal.exercise.trim() !== '').length;
  const averageSensationScore = meals.reduce((sum, meal) => sum + meal.sensationScore, 0) / totalMeals || 0;

  const mealTypes = meals.reduce((acc, meal) => {
    acc[meal.type] = (acc[meal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alcoholTypes = meals.reduce((acc, meal) => {
    if (meal.alcohol.consumed && meal.alcohol.type) {
      acc[meal.alcohol.type] = (acc[meal.alcohol.type] || 0) + meal.alcohol.glasses;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Résumé</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Total des repas :</strong> {totalMeals}</p>
          <p><strong>Consommation d'alcool :</strong> {alcoholConsumption} fois</p>
          <p><strong>Total des verres consommés :</strong> {totalGlasses}</p>
          <p><strong>Jours avec activité sportive :</strong> {exerciseDays}</p>
          <p><strong>Score de sensation moyen :</strong> {averageSensationScore.toFixed(1)}/10</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Répartition des repas :</h3>
          {Object.entries(mealTypes).map(([type, count]) => (
            <p key={type}><strong>{type} :</strong> {count}</p>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Consommation d'alcool par type :</h3>
        {Object.entries(alcoholTypes).map(([type, glasses]) => (
          <p key={type}><strong>{type} :</strong> {glasses} verre(s)</p>
        ))}
      </div>
    </div>
  );
};

export default Summary;