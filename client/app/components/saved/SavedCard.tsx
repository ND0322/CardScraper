import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import httpClient from '@/app/httpClient';

interface SiteCardProps {
  postId: number;
  isClicked:number;
  setIsClicked: (val: number) => void;
}

const SavedCard: React.FC<SiteCardProps> = ({ postId, isClicked, setIsClicked }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [photo, setPhoto] = useState('');
  const [userId, setUserId] = useState('none'); // You had "user" in web version, renamed to "userId" for clarity

  const getData = async (id: number) => {
    try {
      const resp = await httpClient.get('http://127.0.0.1:5000/getSavedData', {
        params: { id: id },
      });

      setTitle(resp.data.title);
      setUrl(resp.data.url);
      setPrice(resp.data.price);
      setShipping(resp.data.shipping);
      setTotal(resp.data.total);  
      setPhoto(resp.data.photo);
    } catch (error) {
      //console.error('Error getting data: ', error);
    }
  };

  useEffect(() => {
    getData(postId);
  }, [postId]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setIsClicked(postId)}

      >
        <Image
          source={{ uri: photo}}
          style={styles.image}
        />
        
      </TouchableOpacity>

      
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    marginVertical: 2,
    marginHorizontal: 2,
    borderRadius: 10,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '75%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 16,
    borderRadius:12
  },
  title: {
    fontSize: 16,
    color : "white",
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SavedCard;
