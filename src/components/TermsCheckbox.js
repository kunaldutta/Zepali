import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import i18n from "../localization/i18n";

const TermsCheckbox = ({ accepted, setAccepted, onOpenTerms }) => {
  return (
    <View style={{ width: "90%", left: "5%", marginBottom: 10 }}>
      <TouchableOpacity
        onPress={() => setAccepted(!accepted)}
        style={{ flexDirection: "row", alignItems: "center" }}
        activeOpacity={0.8}
      >
        {/* Checkbox */}
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: "#0d82ac",
            marginRight: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {accepted ? (
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#0d82ac",
              }}
            />
          ) : null}
        </View>

        {/* Text */}
        <Text style={{ flex: 1 }}>
          {i18n.t("I_AGREE_TO_TERMS")}
          <Text
            style={{ color: "blue", textDecorationLine: "underline" }}
            onPress={onOpenTerms}
          >
            {i18n.t("TERMS_AND_CONDITIONS")}
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TermsCheckbox;