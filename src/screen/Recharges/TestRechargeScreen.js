import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { BASE_URL } from "../../network/apiClient";


export default function TestRechargeScreen() {
  const [number, setNumber] = useState("9840000000");
  const [amount, setAmount] = useState("60");
  const [provider, setProvider] = useState("ntc");
  const [type, setType] = useState("datapack");
  const [response, setResponse] = useState("");

  const testRecharge = async () => {
    try {
      const url = `${BASE_URL}/test_recharge.php?number=${number}&amount=${amount}&provider=${provider}&type=${type}&package_id=27`;

      const res = await fetch(url);
      
      const json = await res.json();

      setResponse(JSON.stringify(json, null, 2));
    } catch (e) {
      setResponse(e.message);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Number</Text>
      <TextInput value={number} onChangeText={setNumber} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Provider (ntc / ncell)</Text>
      <TextInput value={provider} onChangeText={setProvider} style={{ borderWidth: 1, marginBottom: 10 }} />

      <Text>Type (topup / datapack)</Text>
      <TextInput value={type} onChangeText={setType} style={{ borderWidth: 1, marginBottom: 20 }} />

      <Button title="Test Recharge" onPress={testRecharge} />

      <Text style={{ marginTop: 20 }}>Response:</Text>
      <Text>{response}</Text>
    </ScrollView>
  );
}