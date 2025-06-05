
import React, { useState, useRef, useEffect} from 'react';
import { Dimensions, StyleSheet, View, Pressable, Text, Linking} from 'react-native';
import { Ionicons, AntDesign, } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import PostInfo from './PostInfo';
import httpClient from '@/app/httpClient';
import {Image} from 'expo-image';


const SingleReel = ({ postId, index, currentIndex } : {postId : any, index : any, currentIndex : any}) => {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [price, setPrice] = useState(0);
    const [total, setTotal] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [photo, setPhoto] = useState("");
    const [userId, setUserId] = useState(-1);

    const getData = async (id: number) => {
        try {
        const resp = await httpClient.get("http://127.0.0.1:5000/getData", {
            params: { id: id },
        });

        setTitle(resp.data.title);
        setUrl(resp.data.url)
        setPrice(resp.data.price);
        setShipping(resp.data.shipping);
        setTotal(resp.data.total);
        setPhoto(resp.data.photo);  
        } catch (error) {
        console.error("Error getting data: ", error);
        }
    };

    getData(postId);



  return (
    <View style={styles.container}>
      <Pressable 
        onPress = {() => Linking.openURL(url)}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          backgroundColor : "black",
        }}
        
      >
        <Image style = {{width:"100%", height:"100%", position:"absolute"}} source={{uri : photo}} />
      </Pressable>


      
     
     
     <PostInfo postId={1} index={index} currentIndex={currentIndex}/>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: height - 119,
    width: width,
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',

  },
  playPauseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumn: {
    fontSize: 20,
    padding: 10,
  	position: 'absolute',
  	top: height /14,
  	right: 5,
  	backgroundColor: 'rgba(52,52,52,0.6)',
  	borderRadius: 100,
  },
});

export default SingleReel;