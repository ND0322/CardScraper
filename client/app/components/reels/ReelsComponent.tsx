import React, { useEffect, useState } from 'react';

import { SwiperFlatList } from 'react-native-swiper-flatlist';

import SingleReel from './SingleReel';
import httpClient from '@/app/httpClient';
import { View, Text} from 'react-native'
import Card from './Card';

const ReelsComponent = () => {
  const [currentIndex, setCurrentIndex] = useState();
  const [cnt, setCnt] = useState(0);

  const handleChangeIndexValue = ({index} : any) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fuck();
    }, 600000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);



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
      const resp = await httpClient.post("http://127.0.0.1:5000/getRandom");
    }
    catch (error : any){
      console.log("error", error.message);
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

export default ReelsComponent;