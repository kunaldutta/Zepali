import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation'; // ✅ ADDED
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import { checkServiceableLocationAPI } from '../../services/addressService';

const GOOGLE_API_KEY = "AIzaSyASeQVPcvxEogcrrLg5MExUWcXAgYuJekY";

export default function MapPicker({ route, navigation }) {
  const mapRef = useRef(null);
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [region, setRegion] = useState({
    latitude: route.params?.latitude || 17.465809,
    longitude: route.params?.longitude || 78.362732,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // ✅ LOCATION CHECK ON LOAD
  useEffect(() => {
    checkLocationEnabled();
  }, []);

  const checkLocationEnabled = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Required", "Location permission is required");
        return;
      }
    }

    Geolocation.getCurrentPosition(
      () => {
        // GPS ON → do nothing
      },
      (error) => {

        // ✅ GPS OFF DETECTION
        if (
          error?.code === 2 ||
          error?.message?.includes('No location provider') ||
          error?.message?.includes('Location provider is disabled')
        ) {
          Alert.alert(
            "Location Off",
            "Please enable location services (GPS)"
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );
  };

  // 🔍 SEARCH API
  const searchPlaces = async (text) => {
    setSearchText(text);

    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();
      setSuggestions(data.predictions || []);
    } catch (e) {
      console.log("Search error:", e);
    }
  };

  // 🔍 SELECT PLACE
  const selectPlace = async (placeId) => {
    try {
      setSuggestions([]);

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();

      if (data.result) {
        const loc = data.result.geometry.location;

        const newRegion = {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);

        mapRef.current?.animateToRegion(newRegion, 1000);

        getAddress(loc.lat, loc.lng);
        setSearchText(data.result.formatted_address);
        setSuggestions([]);
      }

    } catch (e) {
      console.log("Place error:", e);
    }
  };

  // 🔥 FETCH ADDRESS
  const getAddress = async (lat, lng) => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );

      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      }

    } catch (e) {
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const onRegionChangeComplete = (reg) => {
    setRegion(reg);
    getAddress(reg.latitude, reg.longitude);
  };

  const confirmLocation = async () => {
  try {

    if (!address) {
      Alert.alert('Error', 'Please select location');
      return;
    }

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      Alert.alert('Error', 'Unable to fetch address');
      return;
    }

    const result = data.results[0];

    const parts = result.formatted_address.split(',');

    const address1 =
      parts.length >= 2
        ? parts.slice(0, 2).join(',')
        : result.formatted_address;

    const a1 =
      parts.length >= 3
        ? parts[2].trim()
        : '';

    const a2 =
      parts.length >= 4
        ? parts[3].trim()
        : '';

    const a3 =
      parts.length >= 5
        ? parts[4].trim()
        : '';

    const address2 = [a1, a2, a3]
      .filter(Boolean)
      .join(', ');

    let city = '';
    let state = '';
    let zip = '';
    let area = '';

    result.address_components.forEach(comp => {

      if (
        comp.types.includes('locality')
      ) {
        city = comp.long_name;
      }

      if (
        comp.types.includes('administrative_area_level_1')
      ) {
        state = comp.long_name;
      }

      if (
        comp.types.includes('postal_code')
      ) {
        zip = comp.long_name;
      }
      if (comp.types.includes('neighborhood')) {
        area = comp.long_name;
      }
    });

    /*
     * CHECK SERVICEABILITY
     */
    const serviceResponse =
      await checkServiceableLocationAPI({
        city: city,
        pincode: zip,
      });

    if (!serviceResponse?.status) {

      Alert.alert(
        'Delivery Not Available',
        serviceResponse?.message ||
        'Sorry, delivery is not available in this area.'
      );

      return;
    }

    if (route?.params?.address) {

      navigation.navigate('EditAddressScreen', {
        address: {
          id: route.params.address.id,
          user_name: route.params.address.user_name,
          usr_id: route.params.address.usr_id,
          land_mark: route.params.address.land_mark,
          default_value: route.params.address.default_value,
          contact_no: route.params.address.contact_no,
          address_1: route.params.address.address_1,
          address_2: address1 + ', ' + address2,
          city,
          state,
          area,
          zip_code: zip,
          latitude: region.latitude,
          longitude: region.longitude,
        },
      });

    } else {

      navigation.navigate('AddAddress', {
        address_1: address1 + ', ',
        address_2: address2,
        city,
        state,
        zip_code: zip,
        area,
        latitude: region.latitude,
        longitude: region.longitude,
      });

    }

  } catch (e) {

    console.log('ERROR:', e);

    Alert.alert(
      'Error',
      'Unable to verify delivery location'
    );

  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.safeAreaColor }}>
      <AppHeader
        title={i18n.t('ADD_ADDRESS') || 'ADD ADDRESS'}
        onBackPress={() => navigation.goBack()}
        showCart={false}
      />
      <View style={{ flex: 1 }}>

        {/* SEARCH */}
        <View style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          zIndex: 10,
        }}>
          <TextInput
            placeholder="Search location..."
            placeholderTextColor={colors.placeholderTextColor}
            value={searchText}
            onChangeText={searchPlaces}
            style={{
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 8,
            }}
          />

          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              style={{ backgroundColor: 'white', maxHeight: 200 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectPlace(item.place_id)}
                  style={{ padding: 10 }}
                >
                  <Text>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          onRegionChangeComplete={onRegionChangeComplete}
        />

        {/* PIN */}
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginLeft: -15,
          marginTop: -30,
        }}>
          <Text style={{ fontSize: 30 }}>📍</Text>
        </View>

        {/* ADDRESS */}
        <View style={{
          position: 'absolute',
          top: 90,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 8,
        }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text numberOfLines={2}>
              {address || "Move map to select location"}
            </Text>
          )}
        </View>

        {/* CONFIRM */}
        <TouchableOpacity
          onPress={confirmLocation}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: 'green',
            padding: 15,
            alignItems: 'center',
            borderRadius: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Confirm Location
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}