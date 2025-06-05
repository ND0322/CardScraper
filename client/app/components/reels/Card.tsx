import httpClient from '@/app/httpClient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const Card = ({postId} : {postId : any}) => {

  const [isSaved, setIsSaved] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [photo, setPhoto] = useState("");
  const [user, setUser] = useState("none");

  const getSaved = async(id : number) => {
     try {
        const resp = await httpClient.get("http://127.0.0.1:5000/getSaved", {
            params: { id: id },
        });
        setIsSaved(resp.data.msg);
      }
      catch (error) {
      //console.error("Error getting data: ", error);
      setIsSaved(false);
      }

      
  }

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

  const onSave = () =>{
    if(user == 'none'){
      alert("Please Login");
      return;
    }

    if(isSaved) unsave();
    else save();
    setIsSaved(!isSaved);
  }

  const save = async() => {
    try {
      const resp = await httpClient.post("http://127.0.0.1:5000/save", {
        postId,
      });
    }
    catch (error : any){
      console.log("error", error.message);
    }
  }

  const unsave = async() => {
    try {
      const resp = await httpClient.post("http://127.0.0.1:5000/unsave", {
        postId,
      });
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
      getData(postId);
      getSaved(postId);
    }, [])

    
  );

  
  

  

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          

          <Text style={{
            color: '#ffaa00',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            lineHeight : 18,
            height : 36,
            
            
            }}
            
            numberOfLines={2} ellipsizeMode='tail' >{title}</Text>
        </View>
       
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style = {{alignItems : "center"}}>
          <TouchableOpacity onPress={() =>Linking.openURL(url)}>
            <Image style = {{width : 300, height:310, borderRadius : 12}} source={photo ? { uri: photo } : require('@/assets/images/placeholder.png')}></Image>
          </TouchableOpacity>
            
        </View>
        
        <View style = {{alignItems : "center"}}>
          <Text style={styles.label}>Cost:</Text>
          <Text style={styles.cost}>${price}</Text>
          <Text style={styles.label}>Shipping:</Text>
          <Text style={{color : "white", fontSize: 17,marginTop : 6, fontWeight: 'bold'}}>${shipping}</Text>

          <Text style={styles.label}>Total:</Text>
          <Text style={styles.profit}>${total}</Text>
        </View>
        

       

        <View style={styles.separator} />

        <View style = {{alignItems : "center"}}>

          <Text style={{color: '#ccc',
    fontSize: 16,
    marginTop: 5,}}>Predicted Value:</Text>
          <Text style={{color : "white", fontSize: 17,marginTop : 6, fontWeight: 'bold'}}>...</Text>

          <Text style={styles.label}>Profit:</Text>
          <Text style={styles.profit}>+...</Text>

        </View>

        <View style={{height: 1, backgroundColor: '#444', marginTop : 8, marginBottom : 0}} />

        
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
        onPress={onSave}
        style={styles.clipboardButton}
      >
        <Ionicons name = {isSaved ? "bookmark" : "bookmark-outline"} size = {30} color = "white"></Ionicons>
        
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    margin: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#222',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  itemName: {
    color: '#ffaa00',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeDark: {
    backgroundColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 12,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  text: {
    color: '#eee',
    fontSize: 15,
  },
  cost: {
    color: 'red',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop : 6
  },
  profit: {
    color: 'lime',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop : 6
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 8,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#222',
    height : 60.5,
  },
  clipboardButton: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 6,
    width : 400,
    height : 45,
    alignItems : "center",
  },
  clipboardIcon: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Card;