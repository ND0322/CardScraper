import React, { useEffect, useState } from 'react';

import { SwiperFlatList } from 'react-native-swiper-flatlist';
import httpClient from '@/app/httpClient';
import { View, Text, FlatList, StyleSheet, Dimensions} from 'react-native';
import SavedCard from "./SavedCard";
import SavedReelsComponent from "./SavedReelsComponent"
import SavedReel from './SavedReel';



const SavedCardComponent = () => {
  
    const [cnt, setCnt] = useState(0);
    const [isClicked, setIsClicked] = useState(-1);

    const getCnt = async() => {
        try {
            const resp = await httpClient.get("http://127.0.0.1:5000/getSavedCnt");
            setCnt(resp.data);
        } catch (error: any){
        console.log("ERROR", error.message);
        }
    }

    const screenWidth = Dimensions.get('window').width;
    const numColumns = 3;
    const cardSize = screenWidth / numColumns - 20;



  getCnt();

  const l = Array.from(Array(cnt).keys())
  if(isClicked == -1){
    return (
    <View >
            <FlatList
            data={l}
            numColumns={3}
            contentContainerStyle={styles.container}
            renderItem={({index }) => (
            <>

            <SavedCard postId={index} isClicked={isClicked} setIsClicked={setIsClicked}/>
            </>
        )}
        keyExtractor={(item, index) => index.toString()}
            />
    </View>
    );
  }
  else return(
    <View>
        <SavedReel postId={isClicked} isClicked={isClicked} setIsClicked={setIsClicked}></SavedReel>
    </View>
  )
  
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardContainer: {
    margin: 5,
    aspectRatio: 1, // Makes the card square
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#222',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color : "#ffaa00",
  },
});


export default SavedCardComponent