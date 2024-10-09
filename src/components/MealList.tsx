import React, { useState } from 'react';
import { Meal } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface MealListProps {
  meals: Meal[];
  onUpdate: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);

  const handleEdit = (meal: Meal) => {
    setEditingId(meal.id);
    setEditMeal({ ...meal });
  };

  const handleSave = () => {
    if (editMeal) {
      onUpdate(editMeal);
      setEditingId(null);
      setEditMeal(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (editMeal) {
      const { name, value, type } = e.target;
      if (name.startsWith('alcohol.')) {
        const alcoholField = name.split('.')[1];
        setEditMeal(prev => ({
          ...prev!,
          alcohol: {
            ...prev!.alcohol,
            [alcoholField]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
          },
        }));
      } else {
        setEditMeal(prev => ({
          ...prev!,
          [name]: type === 'number' ? Number(value) : value,
        }));
      }
    }
  };

  return (
    <div className="space-y-4">
      {meals.map(meal => (
        <div key={meal.id} className="bg-white shadow-md rounded p-4">
          {editingId === meal.id ? (
            <div className="space-y-2">
              {/* Le formulaire d'édition reste inchangé */}
            </div>
          ) : (
            <>
              <h3 className="font-bold text-lg">{meal.type} - {new Date(meal.date).toLocaleDateString()}</h3>
              <p><strong>Aliments :</strong> {meal.foods.join(', ')}</p>
              <p><strong>Alcool :</strong> {meal.alcohol.consumed ? `Oui (${meal.alcohol.type}, ${meal.alcohol.glasses} verre(s))` : 'Non'}</p>
              <p><strong>Activité sportive :</strong> {meal.exercise || 'Aucune'}</p>
              <p><strong>Sensations :</strong> {meal.feelings}</p>
              <p><strong>Score de sensation :</strong> {meal.sensationScore}/10</p>
              <div className="mt-2 space-x-2">
                <button onClick={() => handleEdit(meal)} className="text-blue-500 hover:text-blue-700">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => onDelete(meal.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MealList;