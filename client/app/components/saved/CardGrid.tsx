import React from "react";
import GridColumn from "./GridColumn";
import { useState } from "react";
import httpClient from "@/app/httpClient";
import { View } from "react-native"


const CardGrid = ({isClicked, setIsClicked} : {isClicked : any, setIsClicked : any}) => {

  const [cnt, setCnt] = useState(0);

  const getCnt = async() => {
    try {
          const resp = await httpClient.get("http://127.0.0.1:5000/getSavedCnt");
          setCnt(resp.data);
    } catch (error: any){
      console.log("ERROR", error.message);
    }
  }

  getCnt();



  return (
    <View>
      <GridColumn totalSites={cnt} isClicked={isClicked} setIsClicked={setIsClicked}/>
    </View>
  );
};

export default CardGrid;
