import { WiHumidity, WiStrongWind, WiRaindrop } from 'react-icons/wi';
import './WeatherCard.css';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="glass-card weather-card">
      <div className="weather-card__head">
        <div>
          <h3>{weather.location}{weather.country ? `, ${weather.country}` : ''}</h3>
          <p className="weather-card__condition">{weather.description}</p>
        </div>
        {weather.icon && (
          <img
            className="weather-card__icon"
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
          />
        )}
      </div>

      <div className="weather-card__temp">{weather.tempC}°C</div>

      <div className="weather-card__stats">
        <div>
          <WiHumidity size={22} />
          <span>Humidity: {weather.humidity}%</span>
        </div>
        <div>
          <WiStrongWind size={22} />
          <span>Wind: {weather.windKph} km/h</span>
        </div>
        {weather.cloudCoverPct != null && (
          <div>
            <WiRaindrop size={22} />
            <span>Cloud cover: {weather.cloudCoverPct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
