import React, { useState, useEffect } from 'react';
import './App.css';

function App() 
{
  const [weatherCards, setWeatherCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => 
  {
    loadData();
  }, []);

  const loadData = async () => 
  {
    setIsLoading(true);
    try 
    {
      const citiesRes = await fetch('http://localhost:5000/cities');
      const cities = await citiesRes.json();

      const promises = cities.map(city => 
        fetch(`http://localhost:5000/weather?city=${city.name}`).then(r => r.json())
      );

      const results = await Promise.all(promises);
      setWeatherCards(results); 
    } 
    catch (err) 
    {
      console.error(err);
    } 
    finally 
    {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🌤 Погодное Табло</h1>
        <button onClick={loadData} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : '🔄 Обновить'}
        </button>
      </header>
      
      {isLoading ? (
        <div className="loading">Получаем данные со спутника... 🛰</div>
      ) : (
        <div className="grid">
          {}
          {weatherCards.map((w, index) => (
            <div key={index} className="card">
              <h2>{w.name}</h2>
              <div className="icon-row">
                <img src={w.icon} alt="" />
                <span className="temp">{w.temp}°C</span>
              </div>
              <p className="desc">{w.desc}</p>
              <p style={{color: '#888'}}>Ощущается как {w.feels_like}°C</p>
              
              {}
              <div className="details-row">
                <div className="detail-item">💨 <span>{w.wind} м/с</span></div>
                <div className="detail-item">💧 <span>{w.humidity}%</span></div>
                <div className="detail-item">🌡 <span>{w.pressure}</span></div>
                <div className="detail-item">👁 <span>{w.visibility} км</span></div>
              </div>

              <div className="advice">{w.advice}</div>
            </div>
          ))}
          {}
        </div>
      )}

      {!isLoading && weatherCards.length === 0 && (
        <p style={{textAlign: 'center', color: '#888'}}>Администратор пока не добавил города...</p>
      )}
    </div>
  );
}

export default App;