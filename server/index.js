const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const API_KEY = '36d50369bdbb2105a5e53846ba75bac2'; 

// Маршрут для получения погоды
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) 
    {
        return res.status(400).send({ error: 'Город не указан' });
    }

    try 
    {
        // 1. Запрашиваем погоду у OpenWeatherMap
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;

        // 2. Советы
        let advice = '';
        const temp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const weatherId = data.weather[0].id;
        const windSpeed = data.wind.speed;

        // Базовая одежда по температуре
        if (feelsLike < -25) {
            advice = 'Одевайся как капуста! Термобелье, свитер и самый теплый пуховик.';
        } else if (feelsLike < -10) {
            advice = 'Морозно. Шапка, шарф, перчатки и зимняя куртка обязательны.';
        } else if (feelsLike < 0) {
            advice = 'Холодно. Теплое пальто или пуховик будут в самый раз.';
        } else if (feelsLike >= 0 && feelsLike < 10) {
            advice = 'Прохладно. Демисезонная куртка, пальто или теплый худи с жилеткой.';
        } else if (feelsLike >= 10 && feelsLike < 20) {
            advice = 'Комфортно. Ветровка, джинсовка или просто толстовка.';
        } else if (feelsLike >= 20 && feelsLike < 30) {
            advice = 'Тепло! Футболка, джинсы или легкое платье.';
        } else {
            advice = 'Жара! Шорты, майка, сандалии. Ищи тень!';
        }

        // Корректировка по осадкам и небу
        if (weatherId >= 200 && weatherId <= 531) {
            advice += ' На улице мокро: возьми зонт и непромокаемую обувь.';
        } 
        else if (weatherId >= 600 && weatherId <= 622) {
            advice += ' Идет снег: капюшон или шапка точно пригодятся.';
        }
        else if (weatherId === 800 && temp > 20) {
            advice += ' Солнце яркое: не забудь солнечные очки и кепку.';
        }
        if (windSpeed > 10) {
            advice += ' 🌬 Сильный ветер! Лучше надеть что-то непродуваемое.';
        }

        // 3. Формируем ответ для Angular
        const result = 
        {
            city: data.name,
            temp: Math.round(temp),
            description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            advice: advice,
            wind: data.wind.speed,        
            pressure: data.main.pressure, 
            humidity: data.main.humidity,
            feels_like: Math.round(data.main.feels_like),
            visibility: (data.visibility / 1000).toFixed(1)
        };

        res.json(result);

    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении погоды. Возможно, город указан неверно.' });
    }
});

app.listen(PORT, () => 
{
    console.log(`Server is running on http://localhost:${PORT}`);
});