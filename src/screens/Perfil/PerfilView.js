import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LogOut, ExternalLink } from 'lucide-react-native';

export function PerfilView({
  nombre,
  setNombre,
  rol,
  setRol,
  email,
  loading,
  handleGuardar,
  handleLogout,
  handleVincularStrava,
  handleVincularIntervalos,
  styles,
}) {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN</Text>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#666"
          />
          <Text style={styles.label}>Rol</Text>
          <TextInput
            style={styles.input}
            value={rol}
            onChangeText={setRol}
            placeholder="Atleta, Entrenador..."
            placeholderTextColor="#666"
          />
          <Text style={[styles.label, { marginTop: 8 }]}>Email</Text>
          <Text style={[styles.input, { color: '#888' }]}>{email}</Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleGuardar}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Guardar cambios</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VINCULAR CUENTAS</Text>
          <TouchableOpacity style={styles.button} onPress={handleVincularStrava}>
            <ExternalLink color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Vincular Strava</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleVincularIntervalos}>
            <ExternalLink color="#00F0FF" size={22} />
            <Text style={styles.buttonText}>Intervalos.icu</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonLogout]}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut color="#ff5252" size={22} />
          <Text style={[styles.buttonText, styles.buttonLogoutText]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
