import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

import i18n from '../localization/i18n';

export default function LanguageModal({visible, onSelect}) {

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>

          <Text style={styles.modalTitle}>
            {i18n.t('selectLanguage')}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSelect('en')}
          >
            <Text style={styles.text}>{i18n.t('english')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSelect('hi')}
          >
            <Text style={styles.text}>{i18n.t('hindi')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onSelect('ne')}
          >
            <Text style={styles.text}>{i18n.t('nepali')}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  modalContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.4)'
  },

  modalBox:{
    width:280,
    backgroundColor:'#fff',
    borderRadius:10,
    padding:20,
    alignItems:'center'
  },

  modalTitle:{
    fontSize:18,
    fontWeight:'600',
    marginBottom:15
  },

  button:{
    width:'100%',
    padding:12,
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    marginTop:10,
    alignItems:'center'
  },

  text:{
    fontSize:16
  }

});