import React, { useEffect, useState } from 'react';

import { SwiperFlatList } from 'react-native-swiper-flatlist';


import httpClient from '@/app/httpClient';
import { View, Text} from 'react-native'
import Card from '../reels/Card';


const SavedReelsComponent = ({startIndex, isClicked, setIsClicked} : {startIndex : any, isClicked : any, setIsClicked : any}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [cnt, setCnt] = useState(0);

  const handleChangeIndexValue = ({index} : any) => {
    setCurrentIndex(index);
  };




  const getCnt = async() => {
    try {
          const resp = await httpClient.get("http://127.0.0.1:5000/getSavedCnt");
          setCnt(resp.data);
    } catch (error: any){
      console.log("ERROR", error.message);
    }
  }



  getCnt();

  const l = Array.from(Array(cnt).keys())
  return (
    <View>
        <SwiperFlatList
        data = {l}
        vertical={true}
        onChangeIndex={handleChangeIndexValue}
        renderItem={({index }) => (
            <>

            <Card postId={index}/>
            </>
        )}
        keyExtractor={(item, index) => index.toString()}
        />
    </View>
    );
  
}

export default SavedReelsComponent;