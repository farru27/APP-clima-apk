// App.js (React Native + Expo)
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Keyboard, Image } from 'react-native';
import * as Location from 'expo-location';

const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // --> poné tu API key aquí (no subir a Git público)

export default function App() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [cityInput, setCityInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Pedimos permiso y obtenemos ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado. Busque por ciudad.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  async function fetchWeatherByCoords(lat, lon) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await res.json();
      if (res.ok) {
        setWeather(formatWeather(data));
        setErrorMsg(null);
      } else {
        setErrorMsg(data.message || 'Error al obtener clima');
      }
    } catch (e) {
      setErrorMsg('Error de red');
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherByCity(city) {
    if (!city) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await res.json();
      if (res.ok) {
        setWeather(formatWeather(data));
        setErrorMsg(null);
      } else {
        setErrorMsg(data.message || 'Ciudad no encontrada');
      }
    } catch (e) {
      setErrorMsg('Error de red');
    } finally {
      setLoading(false);
    }
  }

  function formatWeather(data) {
    return {
      city: data.name,
      country: data.sys?.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      desc: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon, // para iconos: http://openweathermap.org/img/wn/{icon}@2x.png
      humidity: data.main.humidity,
      wind: data.wind.speed,
    };
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi App de Clima</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar ciudad (ej: Montevideo)"
          value={cityInput}
          onChangeText={setCityInput}
          style={styles.input}
          onSubmitEditing={() => fetchWeatherByCity(cityInput)}
        />
        <TouchableOpacity style={styles.btn} onPress={() => fetchWeatherByCity(cityInput)}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : weather ? (
        <View style={styles.card}>
          <Text style={styles.city}>{weather.city}, {weather.country}</Text>
          <View style={styles.rowCenter}>
            {weather.icon ? (
              <Image
                source={{ uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png` }}
                style={{ width: 120, height: 120 }}
              />
            ) : null}
            <Text style={styles.temp}>{weather.temp}°C</Text>
          </View>
          <Text style={styles.desc}>{weather.desc}</Text>
          <Text style={styles.small}>Sensación: {weather.feels_like}°C · Humedad: {weather.humidity}% · Viento: {weather.wind} m/s</Text>
          <TouchableOpacity style={styles.reload} onPress={() => {
            // recargar por ubicación
            setLoading(true);
            Location.getCurrentPositionAsync({}).then(loc => fetchWeatherByCoords(loc.coords.latitude, loc.coords.longitude));
          }}>
            <Text style={styles.reloadText}>Usar mi ubicación</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={{ marginTop: 20 }}>Sin datos aún.</Text>
      )}

      <Text style={styles.footer}>Datos: OpenWeatherMap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f6f7fb' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, backgroundColor: '#fff' },
  btn: { backgroundColor: '#1f6feb', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  error: { color: 'crimson', marginTop: 20, textAlign: 'center' },
  card: { marginTop: 18, backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.08 },
  city: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  temp: { fontSize: 44, fontWeight: '700' },
  desc: { textAlign: 'center', marginTop: 6, fontSize: 16, textTransform: 'capitalize' },
  small: { textAlign: 'center', marginTop: 8, color: '#555' },
  reload: { marginTop: 12, alignSelf: 'center' },
  reloadText: { color: '#1f6feb', fontWeight: '600' },
  
  footer: { textAlign: 'center', marginTop: 24, color: '#888' }
});
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_KEY;

