import { View, Text } from "react-native";
import React, { useState } from "react";
import httpClient from "../httpClient";
import { Button } from "@react-navigation/elements";
import Post from "../components/post";
import PostInfo from "../components/reels/PostInfo";
import SingleReel from "../components/reels/SingleReel";
import ReelsComponent from "../components/reels/ReelsComponent";
import SavedCard from "../components/saved/SavedCard";

export default function Feed() {
  const [cnt, setCnt] = useState(0);
  

  const getCnt = async() => {
    try {
          const resp = await httpClient.get("http://127.0.0.1:5000/getCnt");
          setCnt(resp.data);
    } catch (error: any){
      console.log("ERROR", error.message);
    }
  }

  const fuck = async() => {
    try {
      const resp = await httpClient.post("http://127.0.0.1:5000/fuck");
    }
    catch (error : any){
      console.log("error", error.message);
    }
  }

  getCnt();



  return (
    <View >
      <ReelsComponent></ReelsComponent>




      
    </View>
  );
}


