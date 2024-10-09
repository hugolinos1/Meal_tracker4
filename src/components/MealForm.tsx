import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { Mic } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface MealFormProps {
  onSubmit: (meal: Omit<Meal, 'id'>) => void;
}

const MealForm: React.FC<MealFormProps> = ({ onSubmit }) => {
  const [meal, setMeal] = useState<Omit<Meal, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Déjeuner',
    foods: [],
    alcohol: {
      consumed: false,
      type: '',
      glasses: 0,
    },
    exercise: '',
    feelings: '',
    sensationScore: 5,
  });

  const [currentFood, setCurrentFood] = useState('');
  const foodInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith('alcohol.')) {
      const alcoholField = name.split('.')[1];
      setMeal(prev => ({
        ...prev,
        alcohol: {
          ...prev.alcohol,
          [alcoholField]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setMeal(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleAddFood = () => {
    if (currentFood.trim()) {
      setMeal(prev => ({ ...prev, foods: [...prev.foods, currentFood.trim()] }));
      setCurrentFood('');
      foodInputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      onSubmit(meal);
      setMeal({
        date: new Date().toISOString().split('T')[0],
        type: 'Déjeuner',
        foods: [],
        alcohol: {
          consumed: false,
          type: '',
          glasses: 0,
        },
        exercise: '',
        feelings: '',
        sensationScore: 5,
      });
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentFood(transcript);
      };
      recognition.start();
    } else {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={meal.date}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
          Type de repas
        </label>
        <select
          id="type"
          name="type"
          value={meal.type}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="Petit-déjeuner">Petit-déjeuner</option>
          <option value="Déjeuner">Déjeuner</option>
          <option value="Dîner">Dîner</option>
          <option value="Collation">Collation</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="foods">
          Aliments
        </label>
        <div className="flex">
          <input
            type="text"
            id="foods"
            value={currentFood}
            onChange={(e) => setCurrentFood(e.target.value)}
            className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ajouter un aliment"
            ref={foodInputRef}
          />
          <button
            type="button"
            onClick={handleAddFood}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline ml-2"
          >
            <Mic size={20} />
          </button>
        </div>
        <ul className="list-disc list-inside mt-2">
          {meal.foods.map((food, index) => (
            <li key={index}>{food}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          <input
            type="checkbox"
            name="alcohol.consumed"
            checked={meal.alcohol.consumed}
            onChange={handleChange}
            className="mr-2 leading-tight"
          />
          Consommation d'alcool
        </label>
        {meal.alcohol.consumed && (
          <>
            <input
              type="text"
              name="alcohol.type"
              value={meal.alcohol.type}
              onChange={handleChange}
              placeholder="Type d'alcool"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
            />
            <input
              type="number"
              name="alcohol.glasses"
              value={meal.alcohol.glasses}
              onChange={handleChange}
              placeholder="Nombre de verres"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
              min="0"
            />
          </>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="exercise">
          Activité sportive
        </label>
        <input
          type="text"
          id="exercise"
          name="exercise"
          value={meal.exercise}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Décrivez votre activité sportive"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feelings">
          Sensations
        </label>
        <textarea
          id="feelings"
          name="feelings"
          value={meal.feelings}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Décrivez vos sensations"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sensationScore">
          Score de sensation (1-10)
        </label>
        <div className="flex items-center">
          <input
            type="range"
            id="sensationScore"
            name="sensationScore"
            value={meal.sensationScore}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            min="1"
            max="10"
            step="1"
          />
          <span className="ml-2 text-gray-700 font-bold">{meal.sensationScore}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Enregistrer le repas
        </button>
      </div>
    </form>
  );
};

export default MealForm;