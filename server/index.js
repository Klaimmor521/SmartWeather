const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors({origin: ['http://localhost:3000', 'http://localhost:4200']}));
app.use(express.json());

const API_KEY = '36d50369bdbb2105a5e53846ba75bac2';
const FILE_PATH = './database.json';

// Список сохраненных городов
app.get('/cities', (req, res) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) return res.send([]);
        res.send(JSON.parse(data || '[]'));
    });
});

// Добавить город
app.post('/cities', async (req, res) => {
    const cityName = req.body.name;
    if (!cityName) return res.status(400).send({ message: 'Имя города обязательно' });

    if (cityName.length > 50) 
    {
        return res.status(400).send({ message: 'Слишком длинное название города!' });
    }

    try 
    {
        // Проверка существования города через API
        const checkUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}`;
        await axios.get(checkUrl);

        // Если API не выдал ошибку, значит город настоящий
        fs.readFile(FILE_PATH, 'utf8', (err, data) => 
        {
            const cities = JSON.parse(data || '[]');
            
            // Проверка на дубликаты
            if (cities.find(c => c.name.toLowerCase() === cityName.toLowerCase())) 
            {
                return res.status(400).send({ message: 'Город уже отслеживается' });
            }

            const newCity = { id: Date.now(), name: cityName };
            cities.push(newCity);

            fs.writeFile(FILE_PATH, JSON.stringify(cities, null, 2), () => 
            {
                res.send(newCity);
            });
        });

    } 
    catch (error) 
    {
        console.log('Ошибка проверки города:', error.message);
        return res.status(404).send({ message: 'Такого города не существует!' });
    }
});

// Удалить город
app.delete('/cities/:id', (req, res) => {
    const idToDelete = Number(req.params.id);
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        let cities = JSON.parse(data || '[]');
        cities = cities.filter(c => c.id !== idToDelete);
        fs.writeFile(FILE_PATH, JSON.stringify(cities, null, 2), () => {
            res.send({ success: true });
        });
    });
});

// Получение погоды
app.get('/weather', async (req, res) => {
    const city = req.query.city;

    if (!city) 
    {
        return res.status(400).send({ error: 'Город не указан' });
    }

    try 
    {
        // Запрашиваем погоду у OpenWeatherMap
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=ru&appid=${API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;

        // Советы
        let advice = '';
        const temp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const weatherId = data.weather[0].id;
        const windSpeed = data.wind.speed;

        // Базовая одежда по температуре
        if (feelsLike < -25) 
        {
            advice = 'Одевайся как капуста! Термобелье, свитер и самый теплый пуховик.';
        } 
        else if (feelsLike < -10) 
        {
            advice = 'Морозно. Шапка, шарф, перчатки и зимняя куртка обязательны.';
        } 
        else if (feelsLike < 0) 
        {
            advice = 'Холодно. Теплое пальто или пуховик будут в самый раз.';
        } 
        else if (feelsLike >= 0 && feelsLike < 10) 
        {
            advice = 'Прохладно. Демисезонная куртка, пальто или теплый худи с жилеткой.';
        } 
        else if (feelsLike >= 10 && feelsLike < 20) 
        {
            advice = 'Комфортно. Ветровка, джинсовка или просто толстовка.';
        } 
        else if (feelsLike >= 20 && feelsLike < 30) 
        {
            advice = 'Тепло! Футболка, джинсы или легкое платье.';
        } 
        else 
        {
            advice = 'Жара! Закрывающая одежда из хлопка, сандали. Ищи тень!';
        }

        // Корректировка по осадкам и небу
        if (weatherId >= 200 && weatherId <= 531) 
        {
            advice += ' На улице мокро: возьми зонт и непромокаемую обувь.';
        } 
        else if (weatherId >= 600 && weatherId <= 622) 
        {
            advice += ' Идет снег: капюшон или шапка точно пригодятся.';
        }
        else if (weatherId === 800 && temp > 20) 
        {
            advice += ' Солнце яркое: не забудь солнечные очки и кепку.';
        }
        if (windSpeed > 10) 
        {
            advice += ' 🌬 Сильный ветер! Лучше надеть что-то непродуваемое.';
        }

        // Ответ для Angular
        res.json({
            name: data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(feelsLike),
            desc: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            advice: advice,
            wind: Math.round(data.wind.speed),
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            visibility: (data.visibility / 1000).toFixed(1)
        });

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