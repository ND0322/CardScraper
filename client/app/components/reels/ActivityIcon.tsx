import React, { useState } from "react";
import {
  StyleSheet,                                                                 Dimensions,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";                                                      import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";


const ActivityIcons = ({ item, index, currentIndex }: {item : any, index : any, currentIndex : any}) => {
  // <AntDesign name="heart" size={24} color="black" />

  const [isSaved, setIsSaved] = useState(false);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 91,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    ><TouchableOpacity
        onPress={() => setIsSaved(!isSaved)}
        style={{ padding: 10 }}
      >
        <AntDesign
          name={isSaved ? "heart" : "hearto"}size={25}
          color={isSaved ? "red" : "#fff"}
        />                                                                                       <Text style={{ color: "#fff" }}> {item.likes} </Text>
      </TouchableOpacity>
      
    </View>
  );
};

export default ActivityIcons;