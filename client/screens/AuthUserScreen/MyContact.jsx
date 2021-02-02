import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const MyContact = () => { 
  const navigation = useNavigation(); 

  return (
      // Change onPress!!
    <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate('SendMoney', {
            selectedContact: 'Juan'
        })}
    >
        <View style={styles.avatar}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>NG</Text>
        </View>
        <View>
            <Text style={styles.name}>Nicolas Gonzalez</Text>
            <Text style={styles.phone}>+5491178934467</Text>
        </View>
    </TouchableOpacity>
  );
};

export default MyContact;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 18,
        marginVertical: 15,
        height: 41
    },
    avatar: {
        marginRight: 20,
        borderRadius: '50%',
        backgroundColor: '#25D681',
        padding: 10,
        heigth: 41,
        width: 41,
        justifyContent: 'center',
        alignItems: 'center'
    },
    name: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left'
    },
    phone: {
        color: '#A7A7A7',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        marginTop: 5
    }
});