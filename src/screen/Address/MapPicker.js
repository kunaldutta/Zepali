import React, { useState, useEffect, useRef, } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
} from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation'; // ✅ ADDED
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../styles/globalStyles';
import AppHeader from '../../components/AppHeader';
import i18n from '../../localization/i18n';
import { checkServiceableLocationAPI } from '../../services/addressService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GOOGLE_API_KEY = "AIzaSyCMvQFX2ZYppcK_z0jC_Nr5sFO8dB1lPQo";

export default function MapPicker({ route, navigation }) {
  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const isFetchingAddress = useRef(false);
  const isInitialRegionLoaded = useRef(false);
  const lastLatLng = useRef('');
  const isProgrammaticMove = useRef(false);
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const HYDERABAD_REGION = {
  latitude: 17.385044,
  longitude: 78.486671,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};
console.log('ROUTE PARAMS:', route?.params?.address?.latitude, route?.params?.address?.logitude);
  const latitude = Number(route?.params?.address?.latitude) || null;
  const longitude = Number(route?.params?.address?.logitude) || null;
  const [region, setRegion] = useState(
  latitude && longitude
    ? {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : null,
);

const appState = useRef(AppState.currentState); 
const returnedFromSettings = useRef(false);
useEffect(() => {
  const subscription = AppState.addEventListener(
    'change',
    nextState => {

      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active' &&
        returnedFromSettings.current
      ) {
        returnedFromSettings.current = false;

        // Re-check permission/GPS
        checkLocationEnabled();
      }

      appState.current = nextState;
    },
  );

  return () => subscription.remove();
}, []);

  // ✅ LOCATION CHECK ON LOAD
  useEffect(() => {
    checkLocationEnabled();

    return () => {

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

    };
  }, []);

  useEffect(() => {

      if (region) {
    getAddress(region.latitude, region.longitude);
  }

    }, []);

  const tapCurrentLocation = () => {
    checkLocationEnabled();
    return () => {

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

    };
  };

  const checkLocationEnabled = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(
        'Permission Required',
        'Location permission is required.\n\n' +
        'Go to:\n' +
        'App Permissions → Location\n' +
        'Select "Allow only while using the app".\n',
        [
          {
            text: 'Retry',
            onPress: async () => {
        try {
          console.log('Opening app settings...');
          returnedFromSettings.current = true;
          Linking.openSettings()
          .then(() => console.log('Intent launched'))
          .catch(err => console.log('Intent error:', err));
        } catch (e) {
          console.log(e);
        }
      },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false },
      );
      return;
    }
  }

  Geolocation.getCurrentPosition(
    position => {

      const newRegion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      isProgrammaticMove.current = true;
      mapRef.current?.animateToRegion(newRegion, 1000);

      getAddress(
        position.coords.latitude,
        position.coords.longitude,
      );
    },

    error => {

      console.log(error);

      // GPS OFF
      if (
        error.code === 2 ||
        error.message?.includes('No location provider') ||
        error.message?.includes('Location provider is disabled')
      ) {

        Alert.alert(
  'Enable GPS',
  'Please enable GPS to continue with your current location, or you can select location manually.',
  [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    {
      text: 'Enable',
      onPress: () => {
        console.log('Retry pressed');

       returnedFromSettings.current = true;

        Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS')
          .then(() => console.log('Intent launched'))
          .catch(err => console.log('Intent error:', err));
      },
    },
  ],
  { cancelable: false },
);

        return;
      }

      // Permission denied
      

      Alert.alert(
        'Location Error',
        error.message,
      );
    },

    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    },
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
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
        },
        body: JSON.stringify({
          input: text,
        }),
      }
    );

    const data = await response.json();

    const results =
      data?.suggestions?.map(item => ({
        place_id: item.placePrediction?.placeId,
        description:
          item.placePrediction?.text?.text,
      })) || [];

    setSuggestions(results);

  } catch (e) {
    console.log('Search error:', e);
  }
};

  // 🔍 SELECT PLACE
  const selectPlace = async (placeId) => {
  try {
    setSuggestions([]);

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask':
            'location,formattedAddress',
        },
      }
    );

    const data = await response.json();

    if (data.location) {

      const newRegion = {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);

      mapRef.current?.animateToRegion(
        newRegion,
        1000
      );

      getAddress(
        data.location.latitude,
        data.location.longitude
      );

      setSearchText(
        data.formattedAddress || ''
      );
    }

  } catch (e) {
    console.log('Place error:', e);
  }
};

  // 🔥 FETCH ADDRESS
  const getAddress = async (lat, lng) => {
  try {
    console.log(
      'Geocode Request:',
      lat.toFixed(6),
      lng.toFixed(6)
    );
    if (isFetchingAddress.current) {
      return;
    }

    isFetchingAddress.current = true;
    setLoading(true);

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );

    const data = await res.json();

    console.log('GEOCODE STATUS:', data?.status);

    if (
      data.status === 'OK' &&
      data.results &&
      data.results.length > 0
    ) {
      const newAddress = data.results[0].formatted_address;

      setAddress(prev => {
        if (prev === newAddress) {
          return prev;
        }
        return newAddress;
      });
    }

  } catch (e) {

    console.log('ADDRESS ERROR:', e);

  } finally {

    isFetchingAddress.current = false;
    setLoading(false);
  }
};

  const onRegionChangeComplete = (reg) => {

  if (isProgrammaticMove.current) {
    isProgrammaticMove.current = false;

    setRegion(reg);
    return;
  }

  // Ignore first auto callback from MapView
  if (!isInitialRegionLoaded.current) {
    isInitialRegionLoaded.current = true;
    return;
  }

  const currentLatLng =
      `${reg.latitude.toFixed(5)},${reg.longitude.toFixed(5)}`;

    if (lastLatLng.current === currentLatLng) {
      return;
    }

    lastLatLng.current = currentLatLng;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setRegion(reg);
      getAddress(reg.latitude, reg.longitude);
    }, 700);
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
            value={searchText}
            onChangeText={searchPlaces}
            style={{
              backgroundColor: colors.white || '#fff',
              color: colors.text || '#000',   // important
              padding: 10,
              borderRadius: 8,
            }}
            placeholderTextColor={colors.placeholderTextColor || '#A1887F'}
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
          onMapReady={() => console.log('MAP READY')}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
          initialRegion={region || HYDERABAD_REGION}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
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
          onPress={checkLocationEnabled}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#7f5405',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
          }}>
          <Ionicons
            name="navigate"
            size={24}
            color="#0bf3e4"
          />
        </TouchableOpacity>
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