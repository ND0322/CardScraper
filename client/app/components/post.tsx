import { Text, View, Image} from 'react-native'
import React, { Component, useState } from 'react'
import httpClient from '../httpClient';
import Header from './reels/Header';
import ActivityIcons from './reels/ActivityIcon';


interface PostProps {
  customId: number;
}

/*
 content = db.Column(db.Text, nullable=False)  # Title
    url = db.Column(db.String, unique=True)
    price = db.Column(db.Float)
    total = db.Column(db.Float)
    shipping = db.Column(db.Float)
    photo = db.Column(db.String)

*/



const Post = ({customId} : PostProps) => {
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

    getData(customId);

    console.log(title);
    console.log(photo);

    return (

        <View>
            
            
            <Text>{title} ece</Text>

            <Image source = {{uri : photo}} style={{height:200,width:200}}/>
            

             
        </View>
    );

}

export default Post;
  
