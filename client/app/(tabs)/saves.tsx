import { View, Text } from "react-native";
import React, { useCallback, useState } from "react";
import Card from "../components/reels/Card";
import httpClient from "../httpClient";
import { Button } from "@react-navigation/elements";
import { useFocusEffect } from "expo-router";
import SavedCard from "../components/saved/SavedCard"
import CardGrid from "../components/saved/CardGrid";
import SavedCardComponent from "../components/saved/SavedCardComponent";


export default function Saves() {

  const [cnt, setCnt] = useState(0);
  const [savedCnt, setSavedCnt] = useState(0);
  const [user, setUser] = useState("");


  const getCnt = async() => {
    try {
          const resp = await httpClient.get("http://127.0.0.1:5000/getCnt");
          setCnt(resp.data);
    } catch (error: any){
      console.log("ERROR", error.message);
    }
  }

  const getSavedCnt = async() => {
    try {
          const resp = await httpClient.get("http://127.0.0.1:5000/getSavedCnt");
          setSavedCnt(resp.data);
    } catch (error: any){
      console.log("ERROR", error.message);
    }
  }

  const fuck = async() => {
    try {
      const resp = await httpClient.post("http://127.0.0.1:5000/getRandom");
    }
    catch (error : any){
      console.log("error", error.message);
    }
  }

  useFocusEffect(
      useCallback(() => {
        const checkUser = async () => {
          try {
            const resp = await httpClient.get("http://127.0.0.1:5000/@me");
            setUser(resp.data);
          } catch (error: any) {
            console.log("Not authenticated:", error.message);
            setUser("none");
          }
        };
  
        checkUser();

      }, [])
    );



  getCnt();
  getSavedCnt();
  if(user == "none"){
    return (
      <View>  
        <Text>{cnt}</Text>
        <Text>{savedCnt}</Text>

        <Button onPress = {fuck}>
          Fuck
        </Button>

        

        

      </View>
    );
  }
  else{
    return (
      <View>  

        <SavedCardComponent></SavedCardComponent>

        

        

      </View>
    );
  }
}
