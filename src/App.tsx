import React, { useState, useEffect } from 'react';
import MealForm from './components/MealForm';
import MealList from './components/MealList';
import Summary from './components/Summary';
import { Meal } from './types';
import { Download } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';

function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchMeals();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchMeals();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchMeals() {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) console.error('Error fetching meals:', error);
    else setMeals(data || []);
  }

  const addMeal = async (meal: Omit<Meal, 'id'>) => {
    const { data, error } = await supabase
      .from('meals')
      .insert([meal])
      .select();
    
    if (error) console.error('Error adding meal:', error);
    else {
      setMeals([...meals, data[0]]);
    }
  };

  const updateMeal = async (updatedMeal: Meal) => {
    const { error } = await supabase
      .from('meals')
      .update(updatedMeal)
      .eq('id', updatedMeal.id);
    
    if (error) console.error('Error updating meal:', error);
    else {
      setMeals(meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
    }
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting meal:', error);
    else {
      setMeals(meals.filter(meal => meal.id !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Aliments', 'Alcool consommé', 'Type d\'alcool', 'Nombre de verres', 'Activité sportive', 'Sensations', 'Score de sensation'];
    const csvContent = [
      headers.join(';'),
      ...meals.map(meal => 
        [
          meal.date,
          meal.type,
          meal.foods.join(','),
          meal.alcohol.consumed ? 'Oui' : 'Non',
          meal.alcohol.type,
          meal.alcohol.glasses,
          meal.exercise,
          meal.feelings,
          meal.sensationScore
        ].map(field => `"${field}"`).join(';')
      )
    ].join('\r\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'meals_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {!session ? (
        <Auth />
      ) : (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">Suivi de Repas</h1>
          <MealForm onSubmit={addMeal} />
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Repas enregistrés</h2>
            <MealList meals={meals} onUpdate={updateMeal} onDelete={deleteMeal} />
          </div>
          <Summary meals={meals} />
          <button
            onClick={exportToCSV}
            className="mt-8 flex items-center justify-center w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
          >
            <Download className="mr-2" />
            Exporter en CSV
          </button>
        </div>
      )}
    </div>
  );
}

export default App;